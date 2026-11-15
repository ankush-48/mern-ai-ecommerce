import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Sparkles,
  User,
  LogOut,
  ShieldCheck,
  Package,
  Search,
  Heart,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../api/axiosInstance';
import { Product } from '../../types';

const TOP_CATEGORIES = [
  'Smartphones & Laptops',
  'Audio & Wearables',
  'Electronics',
  'Accessories',
  'Fashion & Apparel',
  'Footwear',
  'Home & Kitchen',
  'Fitness & Sports',
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount, setDrawerOpen } = useCart();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        try {
          const { data } = await api.get(`/products/suggestions?q=${encodeURIComponent(query)}`);
          setSuggestions(data);
          setShowDropdown(true);
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(false);
    navigate(`/shop?ai=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      {/* Top Announcement Ribbon */}
      <div className="bg-slate-900 px-4 py-1.5 text-center text-[11px] font-medium text-slate-200">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          2,500+ Verified Products • Free Express Shipping above ₹999 • Use code{' '}
          <strong className="text-indigo-300">NOVA10</strong> for 10% OFF
        </span>
      </div>

      {/* Main Bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 text-xl font-black tracking-tight text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-md shadow-brand-600/20">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            NovaCart<span className="text-brand-600">.ai</span>
          </span>
        </Link>

        {/* Deliver To Pill */}
        <div className="hidden items-center gap-1.5 rounded-xl bg-slate-100/80 px-3 py-1.5 text-xs text-slate-600 xl:flex">
          <MapPin className="h-3.5 w-3.5 text-brand-600" />
          <div>
            <p className="text-[10px] text-slate-400">Deliver to</p>
            <p className="font-semibold text-slate-800">
              {user?.shippingAddress?.city || 'Bengaluru 560001'}
            </p>
          </div>
        </div>

        {/* Live AI Autocomplete Search */}
        <div ref={searchRef} className="relative flex-1">
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 2,500+ items or ask AI (e.g. 'noise cancelling headphones under ₹5000')..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-24 text-sm outline-none transition focus:border-brand-600 focus:bg-white focus:ring-2 focus:ring-brand-600/10"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1 flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                <Sparkles className="h-3 w-3" /> Search
              </button>
            </div>
          </form>

          {showDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="border-b bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Instant Catalog Matches
              </div>
              {suggestions.map((item) => (
                <Link
                  key={item._id}
                  to={`/product/${item._id}`}
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-indigo-50/60"
                >
                  <img
                    src={item.images?.[0]?.url}
                    alt={item.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.brand} • {item.category}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-brand-600">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 border border-amber-200 hover:bg-amber-100 lg:flex"
            >
              <ShieldCheck className="h-4 w-4 text-amber-600" /> Admin Studio
            </Link>
          )}

          {user && (
            <>
              <Link
                to="/profile"
                title="Wishlist"
                className="relative hidden rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 sm:flex"
              >
                <Heart className="h-5 w-5" />
                {user.wishlist?.length > 0 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </Link>
              <Link
                to="/orders"
                className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 md:flex"
              >
                <Package className="h-4 w-4 text-brand-600" /> Orders
              </Link>
            </>
          )}

          <button
            onClick={() => setDrawerOpen(true)}
            className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:border-brand-500"
          >
            <ShoppingBag className="h-4 w-4 text-brand-600" />
            <span className="hidden sm:inline">Bag</span>
            {totalCount > 0 && (
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
                {totalCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600"
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </Link>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Category Sub-Navigation */}
      <div className="border-t border-slate-100 bg-slate-50/70">
        <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2 text-xs font-semibold text-slate-600 sm:px-6 no-scrollbar">
          <Link to="/shop" className="shrink-0 text-brand-600 hover:underline">
            All 2,500+ Products
          </Link>
          {TOP_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/shop?category=${encodeURIComponent(cat)}`}
              className="shrink-0 transition hover:text-brand-600"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
