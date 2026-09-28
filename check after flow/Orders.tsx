// src/pages/Orders.tsx
// Route: /orders  (buyer's "My Orders" — link this from Profile)
import { useEffect, useState } from "react";
import { fetchMyOrders, markReceived, raiseDispute, type Order } from "../lib/api/orders";
import OrderStatusBadge from "../components/OrderStatusBadge";
import "./Orders.css";

function daysLeft(isoDate?: string) {
  if (!isoDate) return null;
  const ms = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputingId, setDisputingId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  function reload() {
    fetchMyOrders().then((res) => setOrders(res.orders)).finally(() => setLoading(false));
  }

  useEffect(() => { reload(); }, []);

  async function handleMarkReceived(id: string) {
    await markReceived(id);
    reload();
  }

  async function handleSubmitDispute(id: string) {
    if (!disputeReason.trim()) return;
    await raiseDispute(id, disputeReason);
    setDisputingId(null);
    setDisputeReason("");
    reload();
  }

  if (loading) return <div className="orders-page">Loading your orders…</div>;

  return (
    <div className="orders-page">
      <h1>My orders</h1>

      {orders.length === 0 && <p className="orders-empty">No orders yet — your purchases will show up here.</p>}

      <div className="orders-list">
        {orders.map((order) => {
          const remaining = order.status === "delivered" ? daysLeft(order.delivery?.autoReleaseAt) : null;
          return (
            <div className="order-card" key={order._id}>
              <img src={order.itemImage} alt={order.itemTitle} className="order-thumb" />
              <div className="order-info">
                <div className="order-info-top">
                  <span className="order-item-name">{order.itemTitle}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="order-meta">Order #{order._id.slice(-8)} · ₹{order.price}</div>

                {order.status === "shipped" && (
                  <div className="order-action-row">
                    <span className="order-hint">
                      {order.shipping?.carrier} · {order.shipping?.trackingNumber}
                    </span>
                    <button className="btn-primary sm" onClick={() => handleMarkReceived(order._id)}>
                      Mark as received
                    </button>
                  </div>
                )}

                {order.status === "delivered" && (
                  <div className="order-action-row">
                    <span className="order-hint">
                      {remaining !== null && remaining > 0
                        ? `Payment auto-releases to seller in ${remaining} day${remaining === 1 ? "" : "s"} unless you raise an issue.`
                        : "Inspection window closing — releasing payment shortly."}
                    </span>
                    {disputingId === order._id ? (
                      <div className="dispute-form">
                        <textarea
                          placeholder="What's wrong with the item?"
                          value={disputeReason}
                          onChange={(e) => setDisputeReason(e.target.value)}
                        />
                        <div className="dispute-form-actions">
                          <button className="btn-secondary sm" onClick={() => setDisputingId(null)}>Cancel</button>
                          <button className="btn-danger sm" onClick={() => handleSubmitDispute(order._id)}>
                            Submit dispute
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn-outline sm" onClick={() => setDisputingId(order._id)}>
                        Something's wrong
                      </button>
                    )}
                  </div>
                )}

                {order.status === "disputed" && (
                  <p className="order-hint">Our team is reviewing your case. We'll email you the outcome.</p>
                )}
                {order.status === "completed" && (
                  <p className="order-hint">Delivered and confirmed. Thanks for buying pre-loved!</p>
                )}
                {order.status === "refunded" && <p className="order-hint">Refunded to your original payment method.</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
