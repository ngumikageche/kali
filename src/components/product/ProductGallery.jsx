import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import ResponsiveImage from "../ui/ResponsiveImage.jsx";

export default function ProductGallery({ product }) {
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const [active, setActive] = useState(0);
  const move = (step) => setActive((index) => (index + step + gallery.length) % gallery.length);

  return (
    <section className="gallery">
      <div className="gallery-main">
        <ResponsiveImage
          src={gallery[active]}
          alt={product.name}
          width={960}
          height={960}
          sizes="(max-width: 1024px) calc(100vw - 24px), 46vw"
          priority={active === 0}
        />
        <div className="gallery-badges">
          <span>NEW</span>
          {product.oldPrice ? <span className="sale">SALE</span> : null}
          {product.rating >= 4.8 ? <span>BEST SELLER</span> : null}
        </div>
        <button className="gallery-arrow left" onClick={() => move(-1)} aria-label="Previous image"><ChevronLeft /></button>
        <button className="gallery-arrow right" onClick={() => move(1)} aria-label="Next image"><ChevronRight /></button>
      </div>
      <div className="thumb-strip">
        {gallery.map((image, index) => (
          <button className={active === index ? "active" : ""} onClick={() => setActive(index)} key={image}>
            <ResponsiveImage
              src={image}
              alt={`${product.name} view ${index + 1}`}
              width={192}
              height={192}
              sizes="(max-width: 1024px) 22vw, 10vw"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
