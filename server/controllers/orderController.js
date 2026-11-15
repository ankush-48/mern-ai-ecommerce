import crypto from 'crypto';
import Razorpay from 'razorpay';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error('Valid amount is required');
    }

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('xxxx')) {
      res.status(400);
      throw new Error('Razorpay test keys are not configured in server/.env. Use the Instant Payment Gateway or COD.');
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `nv_rcpt_${Date.now()}`,
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const createStripePaymentIntent = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('xxxx')) {
      res.status(400);
      throw new Error('Stripe secret key is not configured in server/.env. Use the Instant Payment Gateway or COD.');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      couponCode,
      discountAmount,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('Cart is empty');
    }

    let isPaid = false;
    let paidAt = null;

    if (paymentMethod === 'Razorpay') {
      const { gatewayOrderId, transactionId, signature } = paymentResult || {};
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${gatewayOrderId}|${transactionId}`)
        .digest('hex');

      if (expected !== signature) {
        res.status(400);
        throw new Error('Razorpay payment signature verification failed');
      }
      isPaid = true;
      paidAt = Date.now();
    } else if (paymentMethod === 'GatewaySandbox' || paymentMethod === 'Stripe') {
      if (!paymentResult?.transactionId) {
        res.status(400);
        throw new Error('Payment transaction ID missing');
      }
      isPaid = true;
      paidAt = Date.now();
    }

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product || product.stock < item.qty) {
        res.status(400);
        throw new Error(`Insufficient inventory for ${item.name}`);
      }
      product.stock -= item.qty;
      product.soldCount += item.qty;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult: isPaid ? { ...paymentResult, status: 'captured' } : { status: 'pending_cod' },
      couponCode: couponCode || '',
      discountAmount: discountAmount || 0,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid,
      paidAt,
      orderStatus: isPaid ? 'Confirmed' : 'Processing',
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const [orders, totalProducts, lowStockProducts, categorySales] = await Promise.all([
      Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(100),
      Product.countDocuments(),
      Product.find({ stock: { $lte: 5 } }).limit(10).select('name stock category'),
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            products: { $sum: 1 },
            unitsSold: { $sum: '$soldCount' },
            estRevenue: { $sum: { $multiply: ['$price', '$soldCount'] } },
          },
        },
        { $sort: { estRevenue: -1 } },
      ]),
    ]);

    const orderRevenue = orders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    res.json({
      orders,
      analytics: {
        totalRevenue: orderRevenue,
        totalOrders: orders.length,
        totalProducts,
        lowStockProducts,
        categorySales: categorySales.map((c) => ({
          category: c._id,
          products: c.products,
          unitsSold: c.unitsSold,
          revenue: c.estRevenue,
        })),
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
