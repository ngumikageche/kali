import ProductCard from "../ui/ProductCard.jsx";

export default function RecommendedProducts({ products = [] }) {
  return (
    <section className="section container">
      <div className="section-heading">
        <h2>Customers Also Bought</h2>
        <p>Popular add-ons and everyday tactical staples.</p>
      </div>
      <div className="product-row">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
