import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import ProductForm from '../../components/admin/ProductForm';

export default function AdminDashboard() {
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadAdminData = async () => {
    const [prodRes, ordRes] = await Promise.all([
      api.get('/products?limit=100'),
      api.get('/orders'),
    ]);
    setProducts(prodRes.data.products);
    setOrders(ordRes.data.orders);
    setAnalytics(ordRes.data.analytics);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product deleted');
    loadAdminData();
  };

  const handleOrderStatus = async (orderId, orderStatus) => {
    await api.put(`/orders/${orderId}/status`, { orderStatus });
    toast.success(`Order marked as ${orderStatus}`);
    loadAdminData();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-slate-900">Admin Studio</h1>
        <div className="flex gap-2">
          {['products', 'orders'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${
                tab === t ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {analytics && (
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-xs font-semibold text-slate-500">Total Revenue</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              ₹{analytics.totalRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-xs font-semibold text-slate-500">Total Orders</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{analytics.totalOrders}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-xs font-semibold text-slate-500">Catalog Size</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{analytics.totalProducts}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-xs font-semibold text-slate-500">Low Stock Alerts</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-600">
              {analytics.lowStockProducts?.length || 0}
            </p>
          </div>
        </div>
      )}

      {tab === 'products' ? (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(!showForm);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Add Product with AI
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

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
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
                  <tr key={p._id}>
                    <td className="p-4 font-semibold">{p.name}</td>
                    <td className="p-4 text-slate-600">{p.category}</td>
                    <td className="p-4 font-bold">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="p-4">{p.stock}</td>
                    <td className="p-4 text-right space-x-2">
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
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="p-4 font-mono text-xs">{o._id}</td>
                  <td className="p-4">{o.user?.name || 'Customer'}</td>
                  <td className="p-4 font-bold">₹{o.totalPrice.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => handleOrderStatus(o._id, e.target.value)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold"
                    >
                      {['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
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
