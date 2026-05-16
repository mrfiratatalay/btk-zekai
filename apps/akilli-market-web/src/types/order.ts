export type OrderStatus = "delivered" | "return_requested" | "completed";

export type OrderItem = {
  productId: string;
  title: string;
  image: string;
  sellerName: string;
  category: string;
  price: number;
  quantity: number;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  orderedAt: string;
  deliveredAt: string;
  status: OrderStatus;
  total: number;
  item: OrderItem;
  deliveryAddress: string;
  paymentMethod: string;
  canReturn: boolean;
  returnId?: string;
};
