import { useState } from "react";

const tabs = ["Description", "Fabric & Care", "Sizing Guide", "Delivery & Returns"];

export default function ProductDetails({ product }) {
  const [tab, setTab] = useState(tabs[0]);
  return (
    <section className="container details-tabs">
      <div className="tab-list">
        {tabs.map((item) => <button id={item === "Sizing Guide" ? "size-guide" : undefined} className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item.toUpperCase()}</button>)}
      </div>
      <div className="tab-panel">
        {tab === "Description" ? (
          <>
            <h2>{product.brand ? `${product.brand} Product Overview` : "Product Overview"}</h2>
            <p>{product.description || "No public description is currently exposed for this product."}</p>
            {product.keyFeatures?.length ? <ul>{product.keyFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul> : null}
          </>
        ) : null}
        {tab === "Fabric & Care" ? (
          <div>
            <p>{product.ingredients || product.additionalInformation || "Additional composition and care information is not available yet."}</p>
            {product.specifications?.length ? (
              <ul>
                {product.specifications.map((item, index) => <li key={`${item.label || "spec"}-${index}`}>{item.label ? `${item.label}: ` : ""}{item.value || String(item)}</li>)}
              </ul>
            ) : null}
          </div>
        ) : null}
        {tab === "Sizing Guide" ? (
          <div>
            <p>True-to-size tactical fit. Pick your usual waist size, or size up for base layers.</p>
            <table className="size-table">
              <thead><tr><th>Size</th><th>Waist CM</th><th>Waist IN</th><th>Hip CM</th></tr></thead>
              <tbody>{["S", "M", "L", "XL", "XXL"].map((size, index) => <tr key={size}><td>{size}</td><td>{76 + index * 6}</td><td>{30 + index * 2}</td><td>{94 + index * 6}</td></tr>)}</tbody>
            </table>
          </div>
        ) : null}
        {tab === "Delivery & Returns" ? <p>Same-day Nairobi dispatch for orders before 12PM. Standard delivery covers Nairobi CBD, Westlands, Karen, Kiambu, Thika, Machakos, Ngong, and Mombasa Road. Hakuna Matata Returns within 7 days.</p> : null}
      </div>
    </section>
  );
}
