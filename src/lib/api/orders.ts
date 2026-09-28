// src/lib/api/orders.ts
// TypeScript API client for the orders endpoints (buyer-side prototype, no escrow/shipping)

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export type OrderStatus = "pending" | "paid" | "cancelled";

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  razorpayPaymentLinkId?: string;
  razorpayPaymentLinkUrl?: string;
  createdAt: string;
}

interface CreateOrderRequest {
  cartItems: Array<{ productId: number; quantity: number }>;
  shippingAddress: ShippingAddress;
}

interface CreateOrderResponse {
  order: Order;
  paymentConfigured: boolean;
}

// Helper to include credentials (cookies) with requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: "include", // Send cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Create order and get a Razorpay payment link (if payment is configured)
export async function createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  return fetchWithAuth("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Fetch buyer's orders
export async function fetchMyOrders(): Promise<{ orders: Order[] }> {
  return fetchWithAuth("/orders/mine");
}

// Fetch a single order — also polls the payment link status server-side
export async function fetchOrder(orderId: number): Promise<{ order: Order }> {
  return fetchWithAuth(`/orders/${orderId}`);
}
