import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { user, toggleWishlist } = useAuth();

  const isWishlisted = user?.wishlist?.some(
    (item) => (typeof item === 'string' ? item : item._id) === product._id
  );

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-brand-300 hover:shadow-xl hover:shadow-slate-200/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Discount & Stock Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.discountPercent && product.discountPercent > 0 ? (
            <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white shadow">
              {product.discountPercent}% OFF
            </span>
          ) : null}
          {product.stock === 0 ? (
            <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">
              Sold Out
            </span>
          ) : product.stock <= 5 ? (
            <span className="flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
              <Zap className="h-3 w-3" /> Only {product.stock} left
            </span>
          ) : null}
        </div>

        <button
          onClick={() => toggleWishlist(product._id)}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur transition hover:scale-110 hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="font-bold uppercase tracking-wider text-brand-600">
            {product.brand || product.category}
          </span>
          <span className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 font-bold text-amber-700">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {product.rating?.toFixed(1) || '4.2'}
            <span className="font-normal text-slate-400">({product.numReviews || 0})</span>
          </span>
        </div>

        <Link
          to={`/product/${product._id}`}
          className="line-clamp-2 text-sm font-bold text-slate-900 transition group-hover:text-brand-600"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-emerald-600">Free Delivery</p>
          </div>

          <button
            disabled={product.stock === 0}
            onClick={() => addToCart(product, 1)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
