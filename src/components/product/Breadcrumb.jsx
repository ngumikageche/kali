import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Breadcrumb({ product }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link className="breadcrumb-back" to="/category/shop"><ChevronLeft size={17} /> Back</Link>
      <div className="breadcrumb-path">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/category/${product.category}`}>{product.categoryName || product.category?.replaceAll("-", " ")}</Link>
        <span>/</span>
        <span>{product.shortName || product.name}</span>
      </div>
    </nav>
  );
}
