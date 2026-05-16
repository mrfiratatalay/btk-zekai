export type ArbiterEvidencePoint = {
  id: string;
  title: string;
  description: string;
};

export type ArbiterResolution = {
  recommendedRefundPercent: number;
  refundAmount: number;
  sellerKeepsAmount: number;
  buyerOutcome: string;
  sellerOutcome: string;
  operationalImpact: string;
};

export type ArbiterCase = {
  id: string;
  returnId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  orderAmount: number;
  deliveryDate: string;
  returnOpenedAt: string;
  buyerClaim: string;
  sellerClaim: string;
  sellerRightPercent: number;
  buyerRightPercent: number;
  resolution: ArbiterResolution;
  sellerEvidence: ArbiterEvidencePoint[];
  buyerEvidence: ArbiterEvidencePoint[];
  reviewSteps: string[];
};
