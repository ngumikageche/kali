import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const serverDir = path.join(distDir, "server");
const env = await loadEnvFile(path.join(rootDir, ".env"));
const apiBaseUrl = (process.env.VITE_PUBLIC_API_BASE_URL || env.VITE_PUBLIC_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");
const apiKey = process.env.VITE_PUBLIC_API_KEY || env.VITE_PUBLIC_API_KEY || "";
const tenant = process.env.VITE_PUBLIC_TENANT || env.VITE_PUBLIC_TENANT || "";
const siteUrl = (process.env.VITE_PUBLIC_SITE_URL || env.VITE_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

async function main() {
  const template = await readFile(path.join(distDir, "index.html"), "utf8");
  const serverEntryPath = await resolveServerEntry();
  const { render } = await import(pathToFileURL(serverEntryPath).href);
  const storefront = await fetchStorefrontData();
  const homeData = await fetchHomeData();
  const allProducts = await fetchAllProducts();

  const routes = buildRoutes(storefront, homeData, allProducts);

  for (const route of routes) {
    const appHtml = render(route.path, route.preloadedData);
    const html = applySeo(
      injectApp(template, appHtml, route.preloadedData),
      route.meta
    );
    await writeRouteHtml(route.path, html);
  }

  await writeFile(path.join(distDir, "sitemap.xml"), buildSitemap(routes.filter((route) => route.meta.robots !== "noindex, nofollow")));
  await writeFile(path.join(distDir, "robots.txt"), buildRobots());
  await rm(serverDir, { recursive: true, force: true });
}

async function loadEnvFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    return Object.fromEntries(
      content
        .split(/\r?\n/)
        .filter(Boolean)
        .filter((line) => !line.trim().startsWith("#"))
        .map((line) => {
          const index = line.indexOf("=");
          return [line.slice(0, index), line.slice(index + 1)];
        })
    );
  } catch {
    return {};
  }
}

async function resolveServerEntry() {
  const candidates = ["entry-server.js", "entry-server.mjs", "entry-server.cjs"];
  for (const candidate of candidates) {
    const fullPath = path.join(serverDir, candidate);
    try {
      await stat(fullPath);
      return fullPath;
    } catch {
      // Continue
    }
  }
  throw new Error("Could not locate the SSR server entry output.");
}

async function apiRequest(pathname, query = {}) {
  const url = new URL(`${apiBaseUrl}${pathname}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value == null || value === "") {
      return;
    }
    url.searchParams.set(key, String(value));
  });

  const headers = { Accept: "application/json" };
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  if (tenant) {
    headers["X-Tenant"] = tenant;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status} for ${pathname}`);
  }

  return response.json();
}

async function fetchStorefrontData() {
  const [company, categories, stores] = await Promise.allSettled([
    apiRequest("/public/company"),
    apiRequest("/public/categories"),
    apiRequest("/public/stores")
  ]);

  return {
    company: company.status === "fulfilled" ? company.value.company || company.value : null,
    categories: categories.status === "fulfilled" ? (categories.value.categories || categories.value || []).map(normalizeCategory) : [],
    stores: stores.status === "fulfilled" ? (stores.value.stores || stores.value || []).map(normalizeStore) : []
  };
}

async function fetchHomeData() {
  const [products, carousel, promotions] = await Promise.allSettled([
    apiRequest("/public/products", { per_page: 12, sort: "rating", direction: "desc" }),
    apiRequest("/public/carousel"),
    apiRequest("/public/promotions")
  ]);

  return {
    products: products.status === "fulfilled" ? (products.value.products || []).map(normalizeProduct) : [],
    carousel: carousel.status === "fulfilled" ? (carousel.value.carousel || carousel.value.items || carousel.value || []).map(normalizeCarouselItem) : [],
    promotions: promotions.status === "fulfilled" ? promotions.value.promotions || promotions.value || [] : []
  };
}

async function fetchAllProducts() {
  const products = [];
  const perPage = 100;

  for (let page = 1; page <= 20; page += 1) {
    try {
      const result = await apiRequest("/public/products", { per_page: perPage, page, sort: "created", direction: "desc" });
      const batch = (result.products || []).map(normalizeProduct);
      products.push(...batch);

      if (batch.length < perPage || page >= Number(result.total_pages || 0)) {
        break;
      }
    } catch {
      break;
    }
  }

  return products;
}

