import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  CheckCircle2,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AIReviewSummary from '../components/ai/AIReviewSummary';
import ProductCard from '../components/products/ProductCard';
import { Product } from '../types';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user, toggleWishlist } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState('560038');
  const [deliveryEta, setDeliveryEta] = useState('Tomorrow by 9 PM');

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProduct = async () => {
    const { data } = await api.get(`/products/${id}`);
    setProduct(data.product);
    setRelated(data.related || []);
    setSelectedColor(data.product.variants?.colors?.[0] || '');
    setSelectedSize(data.product.variants?.sizes?.[0] || '');
  };

  useEffect(() => {
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating, title, comment });
      toast.success('Review published!');
      setComment('');
      setTitle('');
      loadProduct();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) {
    return <div className="p-20 text-center text-sm font-semibold text-slate-500">Loading product details...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image Showcase */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            className="aspect-square w-full rounded-2xl object-cover"
          />
        </div>

        {/* Purchase & Variant Panel */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              {product.brand}
            </span>
            <span className="text-xs font-semibold text-slate-400">SKU: {product.sku}</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{product.name}</h1>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-700">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {product.rating?.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-slate-500">
              {product.numReviews} Verified Reviews • {product.soldCount || 120}+ Sold
            </span>
          </div>

          <div className="rounded-2xl bg-slate-100/80 p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                    Save {product.discountPercent}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">Inclusive of all taxes • EMI starts at ₹{Math.round(product.price / 6)}/mo</p>
          </div>

          {/* Color & Size Variants */}
          {product.variants?.colors && product.variants.colors.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase text-slate-500">
                Color: <span className="text-slate-900">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition ${
                      selectedColor === c
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.variants?.sizes && product.variants.sizes.length > 1 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase text-slate-500">
                Option: <span className="text-slate-900">{selectedSize}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition ${
                      selectedSize === s
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>

          {product.features?.length > 0 && (
            <ul className="space-y-2 border-t border-slate-200 pt-4">
              {product.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}

          {/* PIN Delivery Estimator */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-center gap-2.5 text-xs">
              <Truck className="h-4 w-4 text-brand-600" />
              <div>
                <p className="font-bold text-slate-900">Express Delivery: {deliveryEta}</p>
                <p className="text-slate-500">PIN: {pincode}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <input
                value={pincode}
                maxLength={6}
                onChange={(e) => setPincode(e.target.value)}
                className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold"
              />
              <button
                type="button"
                onClick={() => setDeliveryEta('Guaranteed in 24-48 Hours')}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-brand-600 hover:bg-indigo-50"
              >
                Check
              </button>
            </div>
          </div>

          {/* Add to Cart + Wishlist */}
          <div className="flex items-center gap-3 pt-2">
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-3.5 text-sm font-bold"
            >
              {[...Array(Math.min(Math.max(product.stock, 1), 10)).keys()].map((x) => (
                <option key={x + 1} value={x + 1}>
                  Qty: {x + 1}
                </option>
              ))}
            </select>

            <button
              disabled={product.stock === 0}
              onClick={() => addToCart(product, qty, selectedColor, selectedSize)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 disabled:bg-slate-300"
            >
              <ShoppingCart className="h-5 w-5" />
              {product.stock > 0 ? 'Add to Shopping Bag' : 'Out of Stock'}
            </button>

            <button
              onClick={() => toggleWishlist(product._id)}
              className="rounded-xl border border-slate-300 bg-white p-3.5 text-slate-700 hover:border-rose-400 hover:text-rose-600"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 rounded-xl bg-white p-3 border">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> 100% Genuine Brand Warranty
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white p-3 border">
              <RotateCcw className="h-4 w-4 text-brand-600" /> 7-Day Instant Replacement
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Gemini AI Summary */}
      <div className="mt-16 border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-black text-slate-900">Verified Customer Reviews</h2>

        <AIReviewSummary productId={product._id} numReviews={product.numReviews} />

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {product.reviews.length === 0 ? (
              <p className="text-sm text-slate-500">No reviews yet. Be the first to review this item!</p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{rev.name}</span>
                      <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        Verified Buyer
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400" /> {rev.rating}/5
                    </span>
                  </div>
                  {rev.title && <p className="mt-2 text-sm font-bold text-slate-800">{rev.title}</p>}
                  <p className="mt-1 text-sm text-slate-600">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {user && (
            <form
              onSubmit={handleReviewSubmit}
              className="h-fit space-y-4 rounded-3xl border border-slate-200 bg-white p-6"
            >
              <h3 className="font-extrabold text-slate-900">Write a Product Review</h3>
              <div>
                <label className="mb-1 block text-xs font-bold">Overall Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-semibold"
                >
                  <option value={5}>5 ★ — Exceptional</option>
                  <option value={4}>4 ★ — Very Good</option>
                  <option value={3}>3 ★ — Average</option>
                  <option value={2}>2 ★ — Below Average</option>
                  <option value={1}>1 ★ — Poor</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold">Headline</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your verdict..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold">Detailed Review</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike?"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-brand-600"
              >
                {submittingReview ? 'Publishing...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {related.length > 0 && (
        <div className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="mb-6 text-2xl font-black text-slate-900">More in {product.category}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
