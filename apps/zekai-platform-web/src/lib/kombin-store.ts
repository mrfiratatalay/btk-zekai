import { create } from "zustand";
import type { KombinGoal, KombinProduct, KombinAnalysisResult, KombinScores } from "@/types/kombin";

type KombinState = {
  step: 1 | 2 | 3;
  goal: KombinGoal;
  products: KombinProduct[];
  analysisResult: KombinAnalysisResult | null;
  isAnalyzing: boolean;
  liveScores: KombinScores | null;
};

type KombinActions = {
  setGoal: (goal: KombinGoal) => void;
  addProduct: (product: KombinProduct) => void;
  removeProduct: (id: string) => void;
  setBodyZone: (id: string, zone: KombinProduct["bodyZone"]) => void;
  nextStep: () => void;
  prevStep: () => void;
  setAnalysisResult: (result: KombinAnalysisResult) => void;
  setLiveScores: (scores: KombinScores) => void;
  setIsAnalyzing: (v: boolean) => void;
  reset: () => void;
};

const DEFAULT_GOAL: KombinGoal = {
  goalText: "",
  budget: 3000,
  useCases: [],
  priorities: [],
  style: [],
};

export const useKombinStore = create<KombinState & KombinActions>((set) => ({
  step: 1,
  goal: DEFAULT_GOAL,
  products: [],
  analysisResult: null,
  isAnalyzing: false,
  liveScores: null,

  setGoal: (goal) => set({ goal }),

  addProduct: (product) =>
    set((s) => {
      if (s.products.find((p) => p.id === product.id)) return s;
      return { products: [...s.products, product] };
    }),

  removeProduct: (id) =>
    set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

  setBodyZone: (id, zone) =>
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, bodyZone: zone } : p)),
    })),

  nextStep: () =>
    set((s) => ({ step: Math.min(3, s.step + 1) as 1 | 2 | 3 })),

  prevStep: () =>
    set((s) => ({ step: Math.max(1, s.step - 1) as 1 | 2 | 3 })),

  setAnalysisResult: (result) => set({ analysisResult: result, isAnalyzing: false }),

  setLiveScores: (scores) => set({ liveScores: scores }),

  setIsAnalyzing: (v) => set({ isAnalyzing: v }),

  reset: () =>
    set({
      step: 1,
      goal: DEFAULT_GOAL,
      products: [],
      analysisResult: null,
      isAnalyzing: false,
      liveScores: null,
    }),
}));
