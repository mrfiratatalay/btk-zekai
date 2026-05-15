export type ReturnStatus =
  | "seller_review"
  | "seller_disputed"
  | "arbiter_review"
  | "resolution_proposed"
  | "resolved";

export type ReturnReasonKey =
  | "damaged"
  | "not_as_expected"
  | "wrong_product"
  | "low_quality"
  | "other";

export type ReturnTimelineStatus = "completed" | "current" | "pending";

export type ReturnTimelineItem = {
  label: string;
  description: string;
  status: ReturnTimelineStatus;
};

export type ReturnRequest = {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  buyerName: string;
  sellerName: string;
  reason: ReturnReasonKey;
  reasonLabel: string;
  buyerClaim: string;
  sellerResponse?: string;
  status: ReturnStatus;
  amount: number;
  requestedAt: string;
  updatedAt: string;
  evidenceImages: string[];
  timeline: ReturnTimelineItem[];
};
