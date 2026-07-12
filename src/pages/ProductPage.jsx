import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../components/product/Breadcrumb.jsx";
import ProductDetails from "../components/product/ProductDetails.jsx";
import ProductGallery from "../components/product/ProductGallery.jsx";
import ProductInfo from "../components/product/ProductInfo.jsx";
import RecommendedByBrand from "../components/product/RecommendedByBrand.jsx";
import ReviewsSection from "../components/reviews/ReviewsSection.jsx";
import SeoHead from "../components/seo/SeoHead.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import StorefrontState from "../components/ui/StorefrontState.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { storefrontApi } from "../lib/storefrontApi.js";
import { normalizeProduct, normalizeReview } from "../utils/storefront.js";

export default function ProductPage() {
  const { id, slug } = useParams();
  const isIdRoute = Boolean(id);
  const lookupKey = isIdRoute ? id : slug;
  const { data, loading, error } = useAsyncData(
    async () => {
      const primaryResponse = isIdRoute
        ? await storefrontApi.products.getById(id)
        : await storefrontApi.products.getBySlug(slug);
      const product = normalizeProduct(primaryResponse.product || primaryResponse);

      const [relatedResult, reviewsResult] = await Promise.allSettled([
        storefrontApi.products.list({
          per_page: 4,
          category_id: product.category_id,
          brand: product.brand || undefined,
          sort: "rating",
          direction: "desc"
        }),
        storefrontApi.products.getReviews(product.id)
      ]);

      return {
        product,
        related: relatedResult.status === "fulfilled"
          ? (relatedResult.value.products || []).map(normalizeProduct).filter((item) => item.id !== product.id).slice(0, 4)
          : [],
        reviews: reviewsResult.status === "fulfilled"
          ? (reviewsResult.value.reviews || reviewsResult.value.items || []).map(normalizeReview)
          : []
      };
    },
    [lookupKey],
    { initialData: { product: null, related: [], reviews: [] }, enabled: Boolean(lookupKey), cacheKey: `product:${lookupKey}` }
  );

  useEffect(() => {
    if (!data.product || typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }

    window.gtag("event", "view_item", {
      currency: data.product.currency || "KES",
      value: Number(data.product.price || 0),
      items: [{
        item_id: String(data.product.id || data.product.sku || lookupKey),
        item_name: data.product.name,
        item_category: data.product.categoryName || data.product.category || "",
        item_brand: data.product.brand || "",
        item_variant: data.product.sku || "",
        price: Number(data.product.price || 0),
        quantity: 1
      }],
      page_path: window.location.pathname + window.location.search,
      content_type: "product"
    });
  }, [data.product, lookupKey]);

  if (loading && !data.product) {
    return <LoadingState variant="product" />;
  }

  if (error || !data.product) {
    return <section className="section container"><StorefrontState title="Product unavailable" body={error?.message || "The product could not be loaded from the public API."} tone="error" /></section>;
  }

  return (
    <>
      <SeoHead
        title={`${data.product.name} | Kali Tactical`}
        description={buildProductDescription(data.product)}
        path={data.product.canonicalUrl || data.product.productHref}
        image={data.product.image}
        type="product"
        jsonLd={buildProductStructuredData(data.product)}
      />
      <div className="container">
        <Breadcrumb product={data.product} />
      </div>
      <div className="container product-page">
        <ProductGallery key={`gallery-${data.product.id}`} product={data.product} />
        <ProductInfo key={`info-${data.product.id}`} product={data.product} />
      </div>
      <ProductDetails product={data.product} />
      <RecommendedByBrand products={data.related} />
      <ReviewsSection product={data.product} reviews={data.reviews} />
    </>
  );
}

function buildProductDescription(product) {
  if (product.description) {
    return String(product.description).replace(/\s+/g, " ").slice(0, 155);
  }

  return `${product.name} from Kali Tactical. Shop tactical gear, boots, utility wear, and field-ready equipment in Nairobi and across East Africa.`;
}

function buildProductStructuredData(product) {
  const availability = product.isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: buildProductDescription(product),
      image: product.gallery?.length ? product.gallery : [product.image].filter(Boolean),
      sku: product.sku || undefined,
      brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
      category: product.categoryName || undefined,
      aggregateRating: product.reviewCount ? {
        "@type": "AggregateRating",
        ratingValue: product.rating || 0,
        reviewCount: product.reviewCount
      } : undefined,
      offers: {
        "@type": "Offer",
        priceCurrency: product.currency || "KES",
        price: product.price,
        availability,
        url: product.canonicalUrl || product.productHref
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "/" },
        { "@type": "ListItem", position: 2, name: product.categoryName || "Shop", item: `/category/${product.category}` },
        { "@type": "ListItem", position: 3, name: product.name, item: product.canonicalUrl || product.productHref }
      ]
    }
  ];
}
