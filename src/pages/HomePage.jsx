import AnnouncementStrip from "../components/home/AnnouncementStrip.jsx";
import CategoryGrid from "../components/home/CategoryGrid.jsx";
import FeaturedCollection from "../components/home/FeaturedCollection.jsx";
import HeroBanner from "../components/home/HeroBanner.jsx";
import LocalAds from "../components/home/LocalAds.jsx";
import Newsletter from "../components/home/Newsletter.jsx";
import PaymentOptions from "../components/home/PaymentOptions.jsx";
import PromoBanner from "../components/home/PromoBanner.jsx";
import RecommendedProducts from "../components/home/RecommendedProducts.jsx";
import SeoHead from "../components/seo/SeoHead.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import StorefrontState from "../components/ui/StorefrontState.jsx";
import { useStorefront } from "../context/StorefrontContext.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { storefrontApi } from "../lib/storefrontApi.js";
import { normalizeCarouselItem, normalizeProduct } from "../utils/storefront.js";

export default function HomePage() {
  const { company, categories, stores } = useStorefront();
  const { data, loading, error } = useAsyncData(
    async () => {
      const [productsResult, carouselResult, promotionsResult] = await Promise.allSettled([
        storefrontApi.products.list({ per_page: 12, sort: "rating", direction: "desc" }),
        storefrontApi.carousel.list(),
        storefrontApi.promotions.list()
      ]);

      return {
        products: productsResult.status === "fulfilled" ? (productsResult.value.products || []).map(normalizeProduct) : [],
        carousel: carouselResult.status === "fulfilled" ? (carouselResult.value.carousel || carouselResult.value.items || carouselResult.value || []).map(normalizeCarouselItem) : [],
        promotions: promotionsResult.status === "fulfilled" ? promotionsResult.value.promotions || promotionsResult.value || [] : []
      };
    },
    [],
    { initialData: { products: [], carousel: [], promotions: [] }, cacheKey: "home" }
  );

  const featuredProducts = [...data.products]
    .sort((left, right) => Number(right.isBestSeller) - Number(left.isBestSeller) || right.rating - left.rating || right.discountPercent - left.discountPercent)
    .slice(0, 4);
  const recommendedProducts = data.products.filter((product) => !featuredProducts.some((featured) => featured.id === product.id)).slice(0, 6);
  const seoProducts = [...featuredProducts, ...recommendedProducts].slice(0, 10);
  const homeStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: company?.company_name || "Kali Tactical",
      url: "/",
      email: company?.support_email || undefined
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: company?.company_name || "Kali Tactical",
      url: "/"
    },
    seoProducts.length ? {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Featured tactical gear",
      itemListElement: seoProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: product.canonicalUrl || product.productHref,
        name: product.name
      }))
    } : null
  ].filter(Boolean);

  return (
    <>
      <SeoHead
        title={`${company?.company_name || "Kali Tactical"} | Tactical Gear, Boots and Outdoor Apparel`}
        description="Shop Kali Tactical for tactical gear, boots, utility wear, outdoor apparel, and field-ready accessories in Nairobi and across East Africa."
        path="/"
        image={data.carousel[0]?.image || featuredProducts[0]?.image}
        jsonLd={homeStructuredData}
      />
      <HeroBanner slides={data.carousel} companyName={company?.company_name || "Storefront"} />
      <AnnouncementStrip />
      <CategoryGrid categories={categories.slice(0, 6)} />
      <PromoBanner promotion={data.promotions[0]} />
      {error ? <section className="container"><StorefrontState title="Storefront API unavailable" body={error.message} tone="error" /></section> : null}
      {loading && !data.products.length ? <section className="container"><LoadingState title="Loading products..." /></section> : null}
      {!loading && !data.products.length ? <section className="container"><StorefrontState title="No public products" body="The tenant returned an empty product list. Add active products or verify the public API settings." /></section> : null}
      {featuredProducts.length ? <FeaturedCollection products={featuredProducts} companyName={company?.company_name || "the storefront"} /> : null}
      <LocalAds stores={stores} />
      {recommendedProducts.length ? <RecommendedProducts products={recommendedProducts} /> : null}
      <PaymentOptions />
      <Newsletter />
    </>
  );
}
