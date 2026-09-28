// src/pages/SellerOrders.tsx
// Route: /selling  (link this from Profile as "My Sales")
import { useEffect, useState } from "react";
import { fetchSellingOrders, shipOrder, type Order } from "../lib/api/orders";
import OrderStatusBadge from "../components/OrderStatusBadge";
import "./Orders.css";

export default function SellerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [tracking, setTracking] = useState({ carrier: "", trackingNumber: "" });

  function reload() {
    fetchSellingOrders().then((res) => setOrders(res.orders)).finally(() => setLoading(false));
  }

  useEffect(() => { reload(); }, []);

  async function handleShip(id: string) {
    if (!tracking.carrier || !tracking.trackingNumber) return;
    await shipOrder(id, tracking);
    setShippingId(null);
    setTracking({ carrier: "", trackingNumber: "" });
    reload();
  }

  if (loading) return <div className="orders-page">Loading your sales…</div>;

  return (
    <div className="orders-page">
      <h1>My sales</h1>

      {orders.length === 0 && <p className="orders-empty">Nothing sold yet — your listings' sales will show up here.</p>}

      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order._id}>
            <img src={order.itemImage} alt={order.itemTitle} className="order-thumb" />
            <div className="order-info">
              <div className="order-info-top">
                <span className="order-item-name">{order.itemTitle}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="order-meta">
                Order #{order._id.slice(-8)} · You'll receive ₹{order.sellerPayout} after platform fee
              </div>

              {order.status === "escrow_held" && (
                shippingId === order._id ? (
                  <div className="dispute-form">
                    <input
                      placeholder="Carrier (e.g. Delhivery)"
                      value={tracking.carrier}
                      onChange={(e) => setTracking((t) => ({ ...t, carrier: e.target.value }))}
                    />
                    <input
                      placeholder="Tracking number"
                      value={tracking.trackingNumber}
                      onChange={(e) => setTracking((t) => ({ ...t, trackingNumber: e.target.value }))}
                    />
                    <div className="dispute-form-actions">
                      <button className="btn-secondary sm" onClick={() => setShippingId(null)}>Cancel</button>
                      <button className="btn-primary sm" onClick={() => handleShip(order._id)}>Confirm shipped</button>
                    </div>
                  </div>
                ) : (
                  <div className="order-action-row">
                    <span className="order-hint">Buyer paid — ship within 3 business days.</span>
                    <button className="btn-primary sm" onClick={() => setShippingId(order._id)}>Mark as shipped</button>
                  </div>
                )
              )}

              {order.status === "shipped" && (
                <p className="order-hint">
                  Shipped via {order.shipping?.carrier} ({order.shipping?.trackingNumber}). Waiting for buyer confirmation.
                </p>
              )}
              {order.status === "delivered" && (
                <p className="order-hint">Buyer received the item. Payout releases automatically if no dispute is raised.</p>
              )}
              {order.status === "disputed" && (
                <p className="order-hint">Buyer raised an issue — payout is on hold pending review.</p>
              )}
              {order.status === "completed" && (
                <p className="order-hint">₹{order.sellerPayout} paid out to your linked account.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
