import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cartItems, updateQty, removeFromCart, itemsPrice, shippingPrice, taxPrice, totalPrice } =
    useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Your cart is empty</h2>
        <Link
          to="/shop"
          className="mt-4 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <img
                src={item.images?.[0]?.url || 'https://placehold.co/100x100'}
                alt={item.name}
                className="h-20 w-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <Link to={`/product/${item._id}`} className="font-semibold text-slate-900">
                  {item.name}
                </Link>
                <p className="text-sm font-bold text-brand-600">
                  ₹{item.price.toLocaleString('en-IN')}
                </p>
              </div>
              <input
                type="number"
                min="1"
                max={item.stock}
                value={item.qty}
                onChange={(e) => updateQty(item._id, Number(e.target.value))}
                className="w-16 rounded-xl border border-slate-300 px-2 py-1.5 text-center text-sm"
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

        <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated GST (18%)</span>
              <span>₹{taxPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-bold text-slate-900">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700"
          >
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
