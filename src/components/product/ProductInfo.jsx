import { Heart, MessageCircle, Minus, Plus, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { storefrontConfig } from "../../config/storefront.js";
import { useCart } from "../../context/CartContext.jsx";
import { formatPrice } from "../../utils/format.js";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import StarRating from "../ui/StarRating.jsx";

const delivery = [
  ["Click & Collect", "CBD pickup points ready from 2PM on confirmed orders."],
  ["Standard Delivery", "2-3 days across listed zones, KSh 300 flat rate."],
  ["Same-Day Nairobi", "Order before 12PM for CBD, Westlands, Karen, and Ngong dispatch."]
];

export default function ProductInfo({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [size, setSize] = useState(product.sizes?.[0] || "Standard");
  const [color, setColor] = useState(product.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState("Click & Collect");
  const saving = product.oldPrice ? product.oldPrice - product.price : 0;

  return (
    <section className="product-info">
      <p className="eyebrow">KALITACTICAL</p>
      <h1>{product.name}</h1>
      <StarRating rating={product.rating} count={`${product.reviews} reviews`} />
      <div className="product-price">
        <strong>{formatPrice(product.price)}</strong>
        {product.oldPrice ? <span className="old-price">{formatPrice(product.oldPrice)}</span> : null}
        {saving ? <Badge tone="danger">Save {formatPrice(saving)}</Badge> : null}
      </div>
      <p className="stock-note">{product.requiresPrescription ? "Prescription requirements are flagged by the public API for this item." : "Live pricing and catalog details are loaded from the public storefront API."}</p>
      {product.sizes?.length ? (
        <div className="selector">
          <span>Size <a href="#size-guide">Size Guide</a></span>
          <div className="button-grid">
            {product.sizes.map((item) => (
              <button className={size === item ? "selected" : ""} onClick={() => setSize(item)} key={item}>{item}</button>
            ))}
          </div>
        </div>
      ) : null}
      {product.colors?.length ? (
        <div className="selector">
          <span>Color: {color}</span>
          <div className="swatches">
            {product.colors.map((item) => (
              <button className={color === item ? "selected" : ""} style={{ "--swatch": swatchColor(item) }} onClick={() => setColor(item)} key={item} aria-label={item} />
            ))}
          </div>
        </div>
      ) : null}
      <div className="quantity">
        <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={16} /></button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity"><Plus size={16} /></button>
      </div>
      <Button className="wide" onClick={() => addToCart(product, quantity, { size, color })}>ADD TO BASKET</Button>
      <Button variant="outline" className="wide" onClick={() => toggleWishlist(product)}>
        <Heart size={17} fill={isWishlisted(product.id) ? "currentColor" : "none"} /> SAVE TO WISHLIST
      </Button>
      <a className="btn btn-whatsapp wide" href={`https://wa.me/${storefrontConfig.whatsappNumber}`}><MessageCircle size={17} /> Ask us on WhatsApp</a>
      <div className="trust-row">
        <span><RotateCcw size={17} /> Free Returns</span>
        <span><ShieldCheck size={17} /> Authentic Gear</span>
        <span><Truck size={17} /> Nairobi Same-Day Delivery</span>
      </div>
      <div className="accordion">
        {delivery.map(([title, body]) => (
          <article key={title}>
            <button onClick={() => setOpen(open === title ? "" : title)}>{title}<span>{open === title ? "-" : "+"}</span></button>
            {open === title ? <p>{body}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function swatchColor(color) {
  return { Olive: "#3b4a2f", Black: "#0d0d0d", Sand: "#c9b99a", Navy: "#1f334a", Coyote: "#96764b" }[color] || "#4a4a4a";
}
