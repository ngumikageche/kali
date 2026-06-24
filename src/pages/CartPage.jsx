import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import ResponsiveImage from "../components/ui/ResponsiveImage.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";

export default function CartPage() {
  const { cart, cartSubtotal, clearCart, removeFromCart, updateQuantity } = useCart();
  const delivery = cartSubtotal >= 3000 ? 0 : 300;
  const total = cartSubtotal + delivery;

  return (
    <section className="section container cart-page">
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
                  <Link to={`/products/${item.product.routeKey || item.product.slug || item.product.id}`}>{item.product.shortName || item.product.name}</Link>
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
            <button className="btn btn-primary">CHECKOUT</button>
            <button className="btn btn-outline" onClick={clearCart}>CLEAR CART</button>
            <p>Same-day Nairobi dispatch before 12PM. Asante for choosing KALITACTICAL.</p>
          </aside>
        </div>
      )}
    </section>
  );
}
