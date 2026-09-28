// src/pages/Checkout.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useCart } from "../context/CartContext";
import { createOrder, type ShippingAddress } from "../lib/api/orders";
import "../styles/Checkout.css";

const EMPTY_ADDRESS: ShippingAddress = {
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  phone: "",
};

export default function Checkout() {
  const { cartItems, subtotal } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFee = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + deliveryFee;

  function updateField<K extends keyof ShippingAddress>(key: K, value: string) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  const requiredFilled =
    address.name && address.line1 && address.city && address.state && address.postalCode && address.phone;

  async function handlePlaceOrder() {
    if (!requiredFilled || cartItems.length === 0) return;
    setPlacing(true);
    setError(null);

    try {
      const { order, paymentConfigured } = await createOrder({
        cartItems: cartItems.map((i) => ({ productId: i.id, quantity: i.quantity })),
        shippingAddress: address,
      });

      if (!paymentConfigured || !order.razorpayPaymentLinkUrl) {
        // Order is created and saved either way; payment just isn't wired up yet
        // (Razorpay test keys not configured). Go straight to the confirmation page.
        navigate(`/order-confirmation/${order.id}`);
        return;
      }

      // Hand off to Razorpay's hosted payment link page; it redirects back to
      // /order-confirmation/:id (set server-side as the link's callback_url) once paid.
      window.location.href = order.razorpayPaymentLinkUrl;
    } catch (err: any) {
      setError(err.message || "Something went wrong placing your order. Is the backend running?");
      setPlacing(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="checkout-page checkout-empty">
          <p>Your bag is empty.</p>
          <button className="btn-secondary" onClick={() => navigate("/")}>Continue shopping</button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="checkout-page">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-grid">
          <section className="checkout-address">
            <h2>Delivery address</h2>
            <div className="checkout-form-grid">
              <input placeholder="Full name" value={address.name} onChange={(e) => updateField("name", e.target.value)} />
              <input placeholder="Phone number" value={address.phone} onChange={(e) => updateField("phone", e.target.value)} />
              <input className="span-2" placeholder="Address line 1" value={address.line1} onChange={(e) => updateField("line1", e.target.value)} />
              <input className="span-2" placeholder="Address line 2 (optional)" value={address.line2 || ""} onChange={(e) => updateField("line2", e.target.value)} />
              <input placeholder="City" value={address.city} onChange={(e) => updateField("city", e.target.value)} />
              <input placeholder="State" value={address.state} onChange={(e) => updateField("state", e.target.value)} />
              <input placeholder="PIN code" value={address.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
            </div>

            <div className="escrow-note">
              <strong>Payment is handled by Razorpay.</strong> You'll be taken to a secure
              Razorpay payment page to complete your purchase.
            </div>

            {error && <p className="checkout-error">{error}</p>}
          </section>

          <aside className="checkout-summary">
            <h2>Order summary</h2>
            <ul className="checkout-items">
              {cartItems.map((item) => (
                <li key={item.id}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="checkout-line"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="checkout-line">
              <span>Delivery</span><span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
            </div>
            <div className="checkout-line checkout-total"><span>Total</span><span>₹{total}</span></div>

            <button
              className="btn-primary checkout-pay-btn"
              disabled={!requiredFilled || placing}
              onClick={handlePlaceOrder}
            >
              {placing ? "Opening secure payment…" : `Pay ₹${total} securely`}
            </button>
          </aside>
        </div>
      </div>
    </>
  );
}
