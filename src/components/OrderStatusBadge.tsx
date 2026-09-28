// src/components/OrderStatusBadge.tsx
import type { OrderStatus } from "../lib/api/orders";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending Payment", color: "#666", bg: "#f5f5f5" },
  paid: { label: "Paid", color: "#4caf50", bg: "#e8f5e9" },
  cancelled: { label: "Cancelled", color: "#757575", bg: "#f5f5f5" },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.bg,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {config.label}
    </span>
  );
}
