import ProductCard from "../ui/ProductCard.jsx";

export default function FeaturedCollection({ products = [], companyName = "the storefront" }) {
  const featured = products.slice(0, 4);
  return (
    <section className="featured-band">
      <div className="container featured-layout">
        <div className="featured-intro">
          <p className="eyebrow">Featured Products</p>
          <h2>TOP PICKS FROM {companyName.toUpperCase()}</h2>
          <p>High-conviction products selected from the live catalog by rating, discounts, and best-seller flags.</p>
        </div>
        <div className="featured-grid">
          {featured.map((product) => <ProductCard key={product.id} product={product} compact />)}
        </div>
      </div>
    </section>
  );
}
