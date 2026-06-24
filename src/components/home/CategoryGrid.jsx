import { Link } from "react-router-dom";
import ResponsiveImage from "../ui/ResponsiveImage.jsx";

export default function CategoryGrid({ categories = [] }) {
  return (
    <section className="section container">
      <div className="section-heading">
        <h2>Shop by Category</h2>
        <p>Premium tactical clothing and gear, sorted for fast decisions.</p>
      </div>
      <div className="category-grid">
        {categories.map((category) => (
          <Link className="category-tile" to={`/category/${category.slug}`} key={category.slug}>
            <ResponsiveImage
              src={category.image}
              alt={category.name}
              width={480}
              height={480}
              sizes="(max-width: 720px) 170px, (max-width: 1024px) 33vw, 16vw"
            />
            <span>{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
