import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <input
          required
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-300 p-3 text-sm"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 p-3 text-sm"
        />
        <button type="submit" className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white">
          Sign In
        </button>
        <p className="text-center text-xs text-slate-500">
          Don’t have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
