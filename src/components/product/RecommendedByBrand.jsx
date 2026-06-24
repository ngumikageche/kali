import ProductCard from "../ui/ProductCard.jsx";

export default function RecommendedByBrand({ products = [] }) {
  return (
    <section className="section container">
      <div className="section-heading">
        <h2>COMPLETE THE KIT</h2>
        <p>Related products from the same live catalog category or brand.</p>
      </div>
      <div className="complete-grid">
        {products.map((product) => <ProductCard product={product} key={product.id} compact />)}
      </div>
    </section>
  );
}
