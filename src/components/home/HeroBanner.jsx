import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ResponsiveImage from "../ui/ResponsiveImage.jsx";

const slides = [
  {
    title: "Equipment for the decisive day.",
    copy: "Purpose-built apparel, field gear, and everyday carry for Nairobi and beyond.",
    image: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=2000&q=85",
    href: "/category/shop",
    actionLabel: "Shop the collection"
  },
  {
    title: "Built to be used, not displayed.",
    copy: "Durable layers and utility pieces that hold their ground in changing conditions.",
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=2000&q=85",
    href: "/category/sale",
    actionLabel: "Explore field layers"
  },
  {
    title: "Quiet strength, everyday utility.",
    copy: "A considered collection of tactical essentials in refined, durable materials.",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2000&q=85",
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
          <Link className="btn btn-secondary" to="/category/new-arrivals">New Arrivals</Link>
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
