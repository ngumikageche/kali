import { Home, Search, ShoppingBag, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";

export default function MobileBottomNav() {
  const { cartCount } = useCart();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!window.visualViewport) return;
    const viewport = window.visualViewport;
    const onResize = () => setHidden(viewport.height < window.innerHeight * 0.75);
    viewport.addEventListener("resize", onResize);
    return () => viewport.removeEventListener("resize", onResize);
  }, []);

  return (
    <nav className={`mobile-bottom-nav ${hidden ? "hidden" : ""}`} aria-label="Mobile navigation">
      <NavLink to="/"><Home /><span>Home</span></NavLink>
      <NavLink to="/category/shop"><Search /><span>Search</span></NavLink>
      <NavLink to="/cart"><ShoppingBag /><span>Cart</span><b>{cartCount}</b></NavLink>
      <NavLink to="/category/account"><UserRound /><span>Account</span></NavLink>
    </nav>
  );
}
