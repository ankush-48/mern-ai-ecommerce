import express from 'express';
import {
  aiChat,
  aiSemanticSearch,
  aiGenerateListing,
  aiReviewSummary,
} from '../controllers/aiController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/chat', aiChat);
router.post('/semantic-search', aiSemanticSearch);
router.get('/review-summary/:productId', aiReviewSummary);

router.post(
  '/generate-listing',
  protect,
  adminOnly,
  upload.single('image'),
  aiGenerateListing
);

export default router;
