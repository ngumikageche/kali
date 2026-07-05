import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => readStored("kalit-cart", []));
  const [wishlist, setWishlist] = useState(() => readStored("kalit-wishlist", []));
  const [trackedOrders, setTrackedOrders] = useState(() => readStored("kalit-orders", []));
  const [customerProfile, setCustomerProfile] = useState(() => readStored("kalit-profile", {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: ""
  }));

  useEffect(() => {
    writeStored("kalit-cart", cart);
  }, [cart]);

  useEffect(() => {
    writeStored("kalit-wishlist", wishlist);
  }, [wishlist]);

  useEffect(() => {
    writeStored("kalit-orders", trackedOrders);
  }, [trackedOrders]);

  useEffect(() => {
    writeStored("kalit-profile", customerProfile);
  }, [customerProfile]);

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

  const saveCustomerProfile = (profile = {}) => {
    setCustomerProfile((current) => ({
      ...current,
      ...profile
    }));
  };

  const placeOrder = (customer = {}) => {
    if (!cart.length) {
      return null;
    }

    const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const delivery = subtotal >= 3000 ? 0 : 300;
    const mergedCustomer = {
      ...customerProfile,
      ...customer
    };
    const order = createTrackedOrder(cart, subtotal, delivery, mergedCustomer);

    setTrackedOrders((items) => [order, ...items].slice(0, 12));
    setCustomerProfile((current) => ({
      ...current,
      ...mergedCustomer
    }));
    setCart([]);

    return order;
  };

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      trackedOrders,
      customerProfile,
      cartCount: cart.reduce((total, item) => total + item.quantity, 0),
      cartSubtotal: cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      saveCustomerProfile,
      placeOrder,
      toggleWishlist,
      isWishlisted: (id) => wishlist.some((item) => item.id === id)
    }),
    [cart, customerProfile, trackedOrders, wishlist]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

function readStored(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures and keep the UI usable.
  }
}

function createTrackedOrder(cart, subtotal, delivery, customer) {
  const createdAt = new Date().toISOString();
  const reference = `KT-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  return {
    id: reference,
    reference,
    createdAt,
    status: "confirmed",
    statusIndex: 1,
    estimatedDelivery: delivery === 0 ? "Today by 6PM" : "Within 2-3 business days",
    customer: {
      name: customer.name || "Customer",
      contact: customer.contact || ""
    },
    subtotal,
    delivery,
    total: subtotal + delivery,
    items: cart.map((item) => ({
      key: item.key,
      quantity: item.quantity,
      options: item.options,
      product: item.product
    }))
  };
}
