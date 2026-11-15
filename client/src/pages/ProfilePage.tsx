import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/products/ProductCard';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState(user?.shippingAddress?.address || '');
  const [city, setCity] = useState(user?.shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(user?.shippingAddress?.postalCode || '');
  const [phone, setPhone] = useState(user?.shippingAddress?.phone || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', {
        name,
        shippingAddress: { address, city, postalCode, phone },
      });
      setUser(data);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-12">
      <form onSubmit={handleSave} className="max-w-xl space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-black text-slate-900">Profile & Default Shipping</h1>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full rounded-xl border border-slate-300 p-3 text-sm"
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street Address"
          className="w-full rounded-xl border border-slate-300 p-3 text-sm"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm"
          />
          <input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="PIN Code"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm"
          />
        </div>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          className="w-full rounded-xl border border-slate-300 p-3 text-sm"
        />
        <button type="submit" className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white">
          Save Changes
        </button>
      </form>

      <div>
        <h2 className="mb-5 text-xl font-black text-slate-900">
          Saved Wishlist ({user?.wishlist?.length || 0})
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {user?.wishlist?.map((prod) =>
            typeof prod === 'object' ? <ProductCard key={prod._id} product={prod} /> : null
          )}
        </div>
      </div>
    </div>
  );
}
