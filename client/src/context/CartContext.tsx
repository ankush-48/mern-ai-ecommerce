import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CartItem, Product } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  drawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addToCart: (product: Product, qty?: number, selectedColor?: string, selectedSize?: string) => void;
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  discountAmount: number;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  totalCount: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('novacart_enterprise_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    localStorage.setItem('novacart_enterprise_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, qty = 1, selectedColor = '', selectedSize = '') => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        const newQty = Math.min(existing.qty + qty, product.stock);
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, qty: newQty, selectedColor: selectedColor || item.selectedColor, selectedSize: selectedSize || item.selectedSize }
            : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          qty: Math.min(qty, product.stock),
          selectedColor: selectedColor || product.variants?.colors?.[0] || '',
          selectedSize: selectedSize || product.variants?.sizes?.[0] || '',
        },
      ];
    });
    toast.success(`Added "${product.name.slice(0, 32)}..." to bag`);
    setDrawerOpen(true);
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item._id === productId ? { ...item, qty } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
    toast.success('Item removed');
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
    localStorage.removeItem('novacart_enterprise_cart');
  };

  const itemsPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const applyCoupon = (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (['NOVA10', 'WELCOME500', 'FREESHIP'].includes(normalized)) {
      setCouponCode(normalized);
      toast.success(`Coupon ${normalized} applied!`);
      return true;
    }
    toast.error('Invalid promo code. Try NOVA10, WELCOME500, or FREESHIP');
    return false;
  };

  let discountAmount = 0;
  if (couponCode === 'NOVA10') discountAmount = Math.round(itemsPrice * 0.1);
  if (couponCode === 'WELCOME500' && itemsPrice >= 1999) discountAmount = 500;

  const shippingPrice =
    couponCode === 'FREESHIP' || itemsPrice > 999 || itemsPrice === 0 ? 0 : 99;
  const taxable = Math.max(0, itemsPrice - discountAmount);
  const taxPrice = Math.round(taxable * 0.18);
  const totalPrice = taxable + shippingPrice + taxPrice;
  const totalCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        drawerOpen,
        setDrawerOpen,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        couponCode,
        applyCoupon,
        discountAmount,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
