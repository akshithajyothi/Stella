// src/lib/api/auth.ts
// TypeScript API client for the real backend auth endpoints (see backend/routes/auth.js)

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  city?: string;
  isAdmin: boolean;
  createdAt: string;
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

export async function register(name: string, email: string, password: string): Promise<{ user: AuthUser }> {
  return fetchWithAuth("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email: string, password: string): Promise<{ user: AuthUser }> {
  return fetchWithAuth("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<{ message: string }> {
  return fetchWithAuth("/auth/logout", { method: "POST" });
}

export async function fetchCurrentUser(): Promise<{ user: AuthUser }> {
  return fetchWithAuth("/auth/me");
}

export async function updateProfile(data: { name?: string; bio?: string; city?: string }): Promise<{ user: AuthUser }> {
  return fetchWithAuth("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
