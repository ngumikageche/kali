import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const addToCart = (product, quantity = 1, options = {}) => {
    setCart((items) => {
      const key = `${product.id}-${options.size || "std"}-${options.color || "std"}`;
      const existing = items.find((item) => item.key === key);
      if (existing) {
        return items.map((item) => (item.key === key ? { ...item, quantity: item.quantity + quantity } : item));
      }
      return [...items, { key, product, quantity, options }];
    });
  };

  const toggleWishlist = (product) => {
    setWishlist((items) => (items.some((item) => item.id === product.id) ? items.filter((item) => item.id !== product.id) : [...items, product]));
  };

  const updateQuantity = (key, quantity) => {
    setCart((items) => items.map((item) => (item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item)));
  };

  const removeFromCart = (key) => {
    setCart((items) => items.filter((item) => item.key !== key));
  };

  const clearCart = () => setCart([]);

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      cartCount: cart.reduce((total, item) => total + item.quantity, 0),
      cartSubtotal: cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted: (id) => wishlist.some((item) => item.id === id)
    }),
    [cart, wishlist]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
