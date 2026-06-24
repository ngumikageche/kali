import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { storefrontConfig } from "../../config/storefront.js";
import { useCart } from "../../context/CartContext.jsx";
import { useStorefront } from "../../context/StorefrontContext.jsx";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { cartCount, wishlist } = useCart();
  const { categories } = useStorefront();
  const navigate = useNavigate();
  const links = [
    ["Shop", "/category/shop"],
    ...categories.slice(0, 3).map((category) => [category.name, `/category/${category.slug}`]),
    ["About", "/category/about"],
    ["Contact", "/category/contact"]
  ];

  useEffect(() => {
    document.body.classList.toggle("nav-drawer-open", open);
    return () => document.body.classList.remove("nav-drawer-open");
  }, [open]);

  function handleSearch(event) {
    event.preventDefault();
    navigate(`/category/shop${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`);
    setOpen(false);
    setSearchOpen(false);
  }

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link className="logo" to="/" onClick={() => setOpen(false)}>
          KALITACTICAL
        </Link>
        <form className={`searchbar ${searchOpen ? "search-open" : ""}`} onSubmit={handleSearch}>
          <Search size={18} />
          <input aria-label="Search products" placeholder="Search products, brands, tags..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </form>
        <div className="nav-actions">
          <button className="icon-button search-toggle" type="button" onClick={() => setSearchOpen((value) => !value)} aria-label="Search">
            <Search />
          </button>
          <Link className="icon-button" to="/category/sale" aria-label="Wishlist"><Heart /><span>{wishlist.length}</span></Link>
          <Link className="icon-button cart-button cart-pop" to="/cart" aria-label={`Cart with ${cartCount} items`}>
            <ShoppingBag />
            <em>Cart</em>
            <span>{cartCount}</span>
          </Link>
        </div>
        <button className="icon-button nav-toggle" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "nav-links open" : "nav-links"}>
          {links.map(([label, href]) => (
            <NavLink key={label} to={href} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
          <a className="drawer-whatsapp" href={`https://wa.me/${storefrontConfig.whatsappNumber}`}>Ask us on WhatsApp</a>
        </nav>
      </div>
    </header>
  );
}
