export type AnalysisId = string;

export type AnalysisStatus = "queued" | "running" | "completed" | "failed";
export type RecommendationLevel = "safe" | "caution" | "risky";
export type AgentStepStatus = "pending" | "active" | "completed";
export type AgentStepType =
  | "need"
  | "product"
  | "review"
  | "visual"
  | "price"
  | "return"
  | "synthesis"
  | "verification"
  | "report";

export type BuyerAnalysisSummary = {
  id: AnalysisId;
  productId: string;
  fitScore: number;
  trustScore: number;
  priceScore: number;
  returnRiskPercent: number;
};

export type AgentStep = {
  id: string;
  label: string;
  description: string;
  status: AgentStepStatus;
  summary: string;
  durationMs: number;
  type: AgentStepType;
};

export type ScoreSummary = {
  fitScore: number;
  trustScore: number;
  priceScore: number;
  returnRiskPercent: number;
};

export type FitSubScore = {
  label: string;
  score: number;
  reason: string;
};

export type TrustSignal = {
  title: string;
  value: string;
  description: string;
  tone: "warning" | "danger" | "success";
};

export type MarketComparison = {
  label: string;
  value: string;
};

export type PricePoint = {
  day: string;
  price: number;
  median: number;
};

export type ReturnReason = {
  label: string;
  percent: number;
};

export type AlternativeProduct = {
  title: string;
  fitScore: number;
  price: string;
};

export type BuyerAnalysis = {
  analysisId: AnalysisId;
  productId: string;
  userNeedText: string;
  overallRiskPercent: number;
  recommendationLevel: RecommendationLevel;
  recommendationText: string;
  scores: ScoreSummary;
  agentSteps: AgentStep[];
  fitAnalysis: {
    title: string;
    summary: string;
    subScores: FitSubScore[];
    scenarioComparisons: Array<{
      scenario: string;
      score: number;
    }>;
  };
  trustAnalysis: {
    title: string;
    summary: string;
    signals: TrustSignal[];
  };
  priceAnalysis: {
    title: string;
    summary: string;
    warning: string;
    marketComparison: MarketComparison[];
    priceHistory: PricePoint[];
  };
  returnRiskAnalysis: {
    title: string;
    summary: string;
    reasons: ReturnReason[];
    personalWarning: string;
  };
  finalAdvice: string;
  alternatives: AlternativeProduct[];
};
