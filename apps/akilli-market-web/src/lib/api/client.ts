export const API_BASE =
  process.env.NEXT_PUBLIC_COMMERCE_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5001";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("market_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("market_refresh_token");
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      localStorage.removeItem("market_token");
      localStorage.removeItem("market_refresh_token");
      localStorage.removeItem("market_user");
      return null;
    }
    const data = await res.json();
    localStorage.setItem("market_token", data.token);
    localStorage.setItem("market_refresh_token", data.refreshToken);
    return data.token;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const newToken = await tryRefresh();
    if (newToken) return apiFetch(path, options, false);
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  // 204 No Content (DELETE gibi) — body yok, parse etme
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
