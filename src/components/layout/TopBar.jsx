import { Heart, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";

export default function TopBar() {
  const { cartCount, wishlist } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem("kalitactical-topbar-dismissed") === "true") return;
    setVisible(true);
  }, []);

  const dismiss = () => {
    window.localStorage.setItem("kalitactical-topbar-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <span>Free delivery within Nairobi CBD on orders over KSh 3,000 | Same-day dispatch before 12PM</span>
        <nav aria-label="Account links">
          <Link to="/category/new-arrivals">Login</Link>
          <Link to="/category/bundles">
            <UserRound size={14} /> My Account
          </Link>
          <Link to="/category/sale">
            <Heart size={14} /> Wishlist {wishlist.length ? wishlist.length : ""}
          </Link>
          <Link to="/cart" className="cart-link">
            <ShoppingBag size={15} /> Cart <b>{cartCount}</b>
          </Link>
          <button className="topbar-close" onClick={dismiss} aria-label="Dismiss delivery notice"><X size={15} /></button>
        </nav>
      </div>
    </div>
  );
}
