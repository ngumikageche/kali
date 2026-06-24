import { ThumbsDown, ThumbsUp } from "lucide-react";
import StarRating from "../ui/StarRating.jsx";

export default function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div>
        <StarRating rating={review.rating} compact />
        <strong>{review.title}</strong>
        <p>{review.body}</p>
      </div>
      <aside>
        <span>{review.name}</span>
        <small>{review.date} - Verified Purchase</small>
        <div className="helpful">
          <button><ThumbsUp size={15} /> {review.helpful}</button>
          <button><ThumbsDown size={15} /></button>
        </div>
      </aside>
    </article>
  );
}
