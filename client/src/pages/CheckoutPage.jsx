import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [processing, setProcessing] = useState(false);

  const [shipping, setShipping] = useState({
    address: user?.shippingAddress?.address || '',
    city: user?.shippingAddress?.city || '',
    postalCode: user?.shippingAddress?.postalCode || '',
    country: user?.shippingAddress?.country || 'India',
    phone: user?.shippingAddress?.phone || '',
  });

  const finalizeOrder = async (paymentResult = {}) => {
    const orderPayload = {
      orderItems: cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        image: item.images?.[0]?.url || 'https://placehold.co/200x200',
        price: item.price,
        qty: item.qty,
      })),
      shippingAddress: shipping,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };

    await api.post('/orders', orderPayload);
    clearCart();
    toast.success('Order placed successfully!');
    navigate('/orders');
  };

  const handlePlaceOrder = async () => {
    if (!cartItems.length) { toast.error('Your cart is empty'); navigate('/shop'); return; }
    setProcessing(true);
    try {
      if (paymentMethod === 'COD') {
        await finalizeOrder();
        return;
      }

      const { data: rzpOrder } = await api.post('/orders/razorpay', { orderItems: cartItems.map(item => ({ product: item._id, qty: item.qty })) });

      const options = {
        key: rzpOrder.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'NovaCart AI',
        description: 'Order Payment',
        order_id: rzpOrder.id,
        handler: async (response) => {
          try {
            await finalizeOrder(response);
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: shipping.phone,
        },
        theme: { color: '#4f46e5' },
      };

      if (!window.Razorpay) throw new Error('Payment service could not load. Please try cash on delivery.');
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-center gap-4 text-sm font-semibold">
        <span className={step >= 1 ? 'text-brand-600' : 'text-slate-400'}>1. Shipping</span>
        <span>→</span>
        <span className={step >= 2 ? 'text-brand-600' : 'text-slate-400'}>2. Payment & Review</span>
      </div>

      {step === 1 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h2 className="text-xl font-bold">Shipping Address</h2>
          <input
            required
            placeholder="Street Address"
            value={shipping.address}
            onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="City"
              value={shipping.city}
              onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm"
            />
            <input
              required
              placeholder="Postal / PIN Code"
              value={shipping.postalCode}
              onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm"
            />
          </div>
          <input
            required
            placeholder="Phone Number"
            value={shipping.phone}
            onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white"
          >
            Continue to Payment
          </button>
        </form>
      ) : (
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold">Payment Method</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {['Razorpay', 'COD'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`rounded-xl border p-4 text-left text-sm font-semibold ${
                  paymentMethod === method
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-200'
                }`}
              >
                {method === 'Razorpay' ? 'Razorpay (UPI / Cards / NetBanking)' : 'Cash on Delivery (COD)'}
              </button>
            ))}
          </div>

          <div className="border-t pt-4 text-sm">
            <div className="flex justify-between font-bold text-lg">
              <span>Payable Total</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold"
            >
              Back
            </button>
            <button
              disabled={processing}
              onClick={handlePlaceOrder}
              className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700"
            >
              {processing ? 'Processing...' : `Place Order (₹${totalPrice.toLocaleString('en-IN')})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
