import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    toast.success(`Welcome back, ${data.name}!`);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data);
    toast.success('Account created successfully!');
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    toast.success('Logged out');
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.error('Please login to save items to your wishlist');
      return;
    }
    const { data } = await api.post(`/auth/wishlist/${productId}`);
    setUser((prev) => ({ ...prev, wishlist: data }));
    toast.success('Wishlist updated');
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout, toggleWishlist }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
