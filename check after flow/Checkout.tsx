// src/pages/Checkout.tsx
// Route: /checkout
// Replaces the old "PROCEED TO CHECKOUT" button's dead end on the Cart page.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext"; // assumes your existing cart context
import { createOrder, verifyPayment, type ShippingAddress } from "../lib/api/orders";
import "./Checkout.css";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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
  const { items, subtotal, clearCart } = useCart();
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
    if (!requiredFilled || items.length === 0) return;
    setPlacing(true);
    setError(null);
    try {
      const { order, razorpayOrderId, amount, keyId } = await createOrder({
        cartItems: items.map((i) => ({ listingId: i.listingId, quantity: i.quantity })),
        shippingAddress: address,
      });

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Could not load the payment gateway. Check your connection and try again.");

      const rzp = new window.Razorpay({
        key: keyId,
        order_id: razorpayOrderId,
        amount,
        currency: "INR",
        name: "ReStyle",
        description: `Order for ${items.length} item${items.length > 1 ? "s" : ""}`,
        prefill: { name: address.name, contact: address.phone },
        theme: { color: "#a4133c" },
        handler: async (response: any) => {
          try {
            await verifyPayment(order._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            navigate(`/order-confirmation/${order._id}`);
          } catch (err: any) {
            setError("Payment succeeded but we couldn't confirm the order. Contact support with your payment ID.");
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      });

      rzp.on("payment.failed", () => {
        setError("Payment failed or was cancelled. No money has left your account.");
        setPlacing(false);
      });

      rzp.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong placing your order.");
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page checkout-empty">
        <p>Your bag is empty.</p>
        <button className="btn-secondary" onClick={() => navigate("/")}>Continue shopping</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-grid">
        <section className="checkout-address">
          <h2>Delivery address</h2>
          <div className="checkout-form-grid">
            <input placeholder="Full name" value={address.name} onChange={(e) => updateField("name", e.target.value)} />
            <input placeholder="Phone number" value={address.phone} onChange={(e) => updateField("phone", e.target.value)} />
            <input className="span-2" placeholder="Address line 1" value={address.line1} onChange={(e) => updateField("line1", e.target.value)} />
            <input className="span-2" placeholder="Address line 2 (optional)" value={address.line2} onChange={(e) => updateField("line2", e.target.value)} />
            <input placeholder="City" value={address.city} onChange={(e) => updateField("city", e.target.value)} />
            <input placeholder="State" value={address.state} onChange={(e) => updateField("state", e.target.value)} />
            <input placeholder="PIN code" value={address.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
          </div>

          <div className="escrow-note">
            <strong>Your payment is held securely.</strong> ReStyle keeps your money in escrow and only
            releases it to the seller once you confirm the item has arrived as described.
          </div>

          {error && <p className="checkout-error">{error}</p>}
        </section>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          <ul className="checkout-items">
            {items.map((item) => (
              <li key={item.listingId}>
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
  );
}
