import express from 'express';
import {
  createRazorpayOrder,
  createStripePaymentIntent,
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/razorpay', protect, createRazorpayOrder);
router.post('/stripe', protect, createStripePaymentIntent);
router.route('/').post(protect, createOrder).get(protect, adminOnly, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
