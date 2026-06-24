export default function StorefrontState({ title, body, tone = "default" }) {
  return (
    <div className={`storefront-state${tone === "error" ? " is-error" : ""}`}>
      <strong>{title}</strong>
      {body ? <p>{body}</p> : null}
    </div>
  );
}
