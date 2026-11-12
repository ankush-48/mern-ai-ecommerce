import Product from '../models/Product.js';
import {
  chatWithShoppingAssistant,
  parseSemanticSearchQuery,
  generateProductListing,
  summarizeProductReviews,
} from '../services/geminiService.js';

export const aiChat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
      res.status(400);
      throw new Error('Message is required');
    }

    const result = await chatWithShoppingAssistant(message.trim(), history || []);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const aiSemanticSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      res.status(400);
      throw new Error('Search query is required');
    }

    const parsed = await parseSemanticSearchQuery(query.trim());

    const mongoFilter = {};
    if (parsed.maxPrice > 0) {
      mongoFilter.price = { $lte: parsed.maxPrice };
    }

    if (parsed.expandedTerms && parsed.expandedTerms.length > 0) {
      const regexes = parsed.expandedTerms.map((term) => new RegExp(term, 'i'));
      mongoFilter.$or = [
        { name: { $in: regexes } },
        { description: { $in: regexes } },
        { tags: { $in: regexes } },
        { category: { $in: regexes } },
      ];
    }

    const products = await Product.find(mongoFilter).sort({ rating: -1, numReviews: -1 });

    res.json({
      products,
      intentSummary: parsed.intentSummary,
      expandedTerms: parsed.expandedTerms,
    });
  } catch (error) {
    next(error);
  }
};

export const aiGenerateListing = async (req, res, next) => {
  try {
    const { productName, roughNotes, category } = req.body;
    const imageFile = req.file || null;

    if (!productName && !roughNotes && !imageFile) {
      res.status(400);
      throw new Error('Provide at least a product name, rough notes, or an image');
    }

    const generated = await generateProductListing({
      productName,
      roughNotes,
      category,
      imageFile,
    });

    res.json(generated);
  } catch (error) {
    next(error);
  }
};

export const aiReviewSummary = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const summary = await summarizeProductReviews(product);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};
