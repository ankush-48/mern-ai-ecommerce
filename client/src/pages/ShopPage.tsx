import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import api from '../api/axiosInstance';
import ProductCard from '../components/products/ProductCard';
import { Product } from '../types';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [brand, setBrand] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const [aiMode, setAiMode] = useState(Boolean(searchParams.get('ai')));
  const [aiIntentBanner, setAiIntentBanner] = useState('');

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) setCategory(catParam);
  }, [searchParams]);

  useEffect(() => {
    const aiParam = searchParams.get('ai');
    if (aiParam) {
      setKeyword(aiParam);
      setAiMode(true);
      runSemanticSearch(aiParam);
    } else {
      fetchStandardProducts();
    }
  }, [page, category, brand, sort, minRating, inStockOnly]);

  const fetchStandardProducts = async () => {
    setLoading(true);
    setAiIntentBanner('');
    try {
      const params: Record<string, any> = { page, limit: 16, sort };
      if (keyword) params.keyword = keyword;
      if (category !== 'All') params.category = category;
      if (brand !== 'All') params.brand = brand;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.minRating = minRating;
      if (inStockOnly) params.inStock = 'true';

      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setPages(data.pages);
      setTotal(data.total);
      setCategories(data.categories || []);
      setBrands(data.brands || []);
    } finally {
      setLoading(false);
    }
  };

  const runSemanticSearch = async (queryText: string) => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/semantic-search', { query: queryText });
      setProducts(data.products);
      setTotal(data.products.length);
      setPages(1);
      setAiIntentBanner(data.intentSummary);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    if (aiMode && keyword.trim()) {
      setSearchParams({ ai: keyword.trim() });
      runSemanticSearch(keyword.trim());
    } else {
      setSearchParams({});
      fetchStandardProducts();
    }
  };

  const resetAllFilters = () => {
    setKeyword('');
    setCategory('All');
    setBrand('All');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setInStockOnly(false);
    setAiMode(false);
    setAiIntentBanner('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Search & AI Mode Header */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={
                aiMode
                  ? 'Describe your exact use-case (e.g., "ergonomic setup for remote coding")...'
                  : 'Search across 2,500+ products by title, brand, or tag...'
              }
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-600"
            />
          </div>

          <button
            type="button"
            onClick={() => setAiMode(!aiMode)}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
              aiMode
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {aiMode ? 'Gemini Semantic Search: ON' : 'Gemini Semantic Search: OFF'}
          </button>

          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
          >
            Search
          </button>
        </form>

        {aiIntentBanner && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2.5 text-xs font-semibold text-indigo-900">
            <Sparkles className="h-4 w-4 shrink-0 text-brand-600" />
            <span>{aiIntentBanner}</span>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Enterprise Multi-Facet Filter Sidebar */}
        <aside className="h-fit space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-extrabold text-slate-900">
              <SlidersHorizontal className="h-4 w-4 text-brand-600" /> Refine Catalog
            </span>
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-600"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Departments
            </label>
            <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setCategory('All');
                  setPage(1);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold ${
                  category === 'All' ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>All Departments</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setCategory(cat.name);
                    setPage(1);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold ${
                    category === cat.name
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className={category === cat.name ? 'text-indigo-200' : 'text-slate-400'}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Brand
            </label>
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="All">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Price Range (₹ INR)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={fetchStandardProducts}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={fetchStandardProducts}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Customer Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5★ & Above</option>
              <option value="4">4.0★ & Above</option>
              <option value="3">3.0★ & Above</option>
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => {
                setInStockOnly(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded text-brand-600"
            />
            Exclude Out-of-Stock Items
          </label>
        </aside>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-600">
              Showing <strong className="text-slate-900">{products.length}</strong> of{' '}
              <strong className="text-slate-900">{total.toLocaleString('en-IN')}</strong> items
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800"
            >
              <option value="newest">Sort: Featured & Newest</option>
              <option value="bestselling">Sort: Bestsellers</option>
              <option value="rating">Sort: Highest Customer Rating</option>
              <option value="discount">Sort: Biggest Discount</option>
              <option value="price_asc">Sort: Price Low to High</option>
              <option value="price_desc">Sort: Price High to Low</option>
            </select>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-14 text-center">
              <p className="text-base font-bold text-slate-900">No matching items found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try resetting filters or asking Nova AI in the bottom right.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Smart Windowed Pagination for 2,500+ items */}
          {pages > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-3 text-xs font-bold text-slate-600">
                Page {page} of {pages}
              </span>
              <button
                disabled={page === pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
