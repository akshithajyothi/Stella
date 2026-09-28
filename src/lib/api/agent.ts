// src/lib/api/agent.ts
// TypeScript API client for the buying + negotiation agents (see backend/routes/agent.js)
import type { ShippingAddress } from "./orders";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export interface AgentProduct {
  id: number;
  name: string;
  size: string;
  price: number;
  badge: string;
  image: string;
  gender: string;
  color: string;
  condition: string;
  category: string;
  description: string;
}

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export type AgentAction =
  | { type: "add_to_cart"; product: { id: number; name: string; price: number; image: string; size?: string }; quantity: number }
  | { type: "add_to_wishlist"; product: { id: number; name: string; price: number; image: string; size?: string } }
  | { type: "try_on"; garmentImage: string; garmentName: string }
  | { type: "negotiation"; productId: number; productName: string; listingPrice: number; offer: number; status: "active" | "accepted" | "rejected" | "final" }
  | { type: "show_checkout_form" }
  | { type: "payment_link"; url: string; orderId: number }
  | { type: "order_placed"; orderId: number };

export interface BuyingChatResponse {
  reply: string;
  products?: AgentProduct[];
  quickReplies?: string[];
  action?: AgentAction;
}

export interface NegotiateStartResponse {
  sessionId: number;
  reply: string;
  offer: number;
  status: "active" | "accepted" | "rejected" | "final";
}

export interface NegotiateMessageResponse {
  reply: string;
  offer: number;
  status: "active" | "accepted" | "rejected" | "final";
  round: number;
  maxRounds: number;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function sendBuyingAgentMessage(data: {
  message: string;
  history: ChatHistoryMessage[];
  cart: Array<{ id: number; name: string; price: number; image: string; quantity: number }>;
  address?: ShippingAddress;
  wardrobe?: Array<{ id: number; name: string; category: string; color?: string }>;
  currentProduct?: { id: number; name: string; price: number } | null;
  recentProducts?: AgentProduct[];
}): Promise<BuyingChatResponse> {
  return fetchWithAuth("/agent/buying/chat", { method: "POST", body: JSON.stringify(data) });
}

export async function startNegotiation(productId: number): Promise<NegotiateStartResponse> {
  return fetchWithAuth("/agent/negotiate/start", { method: "POST", body: JSON.stringify({ productId }) });
}

export async function sendNegotiationMessage(sessionId: number, message: string): Promise<NegotiateMessageResponse> {
  return fetchWithAuth(`/agent/negotiate/${sessionId}/message`, { method: "POST", body: JSON.stringify({ message }) });
}
