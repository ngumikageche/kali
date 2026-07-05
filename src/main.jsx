import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { PreloadedDataProvider } from "./context/PreloadedDataContext.jsx";
import { StorefrontProvider } from "./context/StorefrontContext.jsx";
import "./styles/tokens.css";
import "./styles/global.css";

const rootElement = document.getElementById("root");
const preloadedData = window.__PRELOADED_DATA__ || {};
const app = (
  <React.StrictMode>
    <BrowserRouter>
      <PreloadedDataProvider value={preloadedData}>
        <CartProvider>
          <StorefrontProvider>
            <Routes>
              <Route path="/*" element={<App />} />
            </Routes>
          </StorefrontProvider>
        </CartProvider>
      </PreloadedDataProvider>
    </BrowserRouter>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
