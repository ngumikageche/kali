import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/layout/Footer.jsx";
import MobileBottomNav from "./components/layout/MobileBottomNav.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import TopBar from "./components/layout/TopBar.jsx";
import { storefrontConfig } from "./config/storefront.js";
import { initializeRegExAnalytics } from "./lib/regexAnalytics.js";
import CategoryPage from "./pages/CategoryPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductPage from "./pages/ProductPage.jsx";

function inferContentType(pathname) {
  if (pathname === "/") {
    return "home";
  }

  if (pathname.startsWith("/product")) {
    return "product";
  }

  if (pathname.startsWith("/category")) {
    return "category";
  }

  if (pathname === "/cart") {
    return "cart";
  }

  return "page";
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const analytics = initializeRegExAnalytics();
    analytics?.trackPageview();

    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      const pagePath = `${location.pathname}${location.search}${location.hash}`;

      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
        content_type: inferContentType(location.pathname)
      });
    }
  }, [location.pathname, location.search, location.hash]);

  return (
    <>
      <TopBar />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/product/:id/:name" element={<ProductPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/category/cart" element={<CartPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <a className="whatsapp" href={`https://wa.me/${storefrontConfig.whatsappNumber}`} aria-label="Chat with KALITACTICAL on WhatsApp">
        <MessageCircle size={20} />
        <span>+254 7XX XXX XXX - Chat with KALITACTICAL</span>
      </a>
      <MobileBottomNav />
      <Footer />
    </>
  );
}
