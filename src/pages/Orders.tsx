// src/pages/Orders.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import OrderStatusBadge from "../components/OrderStatusBadge";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { fetchMyOrders, type Order } from "../lib/api/orders";
import "../styles/Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then((res) => setOrders(res.orders))
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="orders-page"><Spinner label="Loading your orders…" /></div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="orders-page">
        <h1>My orders</h1>

        {orders.length === 0 && (
          <EmptyState
            icon="fa-solid fa-receipt"
            title="No orders yet"
            message="Your purchases will show up here."
            actionLabel="Start Shopping"
            actionTo="/tops"
          />
        )}

        <div className="orders-list">
          {orders.map((order) => (
            <Link to={`/order-confirmation/${order.id}`} className="order-card" key={order.id}>
              <img src={order.items[0]?.image} alt={order.items[0]?.name} className="order-thumb" />
              <div className="order-info">
                <div className="order-info-top">
                  <span className="order-item-name">
                    {order.items[0]?.name}
                    {order.items.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="order-meta">Order #{order.id} · ₹{order.total}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
