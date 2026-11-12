import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    features: [{ type: String }],
    tags: [{ type: String, lowercase: true, trim: true }],
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    brand: {
      type: String,
      default: 'Generic',
      trim: true,
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: '' },
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    aiReviewSummary: {
      pros: [{ type: String }],
      cons: [{ type: String }],
      verdict: { type: String, default: '' },
      reviewCountAtGeneration: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);
