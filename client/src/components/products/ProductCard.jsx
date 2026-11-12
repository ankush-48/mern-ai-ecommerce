import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user, toggleWishlist } = useAuth();

  const isWishlisted = user?.wishlist?.some(
    (item) => (typeof item === 'string' ? item : item._id) === product._id
  );

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images?.[0]?.url || 'https://placehold.co/600x600?text=Product'}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
        <button
          onClick={() => toggleWishlist(product._id)}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm backdrop-blur hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`}
          />
        </button>
        {product.stock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            Out of Stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-brand-600">{product.category}</span>
          <span className="flex items-center gap-1 font-medium text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0})
          </span>
        </div>

        <Link
          to={`/product/${product._id}`}
          className="line-clamp-2 text-base font-semibold text-slate-900 hover:text-brand-600"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-bold text-slate-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <button
            disabled={product.stock === 0}
            onClick={() => addToCart(product, 1)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