function buildRoutes(storefront, homeData, allProducts) {
  const staticCategoryRoutes = [
    { slug: "shop", name: "All Tactical Gear", description: "Browse the latest tactical gear, boots, utility wear, and field-ready accessories from Kali Tactical." },
    { slug: "sale", name: "Tactical Gear Sale", description: "Shop discounted tactical gear, boots, accessories, and utility wear from Kali Tactical." },
    { slug: "new-arrivals", name: "New Arrivals", description: "Browse the latest tactical gear, boots, utility wear, and fresh product drops from Kali Tactical." }
  ];
  const categoryRoutes = (storefront.categories || [])
    .filter((category) => category?.slug)
    .map((category) => ({
      path: `/category/${category.slug}`,
      meta: {
        title: `${category.name} | Kali Tactical`,
        description: category.description || "Browse tactical gear and field-ready equipment from Kali Tactical.",
        canonical: absolute(`/category/${category.slug}`),
        robots: "index, follow"
      },
      preloadedData: {
        storefront: storefrontPayload(storefront),
        [`category:${category.slug}:q=`]: {
          category,
          products: allProducts.filter((product) => String(product.category_id || "") === String(category.id || ""))
        }
      }
    }));

  const staticRoutes = [
    {
      path: "/",
      meta: {
        title: `${storefront.company?.company_name || "Kali Tactical"} | Tactical Gear, Boots and Outdoor Apparel`,
        description: "Shop Kali Tactical for tactical gear, boots, utility wear, outdoor apparel, and field-ready accessories in Nairobi and across East Africa.",
        canonical: absolute("/"),
        robots: "index, follow"
      },
      preloadedData: {
        storefront: storefrontPayload(storefront),
        home: homeData
      }
    },
    ...staticCategoryRoutes.map((item) => ({
      path: `/category/${item.slug}`,
      meta: {
        title: `${item.name} | Kali Tactical`,
        description: item.description,
        canonical: absolute(`/category/${item.slug}`),
        robots: "index, follow"
      },
      preloadedData: {
        storefront: storefrontPayload(storefront),
        [`category:${item.slug}:q=`]: {
          category: null,
          products: item.slug === "sale"
            ? allProducts.filter((product) => Boolean(product.hasDiscount))
            : allProducts
        }
      }
    })),
    {
      path: "/category/about",
      meta: {
        title: "About Kali Tactical | Tactical Gear in Nairobi",
        description: "Learn about Kali Tactical, a Nairobi-based tactical gear and apparel store serving Kenya and East Africa.",
        canonical: absolute("/category/about"),
        robots: "index, follow"
      },
      preloadedData: { storefront: storefrontPayload(storefront) }
    },
    {
      path: "/category/contact",
      meta: {
        title: "Contact Kali Tactical | Nairobi Tactical Store",
        description: "Contact Kali Tactical for sizing help, delivery questions, wholesale inquiries, and product recommendations.",
        canonical: absolute("/category/contact"),
        robots: "index, follow"
      },
      preloadedData: { storefront: storefrontPayload(storefront) }
    }
  ];

  const productRoutes = allProducts
    .filter((product) => product?.id)
    .map((product) => {
      const pathName = product.canonicalUrl || (product.publicSlug ? `/products/${product.publicSlug}` : `/product/${product.id}/${slugify(product.name || "product")}`);
      const normalizedPath = normalizePath(pathName);

      return {
        path: normalizedPath,
        meta: {
          title: `${product.name || "Product"} | Kali Tactical`,
          description: (product.description || `${product.name || "Product"} from Kali Tactical.`).replace(/\s+/g, " ").slice(0, 155),
          canonical: absolute(normalizedPath),
          robots: "index, follow"
        },
        preloadedData: {
          storefront: storefrontPayload(storefront),
          [`product:${product.publicSlug || product.id}`]: {
            product,
            related: [],
            reviews: []
          }
        }
      };
    });

  return dedupeRoutes([...staticRoutes, ...categoryRoutes, ...productRoutes]);
}

function storefrontPayload(storefront) {
  return {
    company: storefront.company || null,
    categories: storefront.categories || [],
    stores: storefront.stores || []
  };
}

function dedupeRoutes(routes) {
  const seen = new Set();
  return routes.filter((route) => {
    if (seen.has(route.path)) {
      return false;
    }
    seen.add(route.path);
    return true;
  });
}

function injectApp(template, appHtml, preloadedData) {
  return template
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    .replace(
      '</body>',
      `<script>window.__PRELOADED_DATA__=${serialize(preloadedData)}</script></body>`
    );
}

function applySeo(template, meta) {
  let html = template.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  html = upsertMeta(html, "name", "description", meta.description);
  html = upsertMeta(html, "name", "robots", meta.robots || "index, follow");
  html = upsertMeta(html, "property", "og:title", meta.title);
  html = upsertMeta(html, "property", "og:description", meta.description);
  html = upsertMeta(html, "property", "og:url", meta.canonical);
  html = upsertCanonical(html, meta.canonical);
  return html;
}

function upsertMeta(html, attr, key, content) {
  const pattern = new RegExp(`<meta\\s+${attr}="${escapeRegex(key)}"\\s+content="[^"]*"\\s*\\/?>`, "i");
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n  </head>`);
}

function upsertCanonical(html, href) {
  const pattern = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}\n  </head>`);
}

