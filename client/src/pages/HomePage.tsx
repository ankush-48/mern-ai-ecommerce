import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Truck,
  Zap,
  Award,
  TrendingUp,
} from 'lucide-react';
import api from '../api/axiosInstance';
import ProductCard from '../components/products/ProductCard';
import { Product } from '../types';

const BENTO_CATEGORIES = [
  {
    name: 'Smartphones & Laptops',
    tagline: 'Flagship silicon & OLED displays',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    name: 'Audio & Wearables',
    tagline: 'Studio ANC & GPS smartwatches',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    span: '',
  },
  {
    name: 'Accessories',
    tagline: 'Waterproof packs & EDC gear',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    span: '',
  },
  {
    name: 'Footwear',
    tagline: 'Marathon runners & court classics',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-2',
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [totalCatalog, setTotalCatalog] = useState(2500);
  const [aiQuery, setAiQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/products?sort=rating&limit=8'),
      api.get('/products?sort=bestselling&limit=8'),
    ]).then(([featRes, bestRes]) => {
      setFeatured(featRes.data.products);
      setBestsellers(bestRes.data.products);
      if (featRes.data.total) setTotalCatalog(featRes.data.total);
    });
  }, []);

  const handleSemanticHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    navigate(`/shop?ai=${encodeURIComponent(aiQuery.trim())}`);
  };

  return (
    <div>
      {/* Executive Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-200 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Powered by Google Gemini • {totalCatalog.toLocaleString('en-IN')} Sample Products
            </span>

            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Discover gear by{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                natural intent.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
              Describe your exact scenario, aesthetic, or budget in plain English. NovaCart’s semantic AI searches across thousands of sample catalog items.
            </p>

            <form
              onSubmit={handleSemanticHeroSearch}
              className="mx-auto mt-8 flex max-w-2xl items-center rounded-2xl border border-white/15 bg-white p-2 shadow-2xl"
            >
              <Search className="ml-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder='Try: "Waterproof commuter backpack for a 16-inch MacBook under ₹3,000"'
                className="flex-1 px-3.5 py-3 text-sm text-slate-900 outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
              >
                <Sparkles className="h-4 w-4" /> AI Search
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span>Popular AI Prompts:</span>
              {[
                'WFH mechanical keyboard & laptop stand',
                'Barista pour-over coffee gear',
                'Running shoes under ₹4,000',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => navigate(`/shop?ai=${encodeURIComponent(chip)}`)}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-slate-200 transition hover:border-indigo-400 hover:bg-white/10"
                >
                  {chip}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enterprise Trust Bar */}
      <section className="border-b border-slate-200 bg-white py-6">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
          {[
            { icon: Zap, title: 'Gemini Semantic Engine', desc: 'Intent-aware search & AI concierge' },
            { icon: Truck, title: 'Express PAN-India Delivery', desc: 'Free shipping on orders above ₹999' },
            { icon: ShieldCheck, title: 'Demo Checkout', desc: 'Payment simulator & cash on delivery' },
            { icon: Award, title: 'AI Review Summaries', desc: 'Available when reviews are added' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bento Category Grid */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Shop Curated Departments</h2>
            <p className="text-sm text-slate-500">Explore 10 categories spanning 2,500+ products</p>
          </div>
          <Link to="/shop" className="flex items-center gap-1 text-sm font-bold text-brand-600 hover:underline">
            Browse Full Catalog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
          {BENTO_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className={`group relative min-h-[210px] overflow-hidden rounded-3xl bg-slate-900 ${cat.span}`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-xs font-semibold text-indigo-300">{cat.tagline}</p>
                <h3 className="mt-1 text-xl font-extrabold">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Rated Picks */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            <h2 className="text-2xl font-black text-slate-900">Top-Rated Flagships</h2>
          </div>
          <Link to="/shop?sort=rating" className="text-sm font-bold text-brand-600 hover:underline">
            See All Top Rated →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Trending Bestsellers */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h2 className="text-2xl font-black text-slate-900">Trending Bestsellers</h2>
          </div>
          <Link to="/shop?sort=bestselling" className="text-sm font-bold text-brand-600 hover:underline">
            View Bestsellers →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
