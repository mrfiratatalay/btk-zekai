export type DisputeId = string;

export type DisputeStatus =
  | "open"
  | "arbiter_running"
  | "resolved"
  | "escalated";

export type ArbiterDecision = {
  disputeId: DisputeId;
  buyerRightPercent: number;
  sellerRightPercent: number;
  recommendedResolution: string;
};
