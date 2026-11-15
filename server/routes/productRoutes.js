import express from 'express';
import {
  getProducts,
  getSearchSuggestions,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  syncOnlineCatalog,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/suggestions', getSearchSuggestions);
router.post('/sync-online', protect, adminOnly, syncOnlineCatalog);
router.route('/').get(getProducts).post(protect, adminOnly, createProduct);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);
router.post('/:id/reviews', protect, createProductReview);

export default router;
