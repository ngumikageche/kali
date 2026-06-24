import { useEffect, useState } from "react";

export default function PromoBanner({ promotion }) {
  const [seconds, setSeconds] = useState(10 * 60 * 60 + 24 * 60 + 38);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => (value > 0 ? value - 1 : 0)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <section className="container promo-wrap">
      <article className="promo promo-dark">
        <span>{promotion?.name || "Live Promotion"}</span>
        <h2>{promotion?.headline || promotion?.title || "Public offers from the active tenant"}</h2>
        <p>{promotion?.description || "Promotions from `/public/promotions` can be surfaced here as soon as they are enabled."}</p>
      </article>
      <article className="promo promo-light">
        <span className="urgency">Flash Sale</span>
        <h2>{promotion?.code ? `${promotion.code} ready for validation` : "Promo validation endpoint connected"}</h2>
        <strong className="countdown">{hh}:{mm}:{ss}</strong>
        <p>Use `/public/promotions/validate` and `/public/discounts/calculate` during checkout to confirm the final public discount.</p>
      </article>
    </section>
  );
}
