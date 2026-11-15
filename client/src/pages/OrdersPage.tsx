import { useState, useEffect } from 'react';
import { PackageCheck, Truck, CheckCircle2, Clock } from 'lucide-react';
import api from '../api/axiosInstance';
import { Order } from '../types';

const STAGES = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get('/orders/myorders').then(({ data }) => setOrders(data));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-black text-slate-900">Orders & Live Shipment Tracking</h1>
      {orders.length === 0 ? (
        <div className="rounded-3xl border bg-white p-12 text-center text-sm text-slate-500">
          You haven’t placed any orders yet.
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentIdx = Math.max(0, STAGES.indexOf(order.orderStatus));
            return (
              <div key={order._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                  <div>
                    <p className="text-xs font-bold text-brand-600">
                      Order {order.orderNumber || order._id} • Tracking: {order.trackingId}
                    </p>
                    <p className="mt-0.5 text-base font-extrabold text-slate-900">
                      ₹{order.totalPrice.toLocaleString('en-IN')} •{' '}
                      <span className="text-xs font-semibold text-slate-500">
                        {order.paymentMethod} ({order.isPaid ? 'Paid' : 'Pay on Delivery'})
                      </span>
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-extrabold text-brand-700">
                    {order.orderStatus}
                  </span>
                </div>

                {/* 5-Stage Shipment Timeline */}
                {order.orderStatus !== 'Cancelled' && (
                  <div className="my-5 grid grid-cols-5 gap-2">
                    {STAGES.map((stage, idx) => {
                      const active = idx <= currentIdx;
                      return (
                        <div key={stage} className="text-center">
                          <div
                            className={`mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {idx < currentIdx ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : idx === currentIdx ? (
                              <Truck className="h-3.5 w-3.5" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <p
                            className={`text-[10px] font-bold ${
                              active ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {stage}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-2.5 border-t pt-4">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="h-11 w-11 rounded-lg object-cover" />
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
