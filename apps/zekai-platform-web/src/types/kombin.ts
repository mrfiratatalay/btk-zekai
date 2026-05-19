export type BodyZone = "head" | "wrist" | "feet" | "back" | "torso" | "hands";

export type KombinProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  bodyZone?: BodyZone;
  analysisId?: string;
};

export type KombinGoal = {
  goalText: string;
  budget: number;
  useCases: string[];
  priorities: string[];
  style: string[];
};

export type KombinScores = {
  overall: number;
  needFit: number;
  partFit: number;
  budgetBalance: number;
  risk: number;
};

export type ProductRole = "ana" | "tamamlayici" | "opsiyonel";

export type KombinProductResult = {
  productId: string;
  role: ProductRole;
  fitScore: number;
  riskScore: number;
  aiComment: string;
  pairsWellWith: string[];
};

export type KombinSuggestion = {
  title: string;
  price: number;
  reason: string;
};

export type KombinAnalysisResult = {
  decision?: "al" | "dusun" | "alma";
  cached?: boolean;
  scores: KombinScores;
  headline: string;
  summary: string;
  productResults: KombinProductResult[];
  missingPiece?: string;
  warningItem?: string;
  purchaseOrder: string[];
  suggestions: KombinSuggestion[];
};

export type KombinAnalyzeRequest = {
  goal: string;
  budget: number;
  useCases: string[];
  priorities: string[];
  style: string[];
  products: Array<{
    id: string;
    title: string;
    category: string;
    price: number;
    imageUrl?: string;
  }>;
};

export type SavedKombin = {
  id: string;
  title: string;
  goalText: string;
  budget?: number;
  products: KombinProduct[];
  result: KombinAnalysisResult;
  createdAt: string;
};
