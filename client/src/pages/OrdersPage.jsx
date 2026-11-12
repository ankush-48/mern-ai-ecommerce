import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/myorders').then(({ data }) => setOrders(data));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My Orders & Tracking</h1>
      {orders.length === 0 ? (
        <p className="text-slate-500">You haven’t placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div>
                  <p className="text-xs text-slate-500">Order #{order._id}</p>
                  <p className="text-sm font-bold">
                    Total: ₹{order.totalPrice.toLocaleString('en-IN')} • {order.paymentMethod}
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-brand-700">
                  {order.orderStatus}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-slate-700">
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
