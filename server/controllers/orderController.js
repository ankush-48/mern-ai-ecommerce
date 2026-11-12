import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { normalizeItems, priceCart, badRequest } from '../utils/cart.js';

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw Object.assign(new Error('Online payment is not configured. Please choose cash on delivery.'), { status: 503 });
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
};
const quote = async (items, session = null) => {
  const normalized = normalizeItems(items);
  const products = await Product.find({ _id: { $in: normalized.map(i => i.product) } }).session(session);
  return priceCart(normalized, products);
};
const cartDigest = (cart) => crypto.createHash('sha256').update(JSON.stringify(cart.orderItems.map(i => [String(i.product), i.qty, i.price]).sort())).digest('hex');

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const cart = await quote(req.body.orderItems);
    const order = await getRazorpayInstance().orders.create({
      amount: Math.round(cart.totalPrice * 100), currency: 'INR', receipt: 'rcpt_' + Date.now(),
      notes: { userId: String(req.user._id), cartDigest: cartDigest(cart) }
    });
    res.json({ ...order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) { next(error); }
};

export const createOrder = async (req, res, next) => {
  let session;
  try {
    const { orderItems, shippingAddress, paymentMethod, paymentResult = {} } = req.body;
    if (!['COD', 'Razorpay'].includes(paymentMethod)) throw badRequest('Choose a valid payment method');
    if (!['address','city','postalCode','country','phone'].every(k => typeof shippingAddress?.[k] === 'string' && shippingAddress[k].trim() && shippingAddress[k].length <= 300)) throw badRequest('A complete shipping address is required');
    const cart = await quote(orderItems);
    let isPaid = false;
    if (paymentMethod === 'Razorpay') {
      const gateway = getRazorpayInstance();
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentResult;
      if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every(v => typeof v === 'string' && v.length < 200)) throw badRequest('Invalid payment details');
      const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
      if (!/^[a-f0-9]{64}$/.test(razorpay_signature) || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature))) throw badRequest('Payment verification failed');
      const [paidOrder, payment] = await Promise.all([gateway.orders.fetch(razorpay_order_id), gateway.payments.fetch(razorpay_payment_id)]);
      if (paidOrder.notes?.userId !== String(req.user._id) || paidOrder.notes?.cartDigest !== cartDigest(cart) || Number(paidOrder.amount) !== Math.round(cart.totalPrice * 100) || payment.order_id !== razorpay_order_id || payment.status !== 'captured' || payment.currency !== 'INR' || Number(payment.amount) !== Number(paidOrder.amount)) throw badRequest('Payment does not match this cart or is not captured yet');
      isPaid = true;
    }
    session = await mongoose.startSession();
    let order;
    await session.withTransaction(async () => {
      const current = await quote(orderItems, session);
      if (cartDigest(current) !== cartDigest(cart)) throw badRequest('Prices changed. Please review your cart again');
      for (const item of current.orderItems) {
        const result = await Product.updateOne({ _id: item.product, stock: { $gte: item.qty } }, { $inc: { stock: -item.qty } }, { session });
        if (result.modifiedCount !== 1) throw badRequest('Stock changed. Please review your cart again');
      }
      [order] = await Order.create([{
        user: req.user._id, ...current, shippingAddress, paymentMethod,
        paymentResult: isPaid ? { razorpay_order_id: paymentResult.razorpay_order_id, razorpay_payment_id: paymentResult.razorpay_payment_id, razorpay_signature: paymentResult.razorpay_signature, status: 'captured' } : {},
        isPaid, paidAt: isPaid ? new Date() : null, orderStatus: isPaid ? 'Confirmed' : 'Processing'
      }], { session });
    });
    res.status(201).json(order);
  } catch (error) { next(error); }
  finally { if (session) await session.endSession(); }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const totalRevenue = orders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } }).select('name stock');

    res.json({
      orders,
      analytics: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts,
        lowStockProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.orderStatus = req.body.orderStatus || order.orderStatus;
    if (order.orderStatus === 'Delivered') {
      order.deliveredAt = Date.now();
      order.isPaid = true;
      order.paidAt = order.paidAt || Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};
