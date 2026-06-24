import { BriefcaseBusiness, Camera, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useStorefront } from "../../context/StorefrontContext.jsx";
import { formatStoreHours } from "../../utils/storefront.js";

export default function Footer() {
  const { categories, company, stores } = useStorefront();
  const primaryStore = stores[0];

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <section>
          <h3>Shop</h3>
          {categories.slice(0, 4).map((category) => <Link to={`/category/${category.slug}`} key={category.id}>{category.name}</Link>)}
        </section>
        <section>
          <h3>Customer Service</h3>
          <Link to="/category/delivery">Delivery Zones</Link>
          <Link to="/category/returns">Returns</Link>
          <Link to="/category/sizing">Sizing Guide</Link>
          <Link to="/category/payment">Payment Options</Link>
        </section>
        <section>
          <h3>About {company?.company_name || "the Store"}</h3>
          <p>{company?.company_name || "This storefront"} is served from the live public API tenant configuration.</p>
          <p>Tenant: {company?.tenant_key || "not configured"} | Company EUID: {company?.company_euid || "n/a"}</p>
        </section>
        <section>
          <h3>Connect</h3>
          <p><MapPin size={16} /> {primaryStore?.address || "Store address not published yet"}</p>
          <p><Phone size={16} /> {primaryStore?.phone || "Phone coming soon"}</p>
          <p><Mail size={16} /> {company?.company_name ? `Contact ${company.company_name}` : "support@example.com"}</p>
          <p>{primaryStore ? formatStoreHours(primaryStore) : "Public store hours not configured yet."}</p>
          <div className="socials">
            <Camera />
            <MessageSquare />
            <BriefcaseBusiness />
          </div>
        </section>
      </div>
      <div className="footer-bottom">
        <span>© 2026 {company?.company_name || "Storefront"}</span>
        <span>M-Pesa | Airtel Money | Visa | Mastercard | Cash on Delivery | WhatsApp</span>
      </div>
    </footer>
  );
}
