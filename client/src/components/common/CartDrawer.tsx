import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const {
    cartItems,
    drawerOpen,
    setDrawerOpen,
    updateQty,
    removeFromCart,
    itemsPrice,
    shippingPrice,
    totalPrice,
  } = useCart();
  const navigate = useNavigate();

  const freeShipProgress = Math.min(100, Math.round((itemsPrice / 999) * 100));

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShoppingBag className="h-5 w-5 text-brand-600" />
                <span>Shopping Bag ({cartItems.reduce((s, i) => s + i.qty, 0)})</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="bg-indigo-50/80 px-5 py-3">
              <p className="text-xs font-semibold text-indigo-900">
                {itemsPrice >= 999
                  ? 'You unlocked FREE Express Delivery!'
                  : `Add ₹${(999 - itemsPrice).toLocaleString('en-IN')} more for FREE Express Delivery`}
              </p>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-indigo-200">
                <div
                  className="h-full bg-brand-600 transition-all duration-300"
                  style={{ width: `${freeShipProgress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {cartItems.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-sm font-semibold text-slate-700">Your bag is currently empty.</p>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/shop');
                    }}
                    className="mt-4 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white"
                  >
                    Explore Catalog
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-3.5 rounded-2xl border border-slate-200 p-3"
                  >
                    <img
                      src={item.images?.[0]?.url}
                      alt={item.name}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/product/${item._id}`}
                        onClick={() => setDrawerOpen(false)}
                        className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-brand-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {[item.selectedColor, item.selectedSize].filter(Boolean).join(' • ')}
                      </p>
                      <p className="mt-1 text-sm font-bold text-brand-600">
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-slate-200">
                          <button
                            onClick={() => updateQty(item._id, item.qty - 1)}
                            className="p-1 text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item._id, Math.min(item.stock, item.qty + 1))}
                            className="p-1 text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t bg-slate-50 p-5 space-y-3">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900">
                  <span>Estimated Total (incl. GST)</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/cart');
                    }}
                    className="rounded-xl border border-slate-300 bg-white py-3 text-xs font-bold text-slate-800 hover:bg-slate-100"
                  >
                    View Full Bag
                  </button>
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      navigate('/checkout');
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-700"
                  >
                    Checkout <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
