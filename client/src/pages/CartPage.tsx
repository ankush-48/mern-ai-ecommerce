import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const {
    cartItems,
    updateQty,
    removeFromCart,
    couponCode,
    applyCoupon,
    discountAmount,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = useCart();
  const [promoInput, setPromoInput] = useState(couponCode);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h2 className="text-2xl font-black text-slate-900">Your Shopping Bag is Empty</h2>
        <p className="mt-2 text-sm text-slate-500">Explore 2,500+ curated products or ask Nova AI for recommendations.</p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-black text-slate-900">Shopping Bag</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <img
                src={item.images?.[0]?.url}
                alt={item.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
              <div className="flex-1">
                <Link to={`/product/${item._id}`} className="font-bold text-slate-900 hover:text-brand-600">
                  {item.name}
                </Link>
                <p className="text-xs text-slate-500">
                  {[item.brand, item.selectedColor, item.selectedSize].filter(Boolean).join(' • ')}
                </p>
                <p className="mt-1 text-base font-extrabold text-brand-600">
                  ₹{item.price.toLocaleString('en-IN')}
                </p>
              </div>
              <input
                type="number"
                min="1"
                max={item.stock}
                value={item.qty}
                onChange={(e) => updateQty(item._id, Number(e.target.value))}
                className="w-16 rounded-xl border border-slate-300 px-2 py-2 text-center text-sm font-bold"
              />
              <button
                onClick={() => removeFromCart(item._id)}
                className="p-2 text-slate-400 hover:text-red-600"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900">Order Summary</h2>

          {/* Promo Code */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Promo code (NOVA10)"
                className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs font-semibold uppercase"
              />
            </div>
            <button
              type="button"
              onClick={() => applyCoupon(promoInput)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600"
            >
              Apply
            </button>
          </div>

          <div className="space-y-2.5 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between font-semibold text-emerald-600">
                <span>Promo Discount ({couponCode})</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Express Shipping</span>
              <span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated GST (18%)</span>
              <span>₹{taxPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-lg font-black text-slate-900">
              <span>Total Payable</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700"
          >
            Proceed to Payment Gateway <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
