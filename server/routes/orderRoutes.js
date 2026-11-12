import express from 'express';
import {
  createRazorpayOrder,
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/razorpay', protect, createRazorpayOrder);
router.route('/').post(protect, createOrder).get(protect, adminOnly, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
