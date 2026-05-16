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

