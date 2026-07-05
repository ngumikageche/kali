import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ResponsiveImage from "../ui/ResponsiveImage.jsx";

const slides = [
  {
    title: "PHANTOM SERIES - GEAR UP. MOVE SMART.",
    copy: "Built for the Field. Worn in the City. Premium tactical gear for Nairobi and East Africa.",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80",
    href: "/category/shop",
    actionLabel: "Shop Now"
  },
  {
    title: "FATHER'S DAY - GIFT THE FIELD-READY DAD",
    copy: "Gift bundles with up to 25% off selected boots, trousers, and jackets.",
    image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1600&q=80",
    href: "/category/sale",
    actionLabel: "View Sale"
  },
  {
    title: "NEW DROP - ALL-BLACK COLLECTION NOW LIVE",
    copy: "Dark military-luxury staples built around stealth palettes, ripstop fabrics, and everyday carry.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    href: "/category/shop",
    actionLabel: "Explore Drop"
  }
];

export default function HeroBanner({ slides: externalSlides = slides, companyName = "KALITACTICAL" }) {
  const resolvedSlides = externalSlides.filter((item) => item?.image && item?.title).length ? externalSlides.filter((item) => item?.image && item?.title) : slides;
  const [active, setActive] = useState(0);
  useEffect(() => {
    setActive(0);
  }, [resolvedSlides.length]);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((index) => (index + 1) % resolvedSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, [resolvedSlides.length]);

  const move = (step) => setActive((index) => (index + step + resolvedSlides.length) % resolvedSlides.length);
  const slide = resolvedSlides[active];
  const hasMultipleSlides = resolvedSlides.length > 1;

  return (
    <section className="hero">
      <div className="hero-media" aria-hidden="true">
        <ResponsiveImage
          src={slide.image}
          alt=""
          width={1600}
          height={1200}
          sizes="100vw"
          priority={active === 0}
          fill
        />
      </div>
      <div className="hero-overlay" />
      <div className="container hero-content">
        <p className="eyebrow">{companyName}</p>
        <h1>{slide.title}</h1>
        <p>{slide.copy}</p>
        <div className="hero-actions">
          <HeroAction className="btn btn-primary" href={slide.href}>{slide.actionLabel || "Explore"}</HeroAction>
          <Link className="btn btn-secondary" to="/category/shop">Shop All</Link>
        </div>
      </div>
      {hasMultipleSlides ? <button className="hero-arrow hero-prev" onClick={() => move(-1)} aria-label="Previous slide"><ChevronLeft /></button> : null}
      {hasMultipleSlides ? <button className="hero-arrow hero-next" onClick={() => move(1)} aria-label="Next slide"><ChevronRight /></button> : null}
      {hasMultipleSlides ? (
        <div className="hero-dots">
          {resolvedSlides.map((item, index) => (
            <button key={`${item.title}-${index}`} className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`Show ${item.title}`} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function HeroAction({ href, children, className }) {
  if (!href) {
    return <Link className={className} to="/category/shop">{children}</Link>;
  }

  if (/^https?:\/\//i.test(href)) {
    return <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>;
  }

  return <Link className={className} to={href}>{children}</Link>;
}
