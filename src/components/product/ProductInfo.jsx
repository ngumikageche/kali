import { Heart, MessageCircle, Minus, Plus, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
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
  const priceOptions = normalizePriceOptions(product.prices);
  const availability = getAvailability(product);
  const productTags = [
    ...(product.isBestSeller ? ["Best Seller"] : []),
    ...product.tags,
    ...product.medicalConditions
  ].filter(Boolean).slice(0, 6);
  const productFacts = [
    { label: "Category", value: product.categoryName || "Shop" },
    { label: "Subcategory", value: product.subcategoryName || "General" },
    { label: "Availability", value: availability },
    { label: "SKU", value: product.sku || "Auto-generated" }
  ];
  const categoryHref = product.category ? `/category/${product.category}` : "/category/shop";

  return (
    <section className="product-info">
      <p className="eyebrow">{product.brand || product.categoryName || "KALITACTICAL"}</p>
      <div className="product-kicker">
        <Link to={categoryHref}>{product.categoryName || "Shop"}</Link>
        {product.subcategoryName ? <><span>/</span><span>{product.subcategoryName}</span></> : null}
      </div>
      <h1>{product.name}</h1>
      <StarRating rating={product.rating} count={`${product.reviews} reviews`} />
      <div className="product-price">
        <strong>{formatPrice(product.price)}</strong>
        {product.oldPrice ? <span className="old-price">{formatPrice(product.oldPrice)}</span> : null}
        {saving ? <Badge tone="danger">Save {formatPrice(saving)}</Badge> : null}
        {!saving && product.discountPercent ? <Badge tone="danger">{product.discountPercent}% off</Badge> : null}
      </div>
      <p className="stock-note">
        {product.requiresPrescription
          ? "Special purchase requirements apply to this item."
          : product.isInStock
            ? "Current pricing and availability are shown for this item."
            : "This item is currently out of stock in the public catalog."}
      </p>
      <div className="product-meta-grid">
        {productFacts.map((item) => (
          <article className="product-meta-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
      {product.keyFeatures?.length ? (
        <div className="product-feature-block">
          <span className="product-section-label">Key features</span>
          <ul className="product-feature-list">
            {product.keyFeatures.slice(0, 5).map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
        </div>
      ) : null}
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
      {priceOptions.length ? (
        <div className="product-price-options">
          <span className="product-section-label">Price options</span>
          <div className="price-option-list">
            {priceOptions.map((item) => (
              <article className="price-option-card" key={item.key}>
                <div>
                  <strong>{item.label}</strong>
                  {item.note ? <p>{item.note}</p> : null}
                </div>
                <span>{formatPrice(item.amount)}</span>
              </article>
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
      {productTags.length ? (
        <div className="product-tags">
          {productTags.map((tag) => <span className="product-tag" key={tag}>{tag}</span>)}
        </div>
      ) : null}
    </section>
  );
}

function swatchColor(color) {
  return { Olive: "#3b4a2f", Black: "#0d0d0d", Sand: "#c9b99a", Navy: "#1f334a", Coyote: "#96764b" }[color] || "#4a4a4a";
}

function getAvailability(product) {
  if (product.requiresPrescription) {
    return "Restricted";
  }

  if (product.isInStock === false) {
    return "Out of stock";
  }

  if (Number.isFinite(product.stockQuantity)) {
    return product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock";
  }

  return "Available";
}

function normalizePriceOptions(prices = []) {
  return prices
    .map((item, index) => {
      const amount = toNumber(
        item?.price ??
        item?.amount ??
        item?.value ??
        item?.unit_price ??
        item?.selling_price
      );

      if (amount == null) {
        return null;
      }

      const minQuantity = toNumber(item?.minimum_quantity ?? item?.min_quantity ?? item?.min_qty);
      const maxQuantity = toNumber(item?.maximum_quantity ?? item?.max_quantity ?? item?.max_qty);
      const label = item?.label || item?.name || item?.price_category_name || item?.category_name || `Option ${index + 1}`;
      const quantityRange = minQuantity && maxQuantity
        ? `${minQuantity}-${maxQuantity} units`
        : minQuantity
          ? `${minQuantity}+ units`
          : maxQuantity
            ? `Up to ${maxQuantity} units`
            : "";

      return {
        key: `${label}-${index}`,
        label,
        amount,
        note: quantityRange
      };
    })
    .filter(Boolean);
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
