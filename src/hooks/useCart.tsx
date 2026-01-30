"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/data/types";
export type { CartItem };

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartLoading: boolean;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => { },
  removeFromCart: () => { },
  updateQuantity: () => { },
  clearCart: () => { },
  total: 0,
  itemCount: 0,
  isCartLoading: true, // Ensure isCartLoading has a default value
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes, but only after initialization
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("cart", JSON.stringify(items));
        // Set expiration time - 7 days from now
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 7);
        localStorage.setItem("cartExpiration", expiration.toISOString());
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [items, isInitialized]);

  const addToCart = (newItem: CartItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          item.id === newItem.id &&
          item.selectedSize === newItem.selectedSize &&
          item.selectedColor?.label === newItem.selectedColor?.label,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === newItem.id &&
            item.selectedSize === newItem.selectedSize &&
            item.selectedColor?.label === newItem.selectedColor?.label
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item,
        );
      }

      return [...currentItems, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem("cart");
      localStorage.removeItem("cartExpiration");
    } catch (error) {
      console.error("Error clearing cart from localStorage:", error);
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isCartLoading: !isInitialized,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  // No need to check for undefined since we provide a default value
  return context;
}
