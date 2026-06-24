import { Star } from "lucide-react";

export default function StarRating({ rating, count, compact = false }) {
  return (
    <div className="stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={compact ? 14 : 16} fill={star <= Math.round(rating) ? "currentColor" : "none"} />
      ))}
      <span>{rating}</span>
      {count ? <span className="muted">({count})</span> : null}
    </div>
  );
}
