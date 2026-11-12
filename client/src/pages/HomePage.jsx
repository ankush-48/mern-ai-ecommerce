import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Search, ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react';
import api from '../api/axiosInstance';
import ProductCard from '../components/products/ProductCard';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [error, setError] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products?sort=rating&limit=8').then(({ data }) => setFeatured(data.products)).catch(() => setError('Products could not load. Please refresh or try again shortly.'));
  }, []);

  const handleSemanticHeroSearch = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    navigate(`/shop?ai=${encodeURIComponent(aiQuery.trim())}`);
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-20 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-indigo-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> AI-Powered Next-Gen Commerce
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Shop by intent, not just keywords.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
            Describe what you’re looking for in plain English—our Gemini AI understands your use-case, budget, and style.
          </p>

          <form
            onSubmit={handleSemanticHeroSearch}
            className="mx-auto mt-8 flex max-w-2xl items-center rounded-2xl bg-white p-2 shadow-2xl"
          >
            <Search className="ml-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder='Try: "Minimalist waterproof backpack for daily office commute under ₹3,000"'
              className="min-w-0 flex-1 px-3 py-2.5 text-sm text-slate-900 outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Sparkles className="h-4 w-4" /> AI Search
            </button>
          </form>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-6">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-brand-600" />
            <div>
              <p className="text-sm font-bold">Gemini Semantic Discovery</p>
              <p className="text-xs text-slate-500">Natural language search & AI chat</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="h-6 w-6 text-brand-600" />
            <div>
              <p className="text-sm font-bold">Free Express Delivery</p>
              <p className="text-xs text-slate-500">On all orders above ₹999</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-brand-600" />
            <div>
              <p className="text-sm font-bold">Verified Buyer Insights</p>
              <p className="text-xs text-slate-500">AI-summarized Pros & Cons on reviews</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Top-Rated Picks</h2>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
          >
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div role="status" className="mb-4 text-sm text-slate-600">{error || (!featured.length ? 'No products available yet.' : '')}</div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
