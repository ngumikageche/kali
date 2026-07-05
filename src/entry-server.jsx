import React from "react";
import { renderToString } from "react-dom/server";
import { Route, Routes } from "react-router-dom";
import { StaticRouter } from "react-router";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { PreloadedDataProvider } from "./context/PreloadedDataContext.jsx";
import { StorefrontProvider } from "./context/StorefrontContext.jsx";

export function render(url, preloadedData = {}) {
  return renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <PreloadedDataProvider value={preloadedData}>
          <CartProvider>
            <StorefrontProvider>
              <Routes>
                <Route path="/*" element={<App />} />
              </Routes>
            </StorefrontProvider>
          </CartProvider>
        </PreloadedDataProvider>
      </StaticRouter>
    </React.StrictMode>
  );
}
