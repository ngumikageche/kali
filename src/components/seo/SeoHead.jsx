import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { storefrontConfig } from "../../config/storefront.js";

const DEFAULT_TITLE = "Kali Tactical | Tactical Gear, Boots and Outdoor Apparel";
const DEFAULT_DESCRIPTION = "Shop Kali Tactical for tactical gear, boots, utility wear, outdoor apparel, and field-ready accessories in Nairobi and across East Africa.";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80";

export default function SeoHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  jsonLd = []
}) {
  const location = useLocation();

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const origin = storefrontConfig.siteUrl || window.location.origin;
    const canonicalPath = path || location.pathname;
    const canonicalUrl = new URL(canonicalPath, origin).toString();
    const normalizedImage = image ? new URL(image, origin).toString() : DEFAULT_IMAGE;
    const robots = noindex ? "noindex, nofollow" : "index, follow";

    document.title = title;
    document.documentElement.lang = "en";

    setMeta("name", "description", description);
    setMeta("name", "robots", robots);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", normalizedImage);
    setMeta("property", "og:site_name", "Kali Tactical");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", normalizedImage);
    setCanonical(canonicalUrl);
    setStructuredData(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []);
  }, [description, image, jsonLd, location.pathname, noindex, path, title, type]);

  return null;
}

function setMeta(attr, key, content) {
  let element = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function setStructuredData(items) {
  document.head.querySelectorAll('script[data-seo-json-ld="true"]').forEach((node) => node.remove());

  items.filter(Boolean).forEach((item) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoJsonLd = "true";
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  });
}
