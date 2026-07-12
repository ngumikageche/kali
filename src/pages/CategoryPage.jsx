import { CheckCheck, Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Truck, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import LoadingState from "../components/ui/LoadingState.jsx";
import SeoHead from "../components/seo/SeoHead.jsx";
import ProductCard from "../components/ui/ProductCard.jsx";
import StorefrontState from "../components/ui/StorefrontState.jsx";
import { storefrontConfig } from "../config/storefront.js";
import { useCart } from "../context/CartContext.jsx";
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
  if (slug === "account") return <AccountPage />;

  const isUtilityPage = ["shop", "sale", "new-arrivals", "cart", "delivery", "returns", "sizing", "payment", "account"].includes(slug);
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
    { initialData: { category: null, products: [] }, enabled: Boolean(slug), cacheKey: `category:${slug}:q=${search}` }
  );
  const pageTitle = buildCategoryTitle(slug, data.category?.name);
  const pageDescription = buildCategoryDescription(slug, data.category?.description);

  useEffect(() => {
    if (!data.products.length || typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }

    const pagePath = `${window.location.pathname}${window.location.search}`;
    const items = data.products.slice(0, 10).map((product) => ({
      item_id: String(product.id),
      item_name: product.name,
      item_category: product.categoryName || product.category || "",
      item_brand: product.brand || "",
      price: Number(product.price || 0),
      quantity: 1,
      affiliation: "Kali Tactical"
    }));

    window.gtag("event", "view_item_list", {
      item_list_id: `category:${slug}`,
      item_list_name: pageTitle,
      items,
      search_term: search || undefined,
      page_path: pagePath,
      content_type: "category"
    });
  }, [data.products, pageTitle, search, slug]);

  const categoryStructuredData = data.products.length ? [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageTitle,
      description: pageDescription,
      url: `/category/${slug}`
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: pageTitle,
      itemListElement: data.products.slice(0, 24).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: product.canonicalUrl || product.productHref,
        name: product.name
      }))
    }
  ] : [];

  return (
    <section className="section container category-page">
      <SeoHead title={`${pageTitle} | Kali Tactical`} description={pageDescription} path={`/category/${slug}`} jsonLd={categoryStructuredData} />
      <div className="section-heading">
        <p className="eyebrow">KALITACTICAL</p>
        <h1>{data.category?.name || title(slug)}</h1>
        <p>{search ? `Results for "${search}"` : data.category?.description || "Browse the latest arrivals, essentials, and tactical favorites."}</p>
      </div>
      {loading && !data.products.length ? <LoadingState title="Loading products..." /> : null}
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
      <SeoHead
        title="About Kali Tactical | Tactical Gear in Nairobi"
        description="Learn about Kali Tactical, a Nairobi-based tactical gear and apparel store serving Kenya and East Africa."
        path="/category/about"
      />
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
      <SeoHead
        title="Contact Kali Tactical | Nairobi Tactical Store"
        description="Contact Kali Tactical for sizing help, delivery questions, wholesale inquiries, and product recommendations."
        path="/category/contact"
      />
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

function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { customerProfile, saveCustomerProfile, trackedOrders = [] } = useCart();
  const [orderReference, setOrderReference] = useState(searchParams.get("order") || "");
  const [contact, setContact] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [profileState, setProfileState] = useState(() => ({
    name: customerProfile?.name || "",
    email: customerProfile?.email || "",
    phone: customerProfile?.phone || "",
    address: customerProfile?.address || "",
    city: customerProfile?.city || ""
  }));
  const [profileSaved, setProfileSaved] = useState(false);
  const selectedReference = searchParams.get("order") || orderReference;
  const activeOrder = useMemo(
    () => findOrder(trackedOrders, selectedReference, contact),
    [contact, selectedReference, trackedOrders]
  );
  const progressStages = activeOrder ? getOrderProgress(activeOrder) : [];

  function handleProfileSubmit(event) {
    event.preventDefault();
    saveCustomerProfile(profileState);
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 2200);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const matchedOrder = findOrder(trackedOrders, orderReference, contact);

    if (!matchedOrder) {
      setLookupError("We could not find an order matching those details yet.");
      return;
    }

    setLookupError("");
    setSearchParams({ order: matchedOrder.reference });
  }

  return (
    <section className="section container info-page order-tracker-page">
      <SeoHead
        title="Your Profile and Order Tracking | Kali Tactical"
        description="Manage your saved profile and track recent Kali Tactical orders."
        path="/category/account"
        noindex
      />
      <div className="section-heading">
        <div>
          <p className="eyebrow">Order Tracking</p>
          <h1>Track your order</h1>
        </div>
        <p>Enter your order number and the phone or email used at checkout to see the current progress.</p>
      </div>

      <div className="order-tracker-layout">
        <div className="account-sidebar">
          <form className="contact-form order-tracker-form" onSubmit={handleProfileSubmit}>
            <h2>Your profile</h2>
            <label>Name<input value={profileState.name} onChange={(event) => setProfileState((current) => ({ ...current, name: event.target.value }))} placeholder="Your full name" /></label>
            <label>Email<input value={profileState.email} onChange={(event) => setProfileState((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" /></label>
            <label>Phone<input value={profileState.phone} onChange={(event) => setProfileState((current) => ({ ...current, phone: event.target.value }))} placeholder="+254..." /></label>
            <label>Address<input value={profileState.address} onChange={(event) => setProfileState((current) => ({ ...current, address: event.target.value }))} placeholder="Street address" /></label>
            <label>City<input value={profileState.city} onChange={(event) => setProfileState((current) => ({ ...current, city: event.target.value }))} placeholder="Nairobi" /></label>
            <button className="btn btn-primary" type="submit">SAVE PROFILE</button>
            {profileSaved ? <StorefrontState title="Profile saved" body="Your checkout and tracking details are updated." /> : null}
          </form>

          <form className="contact-form order-tracker-form" onSubmit={handleSubmit}>
            <h2>Find your order</h2>
            <label>Order number<input value={orderReference} onChange={(event) => setOrderReference(event.target.value)} placeholder="KT-ABC123" required /></label>
            <label>Email or phone<input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="you@example.com / +254..." /></label>
            <button className="btn btn-primary" type="submit">TRACK ORDER</button>
            {lookupError ? <StorefrontState title="Order not found" body={lookupError} tone="error" /> : null}
            {!trackedOrders.length ? <StorefrontState title="No recent orders yet" body="Place an order from the cart and it will appear here with its progress timeline." /> : null}
          </form>
        </div>

        <div className="order-tracker-panel">
          <section className="tracked-order-card account-profile-card">
            <div className="tracked-order-header">
              <div>
                <p className="eyebrow">Account</p>
                <h2>{profileState.name || "Customer profile"}</h2>
              </div>
              <div className="tracked-order-total">
                <span>Saved orders</span>
                <strong>{trackedOrders.length}</strong>
              </div>
            </div>
            <div className="profile-facts">
              <article><span>Email</span><strong>{profileState.email || "Not set"}</strong></article>
              <article><span>Phone</span><strong>{profileState.phone || "Not set"}</strong></article>
              <article><span>Address</span><strong>{profileState.address || "Not set"}</strong></article>
              <article><span>City</span><strong>{profileState.city || "Not set"}</strong></article>
            </div>
          </section>

          {trackedOrders.length ? (
            <section className="recent-orders">
              <h2>Recent orders</h2>
              <div className="recent-order-list">
                {trackedOrders.slice(0, 4).map((order) => (
                  <button
                    className={`recent-order-card ${activeOrder?.reference === order.reference ? "active" : ""}`}
                    key={order.reference}
                    type="button"
                    onClick={() => {
                      setOrderReference(order.reference);
                      setContact(order.customer?.contact || "");
                      setLookupError("");
                      setSearchParams({ order: order.reference });
                    }}
                  >
                    <strong>{order.reference}</strong>
                    <span>{order.customer?.name || "Customer"}</span>
                    <span>{formatProgressLabel(order.status)}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {activeOrder ? (
            <section className="tracked-order-card">
              <div className="tracked-order-header">
                <div>
                  <p className="eyebrow">Order {activeOrder.reference}</p>
                  <h2>{formatProgressLabel(activeOrder.status)}</h2>
                </div>
                <div className="tracked-order-total">
                  <span>Total</span>
                  <strong>KSh {activeOrder.total.toLocaleString("en-KE")}</strong>
                </div>
              </div>
              <p className="tracked-order-meta">
                Placed {formatOrderDate(activeOrder.createdAt)}. Estimated delivery: {activeOrder.estimatedDelivery}.
              </p>
              <div className="order-progress">
                {progressStages.map((stage, index) => (
                  <article className={`order-progress-step ${stage.state}`} key={stage.label}>
                    <div className="order-progress-marker">
                      {stage.state === "complete" ? <CheckCheck size={16} /> : stage.state === "current" ? <Truck size={16} /> : <Clock size={16} />}
                    </div>
                    <div>
                      <strong>{stage.label}</strong>
                      <p>{stage.copy}</p>
                    </div>
                    {index < progressStages.length - 1 ? <span className="order-progress-line" /> : null}
                  </article>
                ))}
              </div>
              <div className="tracked-order-items">
                <h3>Items in this order</h3>
                {activeOrder.items.map((item) => (
                  <article className="tracked-order-item" key={item.key}>
                    <div>
                      <strong>{item.product.shortName || item.product.name}</strong>
                      <span>{item.options.size || "Standard"} / {item.options.color || "Default"} / Qty {item.quantity}</span>
                    </div>
                    <b>KSh {(item.product.price * item.quantity).toLocaleString("en-KE")}</b>
                  </article>
                ))}
              </div>
            </section>
          ) : trackedOrders.length ? <StorefrontState title="Select an order" body="Choose a recent order or search by order number above." /> : null}
        </div>
      </div>
    </section>
  );
}

function findOrder(orders = [], reference = "", contact = "") {
  const normalizedReference = reference.trim().toLowerCase();
  const normalizedContact = contact.trim().toLowerCase();

  return orders.find((order) => {
    const referenceMatches = normalizedReference ? order.reference?.toLowerCase() === normalizedReference : true;
    const contactMatches = normalizedContact ? String(order.customer?.contact || "").toLowerCase() === normalizedContact : true;
    return referenceMatches && contactMatches;
  }) || null;
}

function getOrderProgress(order) {
  const stageIndex = Number(order.statusIndex || 0);
  const stages = [
    ["Order placed", "We received your order details successfully."],
    ["Confirmed", "Your checkout details and delivery information are confirmed."],
    ["Packed", "Your kit is being packed and prepared for dispatch."],
    ["Out for delivery", "Your order is on the move and heading to you."],
    ["Delivered", "The order has been delivered successfully."]
  ];

  return stages.map(([label, copy], index) => ({
    label,
    copy,
    state: index < stageIndex ? "complete" : index === stageIndex ? "current" : "upcoming"
  }));
}

function formatProgressLabel(status = "") {
  return String(status || "processing")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatOrderDate(value) {
  try {
    return new Date(value).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return value;
  }
}

function buildCategoryTitle(slug, categoryName) {
  if (categoryName) {
    return categoryName;
  }

  if (slug === "shop") {
    return "All Tactical Gear";
  }

  if (slug === "sale") {
    return "Tactical Gear Sale";
  }

  if (slug === "new-arrivals") {
    return "New Arrivals";
  }

  return title(slug);
}

function buildCategoryDescription(slug, description) {
  if (description) {
    return description;
  }

  if (slug === "new-arrivals") {
    return "Browse the latest tactical gear, boots, utility wear, and fresh product drops from Kali Tactical.";
  }

  if (slug === "sale") {
    return "Shop discounted tactical gear, boots, accessories, and utility wear from Kali Tactical.";
  }

  return "Browse the latest tactical gear, boots, utility wear, and field-ready accessories from Kali Tactical.";
}
