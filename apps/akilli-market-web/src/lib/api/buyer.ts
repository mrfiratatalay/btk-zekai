import { apiFetch } from "./client";

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  sellerName: string;
  bundleId: string | null;
  bundleTitle: string | null;
  originalUnitPrice: number;
  discountAmount: number;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  discountTotal: number;
  total: number;
  status: string;
  deliveryAddress: string;
  paymentMethod: string;
  orderedAt: string;
  deliveredAt: string | null;
  items: OrderItem[];
}

export interface CartItem {
  id: number;
  productId: string;
  title: string;
  price: number;
  originalPrice: number;
  discountAmount: number;
  image: string;
  quantity: number;
  stock: number;
  bundleId: string | null;
  bundleTitle: string | null;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface FavoriteItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  addedAt: string;
}

// ── Orders ──────────────────────────────────────────────────────────────────

export const getOrders = () => apiFetch<Order[]>("/api/buyer/orders");

export const getOrder = (id: string) => apiFetch<Order>(`/api/buyer/orders/${id}`);

export const createOrder = (data: {
  items: Array<{ productId: string; quantity: number }>;
  bundles: Array<{ bundleId: string; quantity: number }>;
  deliveryAddress: string;
  paymentMethod?: string;
}) =>
  apiFetch<Order>("/api/buyer/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const markDelivered = (orderId: string) =>
  apiFetch<Order>(`/api/buyer/orders/${orderId}/mark-delivered`, {
    method: "POST",
  });

// ── Cart ─────────────────────────────────────────────────────────────────────

export const getCart = () => apiFetch<Cart>("/api/buyer/cart");

export const addToCart = (productId: string, quantity = 1) =>
  apiFetch<CartItem>("/api/buyer/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });

export const addBundleToCart = (bundleId: string, quantity = 1) =>
  apiFetch<CartItem[]>(`/api/buyer/cart/bundles/${bundleId}`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });

export const updateCartItem = (itemId: number, quantity: number) =>
  apiFetch<CartItem>(`/api/buyer/cart/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });

export const updateCartBundle = (bundleId: string, quantity: number) =>
  apiFetch<CartItem[]>(`/api/buyer/cart/bundles/${bundleId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });

export const removeFromCart = (itemId: number) =>
  apiFetch<void>(`/api/buyer/cart/items/${itemId}`, { method: "DELETE" });

export const removeBundleFromCart = (bundleId: string) =>
  apiFetch<void>(`/api/buyer/cart/bundles/${bundleId}`, { method: "DELETE" });

export const clearCartApi = () =>
  apiFetch<void>("/api/buyer/cart", { method: "DELETE" });

// ── Favorites ────────────────────────────────────────────────────────────────

export const getFavorites = () => apiFetch<FavoriteItem[]>("/api/buyer/favorites");

export const addFavoriteApi = (productId: string) =>
  apiFetch<void>(`/api/buyer/favorites/${productId}`, { method: "POST" });

export const removeFavoriteApi = (productId: string) =>
  apiFetch<void>(`/api/buyer/favorites/${productId}`, { method: "DELETE" });
