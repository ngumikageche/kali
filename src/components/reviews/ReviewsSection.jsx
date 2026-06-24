import { PenLine, X } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button.jsx";
import StorefrontState from "../ui/StorefrontState.jsx";
import ReviewCard from "./ReviewCard.jsx";

export default function ReviewsSection({ product, reviews = [] }) {
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const tags = ["all", ...new Set(reviews.map((review) => review.tag).filter(Boolean))];
  const filtered = filter === "all" ? reviews : reviews.filter((review) => review.tag === filter);

  return (
    <section className="reviews-section">
      <div className="container reviews-layout">
        <div className="review-summary">
          <span className="score">{product.rating}</span>
          <p>Overall rating from {product.reviews} reviews</p>
          {[5, 4, 3, 2, 1].map((rating, index) => (
            <div className="rating-bar" key={rating}>
              <span>{rating}★</span>
              <div><i style={{ width: `${[78, 16, 4, 1, 1][index]}%` }} /></div>
            </div>
          ))}
          <Button onClick={() => setModalOpen(true)}><PenLine size={16} /> WRITE A REVIEW</Button>
        </div>
        <div className="review-list">
          <div className="review-tools">
            <div className="filter-tags">
              {tags.map((tag) => <button className={filter === tag ? "active" : ""} onClick={() => setFilter(tag)} key={tag}>{tag}</button>)}
            </div>
            <select aria-label="Sort reviews">
              <option>Most Recent</option>
              <option>Most Helpful</option>
              <option>Highest Rated</option>
            </select>
          </div>
          {filtered.length ? filtered.map((review) => <ReviewCard review={review} key={review.id} />) : <StorefrontState title="No public reviews yet" body="The storefront review endpoint is not returning data for this product yet." />}
        </div>
      </div>
      {modalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="review-modal" aria-label="Write a review">
            <button className="modal-close" type="button" onClick={() => setModalOpen(false)} aria-label="Close review modal"><X /></button>
            <h2>WRITE A REVIEW</h2>
            <label>Overall Rating<select><option>5 Stars</option><option>4 Stars</option><option>3 Stars</option></select></label>
            <label>Title<input placeholder="Field-tested comfort" /></label>
            <label>Review<textarea rows="4" placeholder="Tell other buyers how it performed." /></label>
            <label>Size Purchased<input placeholder="M / 34" /></label>
            <label className="toggle"><input type="checkbox" defaultChecked /> Verified purchase</label>
            <button className="btn btn-primary" type="button" onClick={() => setModalOpen(false)}>SUBMIT REVIEW</button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
