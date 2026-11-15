import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  BarChart3,
  Package,
  ShoppingBag,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import ProductForm from '../../components/admin/ProductForm';
import { Order, Product } from '../../types';

export default function AdminDashboard() {
  const [tab, setTab] = useState<'analytics' | 'products' | 'orders'>('analytics');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadAdminData = async () => {
    const [prodRes, ordRes] = await Promise.all([
      api.get(`/products?limit=40&keyword=${encodeURIComponent(searchQuery)}`),
      api.get('/orders'),
    ]);
    setProducts(prodRes.data.products);
    setOrders(ordRes.data.orders);
    setAnalytics(ordRes.data.analytics);
  };

  useEffect(() => {
    loadAdminData();
  }, [searchQuery]);

  const handleSyncOnlineCatalog = async () => {
    setSyncing(true);
    try {
      const { data } = await api.post('/products/sync-online');
      toast.success(data.message);
      loadAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Online catalog sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product permanently?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product removed');
    loadAdminData();
  };

  const handleOrderStatus = async (orderId: string, orderStatus: string) => {
    await api.put(`/orders/${orderId}/status`, { orderStatus });
    toast.success(`Order updated to ${orderStatus}`);
    loadAdminData();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Executive Admin Studio</h1>
          <p className="text-xs text-slate-500">
            Manage 2,500+ products, sync live online catalogs, generate Gemini AI listings & fulfill orders
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncOnlineCatalog}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-brand-700 hover:bg-indigo-100"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing Live API...' : 'Sync Live Online Catalog'}
          </button>

          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'products', label: 'Catalog', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as any)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold ${
                tab === id
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700'
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Summary Cards */}
      {analytics && (
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400">Live Checkout Revenue</p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              ₹{analytics.totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400">Customer Orders</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{analytics.totalOrders}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400">Active Catalog SKUs</p>
            <p className="mt-1 text-2xl font-black text-brand-600">
              {analytics.totalProducts.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400">Low Stock Alerts (≤5)</p>
            <p className="mt-1 text-2xl font-black text-amber-600">
              {analytics.lowStockProducts?.length || 0}
            </p>
          </div>
        </div>
      )}

      {tab === 'analytics' && analytics?.categorySales && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold text-slate-900">
            Category Merchandise Performance (Units Sold)
          </h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categorySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="unitsSold" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter catalog SKUs..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs"
              />
            </div>

            <button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(!showForm);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" /> New Listing with Gemini AI
            </button>
          </div>

          {showForm && (
            <div className="mb-8">
              <ProductForm
                initialData={editingProduct}
                onCancel={() => setShowForm(false)}
                onSuccess={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  loadAdminData();
                }}
              />
            </div>
          )}

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70">
                    <td className="p-4 font-bold text-slate-900">{p.name}</td>
                    <td className="p-4 text-slate-600">{p.category}</td>
                    <td className="p-4 font-extrabold">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="p-4">{p.stock}</td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setShowForm(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-slate-50 uppercase text-slate-500">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Gateway</th>
                <th className="p-4">Total</th>
                <th className="p-4">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="p-4 font-mono font-bold">{o.orderNumber || o._id}</td>
                  <td className="p-4">{o.user?.name || 'Customer'}</td>
                  <td className="p-4">{o.paymentMethod}</td>
                  <td className="p-4 font-extrabold">₹{o.totalPrice.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => handleOrderStatus(o._id, e.target.value)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 font-bold"
                    >
                      {['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(
                        (st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
