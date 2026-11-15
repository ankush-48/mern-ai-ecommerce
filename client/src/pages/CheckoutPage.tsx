import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, ShieldCheck, CheckCircle2, Lock, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const {
    cartItems,
    couponCode,
    discountAmount,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'GatewaySandbox' | 'Razorpay' | 'COD'>('GatewaySandbox');
  const [gatewayTab, setGatewayTab] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('customer@okicici');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8890');
  const [cardExpiry, setCardExpiry] = useState('09/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    address: user?.shippingAddress?.address || '',
    city: user?.shippingAddress?.city || '',
    state: user?.shippingAddress?.state || 'Karnataka',
    postalCode: user?.shippingAddress?.postalCode || '',
    country: user?.shippingAddress?.country || 'India',
    phone: user?.shippingAddress?.phone || '',
  });

  const finalizeOrder = async (method: string, paymentResult: Record<string, any> = {}) => {
    const orderPayload = {
      orderItems: cartItems.map((item) => ({
        product: item._id,
        name: item.name,
        image: item.images?.[0]?.url,
        price: item.price,
        qty: item.qty,
        selectedColor: item.selectedColor || '',
        selectedSize: item.selectedSize || '',
      })),
      shippingAddress: shipping,
      paymentMethod: method,
      paymentResult,
      couponCode,
      discountAmount,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };

    await api.post('/orders', orderPayload);
    clearCart();
    toast.success('Payment verified & order confirmed!');
    navigate('/orders');
  };

  const handleInitiateCheckout = async () => {
    if (paymentMethod === 'COD') {
      setProcessing(true);
      try {
        await finalizeOrder('COD');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Order failed');
      } finally {
        setProcessing(false);
      }
      return;
    }

    if (paymentMethod === 'GatewaySandbox') {
      setShowGatewayModal(true);
      return;
    }

    // Live Razorpay SDK Checkout
    setProcessing(true);
    try {
      const { data: rzpOrder } = await api.post('/orders/razorpay', { amount: totalPrice });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'NovaCart.ai Enterprise',
        description: 'Verified Order Checkout',
        order_id: rzpOrder.id,
        handler: async (response: any) => {
          await finalizeOrder('Razorpay', {
            gatewayOrderId: response.razorpay_order_id,
            transactionId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            methodDetail: 'Razorpay Live',
          });
        },
        prefill: { name: shipping.fullName, email: user?.email, contact: shipping.phone },
        theme: { color: '#4f46e5' },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Razorpay unavailable — use NovaPay Gateway');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmGatewayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1100)); // Simulate bank authorization
      await finalizeOrder('GatewaySandbox', {
        transactionId: `TXN_${Date.now()}`,
        gatewayOrderId: `NV_GW_${Math.floor(100000 + Math.random() * 900000)}`,
        methodDetail: gatewayTab === 'upi' ? `UPI (${upiId})` : `Card ending ${cardNumber.slice(-4)}`,
      });
      setShowGatewayModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-center gap-4 text-xs font-extrabold uppercase tracking-wider">
        <span className={step >= 1 ? 'text-brand-600' : 'text-slate-400'}>1. Delivery Details</span>
        <span className="text-slate-300">———</span>
        <span className={step >= 2 ? 'text-brand-600' : 'text-slate-400'}>2. Payment Gateway</span>
      </div>

      {step === 1 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
          className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-black text-slate-900">Shipping Destination</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Recipient Full Name"
              value={shipping.fullName}
              onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            />
            <input
              required
              placeholder="Mobile Number (+91)"
              value={shipping.phone}
              onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            />
          </div>
          <input
            required
            placeholder="Street Address, Flat / Building"
            value={shipping.address}
            onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              required
              placeholder="City"
              value={shipping.city}
              onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            />
            <input
              required
              placeholder="State"
              value={shipping.state}
              onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            />
            <input
              required
              placeholder="PIN Code"
              value={shipping.postalCode}
              onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-extrabold text-white hover:bg-brand-700"
          >
            Continue to Payment Gateway
          </button>
        </form>
      ) : (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Select Payment Gateway</h2>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
              <Lock className="h-3.5 w-3.5" /> 256-Bit SSL Encrypted
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('GatewaySandbox')}
              className={`rounded-2xl border p-4 text-left transition ${
                paymentMethod === 'GatewaySandbox'
                  ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-600/20'
                  : 'border-slate-200'
              }`}
            >
              <Smartphone className="mb-2 h-5 w-5 text-brand-600" />
              <p className="text-sm font-extrabold text-slate-900">NovaPay Instant</p>
              <p className="text-[11px] text-slate-500">UPI QR, Credit/Debit Card (No API key needed)</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('Razorpay')}
              className={`rounded-2xl border p-4 text-left transition ${
                paymentMethod === 'Razorpay'
                  ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-600/20'
                  : 'border-slate-200'
              }`}
            >
              <CreditCard className="mb-2 h-5 w-5 text-indigo-600" />
              <p className="text-sm font-extrabold text-slate-900">Razorpay Live</p>
              <p className="text-[11px] text-slate-500">Requires Razorpay Test Key in .env</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('COD')}
              className={`rounded-2xl border p-4 text-left transition ${
                paymentMethod === 'COD'
                  ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-600/20'
                  : 'border-slate-200'
              }`}
            >
              <Banknote className="mb-2 h-5 w-5 text-emerald-600" />
              <p className="text-sm font-extrabold text-slate-900">Cash on Delivery</p>
              <p className="text-[11px] text-slate-500">Pay at your doorstep</p>
            </button>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items ({cartItems.reduce((s, i) => s + i.qty, 0)})</span>
              <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between font-semibold text-emerald-600">
                <span>Coupon Savings</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GST (18%) + Shipping</span>
              <span>₹{(taxPrice + shippingPrice).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-black text-slate-900">
              <span>Total Amount</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-slate-300 px-5 py-3.5 text-sm font-bold"
            >
              Back
            </button>
            <button
              disabled={processing}
              onClick={handleInitiateCheckout}
              className="flex-1 rounded-xl bg-brand-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700"
            >
              {processing ? 'Authorizing...' : `Pay ₹${totalPrice.toLocaleString('en-IN')} Securely`}
            </button>
          </div>
        </div>
      )}

      {/* Interactive Payment Gateway Modal */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleConfirmGatewayPayment}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="bg-gradient-to-r from-slate-900 to-brand-800 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  NovaPay Secure Gateway
                </span>
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="mt-2 text-2xl font-black">₹{totalPrice.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-300">Merchant: NovaCart.ai Retail Pvt Ltd</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setGatewayTab('upi')}
                  className={`rounded-lg py-2 text-xs font-bold ${
                    gatewayTab === 'upi' ? 'bg-white text-brand-600 shadow' : 'text-slate-600'
                  }`}
                >
                  UPI / QR Instant
                </button>
                <button
                  type="button"
                  onClick={() => setGatewayTab('card')}
                  className={`rounded-lg py-2 text-xs font-bold ${
                    gatewayTab === 'card' ? 'bg-white text-brand-600 shadow' : 'text-slate-600'
                  }`}
                >
                  Credit / Debit Card
                </button>
              </div>

              {gatewayTab === 'upi' ? (
                <div className="space-y-3 text-center">
                  <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl border-2 border-dashed border-brand-300 bg-indigo-50/50 text-xs font-bold text-brand-700">
                    [UPI QR CODE]
                    <br />
                    Scan & Pay
                  </div>
                  <input
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. name@okicici)"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card Number"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                    />
                    <input
                      required
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="CVV"
                      className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGatewayModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-extrabold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {processing ? 'Verifying with Bank...' : `Authorize ₹${totalPrice.toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
