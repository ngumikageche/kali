export default function Badge({ children, tone = "accent" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