async function writeRouteHtml(routePath, html) {
  const cleaned = normalizePath(routePath);
  const filePath = cleaned === "/" ? path.join(distDir, "index.html") : path.join(distDir, cleaned.replace(/^\//, ""), "index.html");
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, html);
}

function buildSitemap(routes) {
  const entries = routes
    .map((route) => `  <url><loc>${escapeXml(route.meta.canonical)}</loc></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function buildRobots() {
  return `User-agent: *\nAllow: /\nDisallow: /cart\nDisallow: /category/account\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

function absolute(pathname) {
  return new URL(normalizePath(pathname), `${siteUrl}/`).toString();
}

function normalizePath(pathname = "/") {
  if (!pathname) {
    return "/";
  }
  if (/^https?:\/\//i.test(pathname)) {
    try {
      return new URL(pathname).pathname || "/";
    } catch {
      return "/";
    }
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function coerceArray(value) {
  return Array.isArray(value) ? value : [];
}

function readSlugFromCanonicalUrl(pathname = "") {
  const match = String(pathname).match(/\/([^/]+)$/);
  return match?.[1] || "";
}

function pickPrimaryImage(product = {}) {
  return (
    product.primary_image_url ||
    coerceArray(product.image_urls)[0] ||
    coerceArray(product.images).map((item) => item?.url).find(Boolean) ||
    ""
  );
}

function normalizeColor(value) {
  if (!value) {
    return [];
  }

  return coerceArray(value).filter(Boolean);
}

function normalizeSpecifications(product = {}) {
  if (Array.isArray(product.specifications)) {
    return product.specifications;
  }

  if (product.specifications && typeof product.specifications === "object") {
    return Object.entries(product.specifications).map(([label, value]) => ({ label, value }));
  }

  return [];
}

function normalizeProduct(product = {}) {
  const canonicalSlug = readSlugFromCanonicalUrl(product.canonical_url);
  const publicSlug = product.slug || canonicalSlug || "";
  const slug = publicSlug || slugify(product.name);
  const categorySlug = product.category_slug || slugify(product.category_name || product.category);
  const subcategorySlug = product.subcategory_slug || slugify(product.subcategory_name || product.subcategory);
  const gallery = coerceArray(product.image_urls).length
    ? coerceArray(product.image_urls)
    : coerceArray(product.images).map((item) => item?.url).filter(Boolean);
  const image = pickPrimaryImage(product);
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
    name: product.name || "Untitled product",
    shortName: product.short_name || product.name || "Untitled product",
    publicSlug,
    slug,
    routeKey: publicSlug || String(product.id),
    productHref: publicSlug ? `/products/${publicSlug}` : `/product/${product.id}/${slug}`,
    canonicalUrl: product.canonical_url || (publicSlug ? `/products/${publicSlug}` : `/product/${product.id}/${slug}`),
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
    rating: Number(product.rating || 0),
    reviews: Number(product.review_count || product.reviews_count || 0),
    reviewCount: Number(product.review_count || product.reviews_count || 0),
    hasDiscount: Boolean(product.has_discount),
    discountPercent: Number(product.discount_percent || 0),
    isBestSeller: Boolean(product.is_best_seller),
    description: product.description || "",
    image,
    gallery: gallery.length ? gallery : image ? [image] : [],
    colors: normalizeColor(product.colors),
    sizes: coerceArray(product.sizes).filter(Boolean),
    tags: coerceArray(product.tags).filter(Boolean),
    medicalConditions: coerceArray(product.medical_conditions).filter(Boolean),
    prices: coerceArray(product.prices),
    keyFeatures: coerceArray(product.key_features).filter(Boolean),
    specifications: normalizeSpecifications(product),
    ingredients: product.ingredients_or_contents || "",
    additionalInformation: product.additional_information || "",
    requiresPrescription: Boolean(product.requires_prescription),
    stockQuantity,
    currency: product.currency || "KES",
    isInStock
  };
}

function normalizeCategory(category = {}) {
  return {
    ...category,
    id: category.id,
    name: category.name || "Category",
    slug: category.slug || slugify(category.name),
    description: category.description || ""
  };
}

function normalizeStore(store = {}, index = 0) {
  return {
    ...store,
    id: store.id ?? index,
    address: store.address || "",
    hours: store.hours || "",
    phone: store.phone || ""
  };
}

function normalizeCarouselItem(item = {}) {
  return {
    ...item,
    title: item.caption || item.title || item.headline || item.name || "Featured",
    copy: item.description || item.copy || item.subcaption || item.caption || "",
    image: item.image_url || item.image || item.desktop_image_url || item.banner_image_url || item.photo_url || "",
    href: item.link || item.href || item.button_link || "/category/shop",
    actionLabel: item.button_text || item.cta_label || item.action_label || "Explore"
  };
}

function serialize(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeXml(value = "") {
  return escapeHtml(value);
}

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
