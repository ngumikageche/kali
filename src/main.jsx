import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { StorefrontProvider } from "./context/StorefrontContext.jsx";
import "./styles/tokens.css";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <StorefrontProvider>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </StorefrontProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
