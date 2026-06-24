import { Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Truck, UsersRound } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ui/ProductCard.jsx";
import StorefrontState from "../components/ui/StorefrontState.jsx";
import { storefrontConfig } from "../config/storefront.js";
import { useStorefront } from "../context/StorefrontContext.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { storefrontApi } from "../lib/storefrontApi.js";
import { normalizeProduct } from "../utils/storefront.js";

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { stores } = useStorefront();

  if (slug === "about") return <AboutPage stores={stores} />;
  if (slug === "contact") return <ContactPage stores={stores} />;

  const isUtilityPage = ["shop", "sale", "cart", "delivery", "returns", "sizing", "payment", "account"].includes(slug);
  const search = searchParams.get("q") || "";
  const { data, loading, error } = useAsyncData(
    async () => {
      const category = isUtilityPage ? null : (await storefrontApi.categories.getBySlug(slug)).category;
      const filteredProducts = await storefrontApi.products.list({
        per_page: 24,
        q: search || undefined,
        category_id: category?.id || undefined,
        sort: slug === "sale" ? "discount" : "created",
        direction: "desc"
      });

      const normalized = (filteredProducts.products || []).map(normalizeProduct);

      return {
        category,
        products: slug === "sale" ? normalized.filter((product) => product.hasDiscount) : normalized
      };
    },
    [slug, search],
    { initialData: { category: null, products: [] }, enabled: Boolean(slug) }
  );

  return (
    <section className="section container category-page">
      <div className="section-heading">
        <p className="eyebrow">KALITACTICAL</p>
        <h1>{data.category?.name || title(slug)}</h1>
        <p>{search ? `Results for "${search}"` : data.category?.description || "Live products loaded from the public storefront API."}</p>
      </div>
      {loading && !data.products.length ? <StorefrontState title="Loading category" body="Fetching catalog results from `/public/products`." /> : null}
      {error ? <StorefrontState title="Category unavailable" body={error.message} tone="error" /> : null}
      {!loading && !error && !data.products.length ? <StorefrontState title="No products found" body="This category currently has no active public products." /> : null}
      {data.products.length ? <div className="catalog-grid">{data.products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : null}
    </section>
  );
}

function title(slug = "shop") {
  return slug.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}

function AboutPage({ stores = [] }) {
  const primaryStore = stores[0];
  return (
    <section className="section container info-page">
      <div className="info-hero">
        <div>
          <p className="eyebrow">About KALITACTICAL</p>
          <h1>Built for the Field. Worn in the City.</h1>
          <p>
            KALITACTICAL is a Nairobi-based tactical clothing and gear store serving Kenya and East Africa.
            We build and source premium field-ready pieces with a dark, city-ready edge: ripstop trousers,
            utility jackets, boots, vests, headgear, and everyday carry accessories.
          </p>
        </div>
      </div>

      <div className="info-grid">
        <article>
          <ShieldCheck />
          <h2>Operator-grade utility</h2>
          <p>Durable fabrics, reinforced stress points, YKK hardware, and practical pocket layouts for work, travel, security teams, outdoor crews, and tactical lifestyle wear.</p>
        </article>
        <article>
          <MapPin />
          <h2>Nairobi first</h2>
          <p>{primaryStore?.address || "Store and branch locations are published from `/public/stores` when configured for the tenant."}</p>
        </article>
        <article>
          <Truck />
          <h2>Flexible fulfillment</h2>
          <p>Pay with M-Pesa, Airtel Money, Visa, Mastercard, or Cash on Delivery. Hakuna Matata Returns are available within 7 days on eligible items.</p>
        </article>
        <article>
          <UsersRound />
          <h2>East Africa ready</h2>
          <p>Our catalog is selected for heat, dust, rain, movement, and daily wear, not costume-shop camo. Premium, restrained, functional gear.</p>
        </article>
      </div>

      <div className="info-panel">
        <h2>What we stand for</h2>
        <p>
          KALITACTICAL sits between field performance and Nairobi street authority. The goal is simple:
          sharp silhouettes, practical construction, reliable delivery, and gear that looks as good in the city
          as it performs outdoors.
        </p>
      </div>
    </section>
  );
}

function ContactPage({ stores = [] }) {
  const primaryStore = stores[0];
  return (
    <section className="section container info-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Contact KALITACTICAL</p>
          <h1>Talk to the Nairobi team</h1>
        </div>
        <p>Need sizing help, delivery confirmation, wholesale supply, or a product recommendation? Reach us directly.</p>
      </div>

      <div className="contact-layout">
        <div className="contact-cards">
          <article>
            <Phone />
            <h2>Phone</h2>
            <a href={`tel:${primaryStore?.phone || "+254700000000"}`}>{primaryStore?.phone || "+254 700 000 000"}</a>
          </article>
          <article>
            <MessageCircle />
            <h2>WhatsApp</h2>
            <a href={`https://wa.me/${storefrontConfig.whatsappNumber}`}>+254 7XX XXX XXX - Chat with KALITACTICAL</a>
          </article>
          <article>
            <Mail />
            <h2>Email</h2>
            <a href="mailto:support@kalitactical.ke">support@kalitactical.ke</a>
          </article>
          <article>
            <MapPin />
            <h2>Location</h2>
            <p>{primaryStore?.address || "Public store location not configured yet."}</p>
          </article>
          <article>
            <Clock />
            <h2>Hours</h2>
            <p>{primaryStore?.hours || "Store hours will appear here once added to `/public/stores`."}</p>
          </article>
        </div>

        <form className="contact-form">
          <h2>Send a message</h2>
          <label>Name<input placeholder="Your name" /></label>
          <label>Email or phone<input placeholder="you@example.com / +254..." /></label>
          <label>Topic<select><option>Sizing help</option><option>Delivery question</option><option>Bulk or team order</option><option>Returns</option></select></label>
          <label>Message<textarea rows="5" placeholder="Tell us what you need." /></label>
          <button className="btn btn-primary" type="button">SEND MESSAGE</button>
        </form>
      </div>
    </section>
  );
}
