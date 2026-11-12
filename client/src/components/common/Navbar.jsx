import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Sparkles, User, LogOut, ShieldCheck, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            NovaCart<span className="text-brand-600">.ai</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <Link to="/shop" className="hover:text-brand-600">Explore Catalog</Link>
          {user && (
            <Link to="/orders" className="flex items-center gap-1 hover:text-brand-600">
              <Package className="h-4 w-4" /> My Orders
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700 hover:bg-amber-100"
            >
              <ShieldCheck className="h-4 w-4" /> Admin Studio
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ShoppingBag className="h-4 w-4 text-brand-600" />
            <span>Cart</span>
            {totalCount > 0 && (
              <span className="ml-1 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
                {totalCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
