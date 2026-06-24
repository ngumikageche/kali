import { storefrontConfig } from "../config/storefront.js";

function toQueryString(query = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value == null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null && item !== "") {
          params.append(key, item);
        }
      });
      return;
    }

    params.set(key, String(value));
  });

  const rendered = params.toString();
  return rendered ? `?${rendered}` : "";
}

async function request(path, { method = "GET", query, body, headers = {}, auth = "public", raw = false } = {}) {
  const url = `${storefrontConfig.baseUrl}${path}${toQueryString(query)}`;
  const requestHeaders = {
    Accept: "application/json",
    ...headers
  };

  if (storefrontConfig.apiKey && auth !== "admin") {
    requestHeaders["X-API-Key"] = storefrontConfig.apiKey;
  }

  if (storefrontConfig.tenant) {
    requestHeaders["X-Tenant"] = storefrontConfig.tenant;
  }

  if (auth === "admin" && storefrontConfig.adminToken) {
    requestHeaders.Authorization = `Bearer ${storefrontConfig.adminToken}`;
  }

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (raw) {
    return response;
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "object" && payload?.message ? payload.message : `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const storefrontApi = {
  products: {
    list: (query) => request("/public/products", { query }),
    getById: (productId) => request(`/public/products/${productId}`),
    getBySlug: (slug) => request(`/public/products/by-slug/${slug}`),
    getReviews: (productId, query) => request(`/public/products/${productId}/reviews`, { query })
  },
  categories: {
    list: () => request("/public/categories"),
    getBySlug: (slug) => request(`/public/categories/by-slug/${slug}`),
    getImages: (categoryId) => request(`/public/categories/${categoryId}/images`)
  },
  prices: {
    list: (query) => request("/public/prices", { query })
  },
  priceCategories: {
    list: () => request("/public/price-categories")
  },
  images: {
    list: (query) => request("/public/images", { query })
  },
  carousel: {
    list: () => request("/public/carousel")
  },
  stores: {
    list: () => request("/public/stores")
  },
  company: {
    get: () => request("/public/company")
  },
  blogs: {
    list: (query) => request("/public/blogs", { query }),
    getById: (blogId) => request(`/public/blogs/${blogId}`),
    getBySlug: (slug) => request(`/public/blogs/by-slug/${slug}`),
    getComments: (blogId, query) => request(`/public/blogs/${blogId}/comments`, { query }),
    getFeedUrl: () => `${storefrontConfig.baseUrl}/public/blogs/feed.rss`
  },
  partners: {
    list: (query) => request("/public/partners", { query }),
    getById: (partnerId) => request(`/public/partners/${partnerId}`)
  },
  portfolios: {
    list: (query) => request("/public/portfolios", { query }),
    getById: (portfolioId) => request(`/public/portfolios/${portfolioId}`),
    getBySlug: (slug) => request(`/public/portfolios/by-slug/${slug}`)
  },
  promotions: {
    list: () => request("/public/promotions"),
    validate: (body) => request("/public/promotions/validate", { method: "POST", body })
  },
  discounts: {
    calculate: (body) => request("/public/discounts/calculate", { method: "POST", body })
  },
  orders: {
    checkout: (body) => request("/public/orders/checkout", { method: "POST", body }),
    list: (query) => request("/public/orders", { query, auth: "admin" })
  },
  keys: {
    list: () => request("/public/keys", { auth: "admin" }),
    create: (body) => request("/public/keys", { method: "POST", body, auth: "admin" }),
    update: (keyId, body) => request(`/public/keys/${keyId}`, { method: "PATCH", body, auth: "admin" }),
    remove: (keyId) => request(`/public/keys/${keyId}`, { method: "DELETE", auth: "admin" })
  },
  sitemap: {
    getUrl: () => `${storefrontConfig.baseUrl}/public/sitemap.xml`
  }
};
