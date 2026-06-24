import { Banknote, CreditCard, Smartphone, Truck } from "lucide-react";

const options = [
  ["M-Pesa", Smartphone],
  ["Airtel Money", Smartphone],
  ["Visa", CreditCard],
  ["Mastercard", CreditCard],
  ["Cash on Delivery", Banknote]
];

export default function PaymentOptions() {
  return (
    <section className="payment-band">
      <div className="container">
        <div className="section-heading">
          <h2>Flexible Payment, Your Way</h2>
          <p><Truck size={18} /> Pay on delivery available across Nairobi, Kiambu, Machakos & Kajiado.</p>
        </div>
        <div className="payment-grid">
          {options.map(([label, Icon]) => (
            <div className="payment-option" key={label}>
              <Icon />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
