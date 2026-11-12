import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('novacart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('novacart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    if (product.stock < 1) { toast.error('This product is out of stock'); return; }
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        const newQty = Math.min(existing.qty + qty, product.stock);
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: newQty } : item
        );
      }
      return [...prev, { ...product, qty: Math.min(qty, product.stock) }];
    });
    toast.success(`Added "${product.name}" to cart`);
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item._id === productId ? { ...item, qty: Math.min(Math.max(1, Math.floor(qty)), item.stock) } : item))
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('novacart_items');
  };

  const itemsPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 999 || itemsPrice === 0 ? 0 : 99;
  const taxPrice = Math.round(itemsPrice * 0.18);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  const totalCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
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
