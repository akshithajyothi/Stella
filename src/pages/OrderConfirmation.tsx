// src/pages/OrderConfirmation.tsx
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import OrderStatusBadge from "../components/OrderStatusBadge";
import Spinner from "../components/Spinner";
import { useCart } from "../context/CartContext";
import { fetchOrder, type Order } from "../lib/api/orders";
import "../styles/OrderConfirmation.css";

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (!orderId) return;
    fetchOrder(Number(orderId))
      .then((res) => {
        setOrder(res.order);
        // Clear the cart once we know this order actually exists server-side — whether or
        // not payment has completed yet (the order itself was already placed either way).
        if (!cleared.current) {
          cleared.current = true;
          clearCart();
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="order-confirmation-page">
          <Spinner label="Loading your order…" />
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <div className="order-confirmation-page">
          <div className="confirmation-error">
            <h1>Order not found</h1>
            <p>{error || "We couldn't find this order."}</p>
            <Link to="/" className="btn-primary">Back to home</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="order-confirmation-page">
        <div className="confirmation-card">
          <div className="confirmation-header">
            <div className="success-icon">✓</div>
            <h1>{order.status === "paid" ? "Order confirmed!" : "Order placed"}</h1>
            <p className="confirmation-subtitle">
              {order.status === "paid"
                ? "Your payment was received."
                : "Complete payment to confirm your order."}
            </p>
          </div>

          <div className="order-details">
            <div className="detail-row">
              <span className="detail-label">Order ID</span>
              <span className="detail-value">#{order.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="detail-row">
              <span className="detail-label">Total</span>
              <span className="detail-value">₹{order.total}</span>
            </div>
          </div>

          <div className="order-item-preview-list">
            {order.items.map((item) => (
              <div className="order-item-preview" key={item.productId}>
                <img src={item.image} alt={item.name} className="item-preview-img" />
                <div className="item-preview-info">
                  <h3>{item.name} × {item.quantity}</h3>
                  <p className="item-price">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {order.status === "pending" && order.razorpayPaymentLinkUrl && (
            <a href={order.razorpayPaymentLinkUrl} className="btn-primary" style={{ display: "block", textAlign: "center", marginBottom: 16 }}>
              Complete payment
            </a>
          )}

          <div className="shipping-address">
            <h3>Shipping to:</h3>
            <p>{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>

          <div className="confirmation-actions">
            <Link to="/orders" className="btn-primary">View my orders</Link>
            <Link to="/" className="btn-secondary">Continue shopping</Link>
          </div>
        </div>
      </div>
    </>
  );
}
