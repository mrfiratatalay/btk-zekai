import { create } from "zustand";

export type AppMode = "buyer" | "seller" | "arbiter";

type UiState = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
};

export const useUiStore = create<UiState>((set) => ({
  mode: "buyer",
  setMode: (mode) => set({ mode }),
}));
