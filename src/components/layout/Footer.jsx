import { BriefcaseBusiness, Camera, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useStorefront } from "../../context/StorefrontContext.jsx";
import { formatStoreHours } from "../../utils/storefront.js";

export default function Footer() {
  const { categories, company, stores } = useStorefront();
  const primaryStore = stores[0];
  const companyName = company?.company_name || company?.legal_name || "Kali tacticals";
  const companyUrlLabel = company?.website || company?.domain?.custom_domain || company?.domain?.host || "";
  const companyUrlHref = companyUrlLabel ? toUrl(companyUrlLabel) : "";

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <section>
          <h3>Shop</h3>
          <Link to="/category/new-arrivals">New Arrivals</Link>
          {categories.slice(0, 4).map((category) => <Link to={`/category/${category.slug}`} key={category.id}>{category.name}</Link>)}
        </section>
        <section>
          <h3>Customer Service</h3>
          <Link to="/category/account">Track Order</Link>
          <Link to="/category/delivery">Delivery Zones</Link>
          <Link to="/category/returns">Returns</Link>
          <Link to="/category/sizing">Sizing Guide</Link>
          <Link to="/category/payment">Payment Options</Link>
        </section>
        <section>
          <h3>About {companyName}</h3>
          <p>{companyName} offers field-ready apparel, gear, and everyday essentials.</p>
        </section>
        <section>
          <h3>Connect</h3>
          {primaryStore?.address ? <p><MapPin size={16} /> {primaryStore.address}</p> : null}
          {primaryStore?.phone ? <p><Phone size={16} /> {primaryStore.phone}</p> : null}
          {company?.support_email ? <p><Mail size={16} /> <a href={`mailto:${company.support_email}`}>{company.support_email}</a></p> : null}
          {!company?.support_email && companyUrlLabel ? <p><BriefcaseBusiness size={16} /> <a href={companyUrlHref} target="_blank" rel="noreferrer">{companyUrlLabel}</a></p> : null}
          {!company?.support_email && !companyUrlLabel ? <p><Mail size={16} /> <a href="mailto:support@kalitactical.ke">support@kalitactical.ke</a></p> : null}
          {primaryStore?.hours ? <p>{formatStoreHours(primaryStore)}</p> : null}
          <div className="socials">
            <Camera />
            <MessageSquare />
            <BriefcaseBusiness />
          </div>
        </section>
      </div>
      <div className="footer-bottom">
        <span>© 2026 {companyName}</span>
        <span>M-Pesa | Airtel Money | Visa | Mastercard | Cash on Delivery | WhatsApp</span>
      </div>
    </footer>
  );
}

function toUrl(value = "") {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
