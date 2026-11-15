import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: 'Verified Purchase' },
    comment: { type: String, required: true, trim: true },
    verifiedBuyer: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, unique: true, sparse: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    features: [{ type: String }],
    specifications: { type: Map, of: String, default: {} },
    tags: [{ type: String, lowercase: true, trim: true }],
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, default: 'General', trim: true },
    brand: { type: String, default: 'NovaSelect', trim: true },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: '' },
      },
    ],
    variants: {
      colors: [{ type: String }],
      sizes: [{ type: String }],
    },
    stock: { type: Number, required: true, default: 25, min: 0 },
    soldCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    aiReviewSummary: {
      pros: [{ type: String }],
      cons: [{ type: String }],
      verdict: { type: String, default: '' },
      reviewCountAtGeneration: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, price: 1, rating: -1 });
productSchema.index({ brand: 1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text', category: 'text', brand: 'text' });

export default mongoose.model('Product', productSchema);
