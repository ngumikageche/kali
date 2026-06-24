import { useState } from "react";
import { buildBlurPlaceholder, buildSrcSet, DEVICE_SIZES, optimizeImageUrl } from "../../utils/images.js";

export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  sizes = "100vw",
  widths = DEVICE_SIZES,
  className = "",
  imgClassName = "",
  loading = "lazy",
  priority = false,
  placeholder = "blur",
  fit = "cover",
  fill = false
}) {
  const [loaded, setLoaded] = useState(false);
  if (!src) {
    return <span className={`responsive-image${fill ? " responsive-image-fill" : ""}${className ? ` ${className}` : ""}`} aria-label={alt || "Image unavailable"} />;
  }
  const resolvedLoading = priority ? "eager" : loading;
  const resolvedWidths = widths.filter((item) => !width || item <= Math.max(width * 2, 320));
  const outputWidths = resolvedWidths.length ? resolvedWidths : widths;
  const blurSrc = placeholder === "blur" ? buildBlurPlaceholder(src) : null;

  return (
    <span
      className={`responsive-image${fill ? " responsive-image-fill" : ""}${className ? ` ${className}` : ""}${loaded ? " is-loaded" : ""}`}
      style={!fill && width && height ? { aspectRatio: `${width} / ${height}` } : undefined}
    >
      {blurSrc ? (
        <span
          className="responsive-image-placeholder"
          aria-hidden="true"
          style={{ backgroundImage: `url(${blurSrc})` }}
        />
      ) : null}
      <picture>
        <source srcSet={buildSrcSet(src, outputWidths, { format: "avif", quality: 62 })} sizes={sizes} type="image/avif" />
        <source srcSet={buildSrcSet(src, outputWidths, { format: "webp", quality: 70 })} sizes={sizes} type="image/webp" />
        <img
          className={`responsive-image-element${imgClassName ? ` ${imgClassName}` : ""}`}
          src={optimizeImageUrl(src, { width, quality: 76 })}
          srcSet={buildSrcSet(src, outputWidths)}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={resolvedLoading}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          style={{ objectFit: fit }}
        />
      </picture>
    </span>
  );
}
