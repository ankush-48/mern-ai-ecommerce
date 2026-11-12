import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AIReviewSummary from '../components/ai/AIReviewSummary';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProduct = async () => {
    const { data } = await api.get(`/products/${id}`);
    setProduct(data);
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      toast.success('Review submitted!');
      setComment('');
      loadProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) {
    return <div className="p-12 text-center text-slate-500">Loading product...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <img
            src={product.images?.[0]?.url || 'https://placehold.co/600x600'}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-5">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {product.category}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-bold text-amber-500">
              <Star className="h-5 w-5 fill-amber-400" />
              {product.rating?.toFixed(1)}
            </span>
            <span className="text-sm text-slate-500">({product.numReviews} customer reviews)</span>
          </div>

          <p className="text-3xl font-bold text-slate-900">
            ₹{product.price.toLocaleString('en-IN')}
          </p>

          <p className="leading-relaxed text-slate-600">{product.description}</p>

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

          <div className="flex items-center gap-4 pt-4">
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="rounded-xl border border-slate-300 px-3 py-3 text-sm font-semibold"
            >
              {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                <option key={x + 1} value={x + 1}>
                  Qty: {x + 1}
                </option>
              ))}
            </select>

            <button
              disabled={product.stock === 0}
              onClick={() => addToCart(product, qty)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white hover:bg-brand-700 disabled:bg-slate-300"
            >
              <ShoppingCart className="h-5 w-5" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-14 border-t border-slate-200 pt-10">
        <h2 className="text-2xl font-bold text-slate-900">Customer Reviews</h2>

        <AIReviewSummary productId={product._id} numReviews={product.numReviews} />

        <div className="mt-6 grid gap-8 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            {product.reviews.length === 0 ? (
              <p className="text-sm text-slate-500">No reviews yet. Be the first to review!</p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev._id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{rev.name}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400" /> {rev.rating}/5
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {user && (
            <form
              onSubmit={handleReviewSubmit}
              className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <h3 className="font-bold text-slate-900">Write a Review</h3>
              <div>
                <label className="mb-1 block text-xs font-semibold">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-sm"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Comment</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
