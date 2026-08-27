"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: string; // productId-size-color key
  productId: number;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  maxStock: number;
}

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  slug: string;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: number) => boolean;
  cartCount: number;
  cartSubtotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("olive_dreams_cart");
    const savedWishlist = localStorage.getItem("olive_dreams_wishlist");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("olive_dreams_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("olive_dreams_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded]);

  const addToCart = useCallback((newItem: Omit<CartItem, "id">) => {
    const itemId = `${newItem.productId}-${newItem.size}-${newItem.color}`;
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === itemId);
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const newQty = updatedCart[existingItemIndex].quantity + newItem.quantity;
        // Cap quantity at available stock
        updatedCart[existingItemIndex].quantity = Math.min(newQty, newItem.maxStock);
        return updatedCart;
      }
      return [...prevCart, { ...newItem, id: itemId }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const clampedQty = Math.max(1, Math.min(quantity, item.maxStock));
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((w) => w.id === item.id);
      if (exists) {
        return prevWishlist.filter((w) => w.id !== item.id);
      }
      return [...prevWishlist, item];
    });
  }, []);

  const isInWishlist = useCallback((id: number) => {
    return wishlist.some((item) => item.id === id);
  }, [wishlist]);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
