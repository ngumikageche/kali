function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readSlugFromCanonicalUrl(path = "") {
  const match = String(path).match(/\/([^/]+)$/);
  return match?.[1] || "";
}

function coerceArray(value) {
  return Array.isArray(value) ? value : [];
}

function pickPrimaryImage(product = {}) {
  return (
    product.primary_image_url ||
    coerceArray(product.image_urls)[0] ||
    coerceArray(product.images).map((image) => image?.url).find(Boolean) ||
    ""
  );
}

function normalizeColor(value) {
  if (!value) {
    return [];
  }

  return coerceArray(value).filter(Boolean);
}

function normalizeSpecifications(product) {
  if (Array.isArray(product.specifications)) {
    return product.specifications;
  }

  if (product.specifications && typeof product.specifications === "object") {
    return Object.entries(product.specifications).map(([label, value]) => ({ label, value }));
  }

  return [];
}

export function normalizeProduct(product = {}) {
  const canonicalSlug = readSlugFromCanonicalUrl(product.canonical_url);
  const publicSlug = product.slug || canonicalSlug || "";
  const slug = publicSlug || slugify(product.name);
  const categorySlug = product.category_slug || slugify(product.category_name || product.category);
  const subcategorySlug = product.subcategory_slug || slugify(product.subcategory_name || product.subcategory);
  const gallery = coerceArray(product.image_urls).length
    ? coerceArray(product.image_urls)
    : coerceArray(product.images).map((image) => image?.url).filter(Boolean);
  const primaryImage = pickPrimaryImage(product);
  const stockQuantity = product.stock_quantity != null
    ? Number(product.stock_quantity)
    : product.quantity != null
      ? Number(product.quantity)
      : product.inventory_count != null
        ? Number(product.inventory_count)
        : null;
  const isInStock = typeof product.is_in_stock === "boolean"
    ? product.is_in_stock
    : typeof product.in_stock === "boolean"
      ? product.in_stock
      : Number.isFinite(stockQuantity)
        ? stockQuantity > 0
        : true;

  return {
    ...product,
    id: product.id,
    slug,
    publicSlug,
    routeKey: publicSlug || String(product.id),
    productHref: publicSlug ? `/products/${publicSlug}` : `/product/${product.id}`,
    canonicalUrl: product.canonical_url || (publicSlug ? `/products/${publicSlug}` : product.id != null ? `/product/${product.id}` : ""),
    name: product.name || "Untitled product",
    shortName: product.short_name || product.name || "Untitled product",
    brand: product.brand || "",
    sku: product.sku || product.product_code || product.code || "",
    category: categorySlug,
    categoryName: product.category_name || product.category || "Shop",
    subcategory: subcategorySlug,
    subcategoryName: product.subcategory_name || product.subcategory || "",
    price: Number(product.price || 0),
    oldPrice: product.old_price != null ? Number(product.old_price) : product.original_price != null ? Number(product.original_price) : null,
    originalPrice: product.original_price != null ? Number(product.original_price) : null,
    discountAmount: Number(product.discount_amount || 0),
    discountPercent: Number(product.discount_percent || 0),
    hasDiscount: Boolean(product.has_discount),
    rating: Number(product.rating || 0),
    reviews: Number(product.review_count || product.reviews_count || 0),
    reviewCount: Number(product.review_count || product.reviews_count || 0),
    image: primaryImage,
    gallery: gallery.length ? gallery : primaryImage ? [primaryImage] : [],
    colors: normalizeColor(product.colors),
    sizes: coerceArray(product.sizes).filter(Boolean),
    tags: coerceArray(product.tags).filter(Boolean),
    medicalConditions: coerceArray(product.medical_conditions).filter(Boolean),
    description: product.description || "",
    prices: coerceArray(product.prices),
    keyFeatures: coerceArray(product.key_features).filter(Boolean),
    specifications: normalizeSpecifications(product),
    ingredients: product.ingredients_or_contents || "",
    additionalInformation: product.additional_information || "",
    requiresPrescription: Boolean(product.requires_prescription),
    stockQuantity,
    isInStock,
    isBestSeller: Boolean(product.is_best_seller),
    currency: product.currency || "KES"
  };
}

export function normalizeCategory(category = {}) {
  return {
    ...category,
    id: category.id,
    name: category.name || "Uncategorized",
    slug: category.slug || slugify(category.name),
    description: category.description || "",
    image: category.image_url || coerceArray(category.images)[0]?.url || "",
    brands: coerceArray(category.brands),
    medicalConditions: coerceArray(category.medical_conditions),
    shopBy: coerceArray(category.shop_by),
    productCount: Number(category.product_count || 0),
    images: coerceArray(category.images),
    subcategories: coerceArray(category.subcategories).length ? coerceArray(category.subcategories) : coerceArray(category.sub_categories)
  };
}

export function normalizeCarouselItem(item = {}) {
  const title = item.caption || item.title || item.headline || item.name || "Featured";
  const copy = item.description || item.copy || item.subcaption || item.caption || "";
  const image = item.image_url || item.image || item.desktop_image_url || item.banner_image_url || item.photo_url || "";
  const href = item.link || item.href || item.button_link || (item.category_id ? `/category/${item.category_id}` : "/category/shop");

  return {
    ...item,
    title,
    copy,
    image,
    href,
    actionLabel: item.button_text || item.cta_label || item.action_label || "Explore"
  };
}

export function normalizeStore(store = {}, index = 0) {
  return {
    ...store,
    id: store.id ?? index,
    name: store.name || "Store",
    address: store.address || "",
    hours: store.hours || "",
    phone: store.phone || "",
    imageUrl: store.image_url || "",
    latitude: store.latitude || null,
    longitude: store.longitude || null,
    isActive: store.is_active !== false
  };
}

export function normalizeReview(review = {}) {
  return {
    ...review,
    id: review.id || `${review.title || "review"}-${review.user_id || "anon"}`,
    name: review.name || review.username || "Verified customer",
    title: review.title || "Customer review",
    body: review.body || review.content || "",
    rating: Number(review.rating || 0),
    date: review.posted_at || review.created_at || "",
    helpful: Number(review.helpful || 0),
    verified: review.verified !== false,
    tag: review.tag || "all"
  };
}

export function formatStoreHours(store = {}) {
  return [store.address, store.hours].filter(Boolean).join(" | ");
}

export { slugify };
