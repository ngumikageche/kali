import { Send } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="newsletter">
      <div className="container newsletter-inner">
        <div>
          <p className="eyebrow">Stay in the Field</p>
          <h2>STAY IN THE FIELD</h2>
          <p>Early access to drops, exclusive discounts & tactical gear guides.</p>
        </div>
        <form>
          <input type="email" placeholder="Email address" aria-label="Email address" />
          <button className="btn btn-primary" type="button"><Send size={17} /> SUBSCRIBE</button>
        </form>
      </div>
    </section>
  );
}
