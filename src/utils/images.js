export const DEVICE_SIZES = [160, 320, 480, 640, 750, 828, 1080, 1200, 1600];

function safeUrl(source) {
  try {
    return new URL(source);
  } catch {
    return null;
  }
}

export function optimizeImageUrl(source, { width, quality = 76, format } = {}) {
  const url = safeUrl(source);

  if (!url) {
    return source;
  }

  if (url.hostname.includes("images.unsplash.com")) {
    if (width) {
      url.searchParams.set("w", String(width));
    }

    url.searchParams.set("fit", "crop");
    url.searchParams.set("q", String(quality));

    if (format) {
      url.searchParams.set("fm", format);
    } else {
      url.searchParams.set("auto", "format");
    }
  }

  return url.toString();
}

export function buildSrcSet(source, widths, options = {}) {
  return widths
    .map((width) => `${optimizeImageUrl(source, { ...options, width })} ${width}w`)
    .join(", ");
}

export function buildBlurPlaceholder(source) {
  return optimizeImageUrl(source, { width: 24, quality: 28 });
}
