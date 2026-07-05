import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SeoHead from "../components/seo/SeoHead.jsx";
import ResponsiveImage from "../components/ui/ResponsiveImage.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";

export default function CartPage() {
  const { cart, cartSubtotal, clearCart, customerProfile, placeOrder, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState(customerProfile?.name || "");
  const [customerContact, setCustomerContact] = useState(customerProfile?.email || customerProfile?.phone || "");
  const delivery = cartSubtotal >= 3000 ? 0 : 300;
  const total = cartSubtotal + delivery;

  function handleCheckout(event) {
    event.preventDefault();
    const order = placeOrder({
      name: customerName.trim(),
      contact: customerContact.trim()
    });

    if (!order) {
      return;
    }

    if (typeof window !== "undefined" && typeof window.rxTrackConversion === "function") {
      window.rxTrackConversion("purchase", total);
    }

    setCheckoutOpen(false);
    setCustomerName("");
    setCustomerContact("");
    navigate(`/category/account?order=${encodeURIComponent(order.reference)}`);
  }

  return (
    <section className="section container cart-page">
      <SeoHead title="Cart | Kali Tactical" description="Review your selected tactical gear before checkout." path="/cart" noindex />
      <div className="section-heading">
        <div>
          <p className="eyebrow">KALITACTICAL</p>
          <h1>Your Cart</h1>
        </div>
        <p>Review your kit before checkout. Free Nairobi CBD delivery applies over KSh 3,000.</p>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <ShoppingBag size={42} />
          <h2>Your cart is empty</h2>
          <p>Add Phantom Series gear, boots, jackets, or accessories and they will appear here.</p>
          <Link className="btn btn-primary" to="/category/shop">SHOP NOW</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <article className="cart-item" key={item.key}>
                <ResponsiveImage
                  src={item.product.image}
                  alt={item.product.name}
                  width={224}
                  height={224}
                  sizes="112px"
                />
                <div className="cart-item-copy">
                  <Link to={item.product.productHref || (item.product.publicSlug ? `/products/${item.product.publicSlug}` : `/product/${item.product.id}`)}>{item.product.shortName || item.product.name}</Link>
                  <span>{item.options.size || "Standard"} / {item.options.color || "Default"}</span>
                  <strong>{formatPrice(item.product.price)}</strong>
                </div>
                <div className="cart-qty">
                  <button onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={16} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label="Increase quantity"><Plus size={16} /></button>
                </div>
                <button className="cart-remove" onClick={() => removeFromCart(item.key)} aria-label="Remove item"><Trash2 size={18} /></button>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h2>Order Summary</h2>
            <div><span>Subtotal</span><strong>{formatPrice(cartSubtotal)}</strong></div>
            <div><span>Delivery</span><strong>{delivery === 0 ? "Free" : formatPrice(delivery)}</strong></div>
            <div><span>M-Pesa / COD</span><strong>Available</strong></div>
            <div className="cart-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
            <button className="btn btn-primary" type="button" onClick={() => setCheckoutOpen(true)}>CHECKOUT</button>
            <button className="btn btn-outline" onClick={clearCart}>CLEAR CART</button>
            <p>Same-day Nairobi dispatch before 12PM. Asante for choosing KALITACTICAL.</p>
          </aside>
        </div>
      )}
      {checkoutOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="review-modal checkout-modal" onSubmit={handleCheckout}>
            <h2>Confirm your order</h2>
            <label>Name<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Your full name" required /></label>
            <label>Email or phone<input value={customerContact} onChange={(event) => setCustomerContact(event.target.value)} placeholder="you@example.com / +254..." required /></label>
            <div className="checkout-summary-lines">
              <div><span>Items total</span><strong>{formatPrice(cartSubtotal)}</strong></div>
              <div><span>Delivery</span><strong>{delivery === 0 ? "Free" : formatPrice(delivery)}</strong></div>
              <div><span>Order total</span><strong>{formatPrice(total)}</strong></div>
            </div>
            <button className="btn btn-primary" type="submit">PLACE ORDER</button>
            <button className="btn btn-outline" type="button" onClick={() => setCheckoutOpen(false)}>CANCEL</button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
