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
        <h2>{promotion?.headline || promotion?.title || "Fresh offers on tactical gear"}</h2>
        <p>{promotion?.description || "Shop limited-time savings on apparel, boots, accessories, and field-ready essentials."}</p>
      </article>
      <article className="promo promo-light">
        <span className="urgency">Flash Sale</span>
        <h2>{promotion?.code ? `Use code ${promotion.code} at checkout` : "Extra savings available at checkout"}</h2>
        <strong className="countdown">{hh}:{mm}:{ss}</strong>
        <p>Your eligible discount will be applied during checkout before you place your order.</p>
      </article>
    </section>
  );
}
