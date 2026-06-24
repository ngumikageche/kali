import { useParams } from "react-router-dom";
import Breadcrumb from "../components/product/Breadcrumb.jsx";
import ProductDetails from "../components/product/ProductDetails.jsx";
import ProductGallery from "../components/product/ProductGallery.jsx";
import ProductInfo from "../components/product/ProductInfo.jsx";
import RecommendedByBrand from "../components/product/RecommendedByBrand.jsx";
import ReviewsSection from "../components/reviews/ReviewsSection.jsx";
import StorefrontState from "../components/ui/StorefrontState.jsx";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { storefrontApi } from "../lib/storefrontApi.js";
import { normalizeProduct, normalizeReview } from "../utils/storefront.js";

export default function ProductPage() {
  const { id, slug } = useParams();
  const lookupKey = slug || id;
  const { data, loading, error } = useAsyncData(
    async () => {
      const primaryResponse = slug
        ? await storefrontApi.products.getBySlug(slug)
        : /^[0-9]+$/.test(String(id))
          ? await storefrontApi.products.getById(id)
          : await storefrontApi.products.getBySlug(id);
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
    { initialData: { product: null, related: [], reviews: [] }, enabled: Boolean(lookupKey) }
  );

  if (loading && !data.product) {
    return <section className="section container"><StorefrontState title="Loading product" body="Fetching product detail from the public API." /></section>;
  }

  if (error || !data.product) {
    return <section className="section container"><StorefrontState title="Product unavailable" body={error?.message || "The product could not be loaded from the public API."} tone="error" /></section>;
  }

  return (
    <>
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
