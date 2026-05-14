export type SellerId = string;

export type SellerProductStatus = "urgent" | "watch" | "healthy";

export type SellerStoreSummary = {
  id: SellerId;
  storeName: string;
  ownerName: string;
  status: string;
  trustScore: number;
  totalSales30d: number;
  activeProducts: number;
  returnRate: number;
  industryReturnRate: number;
  estimatedLostProfit: number;
  pendingActions: number;
  urgentProducts: number;
};

export type SellerProductPerformance = {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  stock: number;
  sales30d: number;
  returnRate: number;
  conversionRate: number;
  aiRiskScore: number;
  lostProfitMonthly: number;
  status: SellerProductStatus;
  mainIssue: string;
  lastAction: string;
  updatedAt: string;
};

export type SellerKpi = {
  label: string;
  value: string;
  note: string;
  tone: "neutral" | "warning" | "danger" | "success";
};

export type SellerActionItem = {
  id: string;
  title: string;
  description: string;
  impact: string;
  priority: SellerProductStatus;
};

export type SyntheticPersonaDecision = "buy" | "skip" | "undecided";

export type SyntheticPersona = {
  id: string;
  name: string;
  age: number;
  segment: string;
  decision: SyntheticPersonaDecision;
  reason: string;
  caresAbout: string;
  profile: string;
  lookedAt: string[];
  recommendation: string;
  monologue: string;
  city: string;
};

export type SellerReturnReason = {
  id: string;
  label: string;
  percent: number;
  sampleComplaint: string;
  rootCause: string;
  solution: string;
  expectedImpact: string;
};

export type SellerImprovement = {
  id: string;
  title: string;
  currentState: string;
  suggestedChange: string;
  rationale: string;
  expectedImpact: string;
  priority: SellerProductStatus;
};
