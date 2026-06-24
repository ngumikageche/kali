import { Building2, MapPin, Smartphone, Truck } from "lucide-react";
import { Link } from "react-router-dom";
export default function LocalAds({ stores = [] }) {
  const ads = [
    {
      title: stores[0]?.name || "Storefront Pickup",
      copy: stores[0]?.address || "Public branch addresses will appear here when configured.",
      cta: "Shop Live Catalog",
      href: "/category/shop",
      Icon: Truck
    },
    {
      title: "M-Pesa Checkout",
      copy: "Public checkout supports whatsapp, paybill, both, and stk when the tenant enables them.",
      cta: "View Payment Options",
      href: "/category/payment",
      Icon: Smartphone
    },
    {
      title: "Bulk and Team Orders",
      copy: "Use the live public checkout or contact page for large catalogue requests.",
      cta: "Contact Sales",
      href: "/category/contact",
      Icon: Building2
    },
    {
      title: stores[1]?.name || "Branch Coverage",
      copy: stores[1]?.address || "Additional branches from `/public/stores` will appear here automatically.",
      cta: "Delivery Zones",
      href: "/category/delivery",
      Icon: MapPin
    }
  ];

  return (
    <section className="local-ads">
      <div className="container">
        <div className="local-ad-lead">
          <p className="eyebrow">Local Dispatch</p>
          <h2>Nairobi-built service for tactical buyers</h2>
          <Link className="btn btn-secondary" to="/category/contact">TALK TO KALITACTICAL</Link>
        </div>
        <div className="local-ad-grid">
          {ads.map(({ title, copy, cta, href, Icon }) => (
            <article className="local-ad-card" key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{copy}</p>
              <Link to={href}>{cta}</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
