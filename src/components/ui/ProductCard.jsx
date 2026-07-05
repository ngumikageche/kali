import { ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { formatPrice } from "../../utils/format.js";
import Button from "./Button.jsx";
import ResponsiveImage from "./ResponsiveImage.jsx";
import StarRating from "./StarRating.jsx";

export default function ProductCard({ product, compact = false }) {
  const { addToCart } = useCart();
  const productHref = product.productHref || (product.publicSlug ? `/products/${product.publicSlug}` : `/product/${product.id}`);
  const productLabel = product.brand || product.categoryName || "Product";

  return (
    <article className={`product-card ${compact ? "product-card-compact" : ""}`}>
      <Link to={productHref} className="product-media">
        <ResponsiveImage
          src={product.image}
          alt={product.name}
          width={720}
          height={540}
          sizes="(max-width: 720px) 82vw, (max-width: 1024px) 42vw, 25vw"
        />
        {product.oldPrice ? <span className="sale-flag">Sale</span> : null}
      </Link>
      <div className="product-copy">
        <p className="product-label">{productLabel}</p>
        <Link to={productHref} className="product-name">
          {product.shortName || product.name}
        </Link>
        <StarRating rating={product.rating} count={product.reviews} compact />
        <div className="price-row">
          <strong>{formatPrice(product.price)}</strong>
          {product.oldPrice ? <span>{formatPrice(product.oldPrice)}</span> : null}
        </div>
        <Button onClick={() => addToCart(product)} className="card-button">
          <ShoppingBasket size={16} />
          ADD TO BASKET
        </Button>
      </div>
    </article>
  );
}
