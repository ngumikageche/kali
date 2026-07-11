export default function PromoBanner({ promotion }) {
  return (
    <section className="container promo-wrap">
      <article className="promo promo-dark">
        <span>{promotion?.name || "Seasonal field notes"}</span>
        <h2>{promotion?.headline || promotion?.title || "Built for long days and hard use."}</h2>
        <p>{promotion?.description || "Considered equipment for the field, the commute, and every mile between."}</p>
      </article>
      <article className="promo promo-light">
        <span>Service standard</span>
        <h2>Nairobi delivery, considered from checkout to doorstep.</h2>
        <p>Secure checkout with M-Pesa, Airtel Money, Visa, Mastercard, and cash on delivery.</p>
      </article>
    </section>
  );
}
