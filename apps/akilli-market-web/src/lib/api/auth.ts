import { apiFetch } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "Buyer" | "Seller";
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (typeof window !== "undefined") {
    localStorage.setItem("market_token", res.token);
    localStorage.setItem("market_refresh_token", res.refreshToken);
    localStorage.setItem("market_user", JSON.stringify(res.user));
  }
  return res;
}

export async function register(
  email: string,
  password: string,
  fullName: string,
  role: "buyer" | "seller",
): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName, role }),
  });
  if (typeof window !== "undefined") {
    localStorage.setItem("market_token", res.token);
    localStorage.setItem("market_refresh_token", res.refreshToken);
    localStorage.setItem("market_user", JSON.stringify(res.user));
  }
  return res;
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("market_token");
    localStorage.removeItem("market_refresh_token");
    localStorage.removeItem("market_user");
  }
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("market_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("market_user");
    return null;
  }
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("market_token");
}
