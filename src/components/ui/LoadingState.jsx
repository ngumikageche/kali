export default function LoadingState({ variant = "catalog", title = "Loading" }) {
  if (variant === "product") {
    return (
      <section className="section container loading-shell" aria-live="polite" aria-busy="true">
        <div className="loading-heading">
          <span className="loading-kicker shimmer-block" />
          <span className="loading-title shimmer-block" />
        </div>
        <div className="product-page product-page-loading">
          <div className="loading-panel loading-gallery">
            <div className="shimmer-block loading-gallery-main" />
            <div className="loading-gallery-thumbs">
              {[1, 2, 3, 4].map((item) => <span className="shimmer-block loading-thumb" key={item} />)}
            </div>
          </div>
          <div className="loading-panel loading-info">
            <span className="loading-line short shimmer-block" />
            <span className="loading-line medium shimmer-block" />
            <span className="loading-line shimmer-block" />
            <span className="loading-line long shimmer-block" />
            <div className="loading-meta-grid">
              {[1, 2, 3, 4].map((item) => <span className="shimmer-block loading-meta-card" key={item} />)}
            </div>
            <div className="loading-button-stack">
              <span className="shimmer-block loading-button" />
              <span className="shimmer-block loading-button" />
            </div>
          </div>
        </div>
        <span className="loading-caption">Loading product details...</span>
      </section>
    );
  }

  return (
    <section className="loading-shell" aria-live="polite" aria-busy="true">
      <div className="loading-heading">
        <span className="loading-kicker shimmer-block" />
        <span className="loading-title shimmer-block" />
      </div>
      <div className="catalog-grid loading-grid">
        {[1, 2, 3, 4].map((item) => (
          <article className="product-card loading-card" key={item}>
            <div className="product-media">
              <span className="shimmer-block loading-media" />
            </div>
            <div className="product-copy">
              <span className="loading-line short shimmer-block" />
              <span className="loading-line shimmer-block" />
              <span className="loading-line medium shimmer-block" />
              <span className="loading-line short shimmer-block" />
              <span className="shimmer-block loading-button" />
            </div>
          </article>
        ))}
      </div>
      <span className="loading-caption">{title}</span>
    </section>
  );
}
