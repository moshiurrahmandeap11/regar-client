'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('regar_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('regar_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, color, size, quantity = 1, imageOverride = null) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product._id && item.color === color && item.size === size);
      if (existing) {
        return prev.map(item => item.productId === product._id && item.color === color && item.size === size
          ? { ...item, quantity: item.quantity + quantity }
          : item
        );
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: imageOverride || product.images?.[0],
        color,
        size,
        quantity,
        maxTickets: product.maxTickets,
      }];
    });
  };

  const removeFromCart = (productId, color, size) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.color === color && item.size === size)));
  };

  const updateQuantity = (productId, color, size, quantity) => {
    if (quantity < 1) return removeFromCart(productId, color, size);
    setCart(prev => prev.map(item => item.productId === productId && item.color === color && item.size === size
      ? { ...item, quantity }
      : item
    ));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
