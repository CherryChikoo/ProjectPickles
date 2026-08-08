'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CartItem = {
  productId: string;
  name: string;
  price: string; // Stored as string '₹250' or number, we'll parse to number
  weight: string;
  imageBase64: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('hema-sathya-cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('hema-sathya-cart', JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      const existing = prev.find(item => item.productId === newItem.productId);
      if (existing) {
        return prev.map(item => 
          item.productId === newItem.productId 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartTotal = items.reduce((sum, item) => {
    const priceStr = String(item.price);
    const numericPrice = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
    return sum + (numericPrice * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
