import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Sign in failed');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">Sign In to NovaCart</h1>
        <p className="text-xs text-slate-500">
          Demo Admin: <code>admin@novacart.ai</code> / <code>Admin@123</code>
        </p>
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
          New to NovaCart?{' '}
          <Link to="/register" className="font-bold text-brand-600">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
