import { apiFetch } from "./client";

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  sellerName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
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
  image: string;
  quantity: number;
  stock: number;
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
  productId: string;
  quantity: number;
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

export const updateCartItem = (itemId: number, quantity: number) =>
  apiFetch<CartItem>(`/api/buyer/cart/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });

export const removeFromCart = (itemId: number) =>
  apiFetch<void>(`/api/buyer/cart/items/${itemId}`, { method: "DELETE" });

export const clearCartApi = () =>
  apiFetch<void>("/api/buyer/cart", { method: "DELETE" });

// ── Favorites ────────────────────────────────────────────────────────────────

export const getFavorites = () => apiFetch<FavoriteItem[]>("/api/buyer/favorites");

export const addFavoriteApi = (productId: string) =>
  apiFetch<void>(`/api/buyer/favorites/${productId}`, { method: "POST" });

export const removeFavoriteApi = (productId: string) =>
  apiFetch<void>(`/api/buyer/favorites/${productId}`, { method: "DELETE" });

