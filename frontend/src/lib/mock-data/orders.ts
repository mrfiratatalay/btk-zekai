import type { CustomerOrder } from "@/types/order";

export const customerOrders: CustomerOrder[] = [
  {
    id: "order-pulsewave-1001",
    orderNumber: "ZK-2026-1001",
    orderedAt: "8 Mayıs 2026",
    deliveredAt: "10 Mayıs 2026",
    status: "delivered",
    total: 1015,
    item: {
      productId: "bluetooth-kulaklik-pro-x1",
      title: "PulseWave Pro X1 Bluetooth 5.3 Kablosuz Kulaklık",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      sellerName: "TeknoPazar Plus",
      category: "Elektronik / Kulaklık",
      price: 1015,
      quantity: 1,
    },
    deliveryAddress: "İstanbul, Kadıköy",
    paymentMethod: "Kredi kartı",
    canReturn: true,
  },
  {
    id: "order-seramik-1002",
    orderNumber: "ZK-2026-1002",
    orderedAt: "3 Mayıs 2026",
    deliveredAt: "6 Mayıs 2026",
    status: "return_requested",
    total: 380,
    item: {
      productId: "seramik-taki-seti-beyaz",
      title: "Seramik Takı Seti - Beyaz",
      image:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
      sellerName: "Atölye Luna",
      category: "Aksesuar",
      price: 380,
      quantity: 1,
    },
    deliveryAddress: "İstanbul, Beşiktaş",
    paymentMethod: "Kredi kartı",
    canReturn: true,
    returnId: "demo-return-1",
  },
];

export function getOrderById(orderId: string) {
  return customerOrders.find((order) => order.id === orderId);
}

export function formatOrderPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}
