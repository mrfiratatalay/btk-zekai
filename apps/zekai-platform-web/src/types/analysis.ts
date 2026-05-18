export type AnalysisId = string;

export type AnalysisStatus = "queued" | "running" | "completed" | "failed";
export type RecommendationLevel = "safe" | "caution" | "risky";
export type AgentStepStatus = "pending" | "active" | "completed";
export type AgentStepType =
  | "need"
  | "product"
  | "review"
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

// ── Buyer Decision Center types ──────────────────────────────────────────────

export type SavedAnalysisStatus =
  | "thinking"       // Düşünüyorum
  | "comparing"      // Karşılaştırıyorum
  | "waiting"        // Fiyat bekleniyor
  | "bought"         // Satın Aldım
  | "passed";        // Vazgeçtim

export type SavedAnalysis = {
  id: string;                        // analysisId'den kopyalanır
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: string;              // formatlanmış TRY
  sellerName: string;
  userNeedText: string;
  overallRiskPercent: number;
  recommendationLevel: "safe" | "caution" | "risky";
  scores: ScoreSummary;
  savedAt: string;                   // ISO datetime
  status: SavedAnalysisStatus;
  userNote?: string;
  projectId?: string;                // bağlı Karar Odası id'si
};

export type ShoppingProject = {
  id: string;
  title: string;                     // "Yeni Laptop Alacağım"
  goal: string;                      // "Yazılım, okul, hafif oyun"
  budget?: number;                   // TRY cinsinden
  createdAt: string;                 // ISO datetime
  savedAnalysisIds: string[];        // SavedAnalysis id referansları
};

export type BuyerProfile = {
  name: string;
  onboarded: boolean;
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
  };
  finalAdvice: string;
};
