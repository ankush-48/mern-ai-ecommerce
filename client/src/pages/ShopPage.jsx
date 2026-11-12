import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import ProductCard from '../components/products/ProductCard';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('newest');

  const [aiMode, setAiMode] = useState(Boolean(searchParams.get('ai')));
  const [aiIntentBanner, setAiIntentBanner] = useState('');

  useEffect(() => {
    const aiParam = searchParams.get('ai');
    if (aiParam) {
      setKeyword(aiParam);
      runSemanticSearch(aiParam);
    } else {
      fetchStandardProducts();
    }
  }, [page, category, sort, minRating]);

  const fetchStandardProducts = async () => {
    setLoading(true);
    setAiIntentBanner('');
    try {
      const params = { page, limit: 12, sort };
      if (keyword) params.keyword = keyword;
      if (category !== 'All') params.category = category;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.minRating = minRating;

      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setPages(data.pages);
      setCategories(['All', ...(data.categories || [])]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const runSemanticSearch = async (queryText) => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/semantic-search', { query: queryText });
      setProducts(data.products);
      setPages(1);
      setAiIntentBanner(data.intentSummary);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={
                aiMode
                  ? 'Describe your need (e.g., "ergonomic setup for remote work")...'
                  : 'Search products by keyword...'
              }
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setAiMode(!aiMode)}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
              aiMode
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            {aiMode ? 'AI Semantic Search: ON' : 'AI Semantic Search: OFF'}
          </button>

          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Search
          </button>
        </form>

        {aiIntentBanner && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-medium text-indigo-800">
            <Sparkles className="h-4 w-4 shrink-0 text-brand-600" />
            <span>{aiIntentBanner}</span>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 h-fit">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <SlidersHorizontal className="h-4 w-4 text-brand-600" /> Filters
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Category</label>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm ${
                    category === cat
                      ? 'bg-brand-600 font-semibold text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
              Max Price (₹)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={fetchStandardProducts}
              placeholder="e.g. 5000"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
              Minimum Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All Ratings</option>
              <option value="4">4★ & Above</option>
              <option value="3">3★ & Above</option>
            </select>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">Showing {products.length} products</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-base font-semibold text-slate-800">No matching products found.</p>
              <p className="mt-1 text-sm text-slate-500">Try broadening your filters or asking Nova AI.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {[...Array(pages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={`h-9 w-9 rounded-xl text-sm font-semibold ${
                    page === idx + 1
                      ? 'bg-brand-600 text-white'
                      : 'border border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
