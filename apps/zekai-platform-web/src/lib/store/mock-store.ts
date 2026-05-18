import { create } from "zustand";

interface MockState {
  isMockMode: boolean;
  toastShown: boolean;
  triggerMockMode: () => void;
  resetMockMode: () => void;
  markToastShown: () => void;
}

export const useMockStore = create<MockState>((set, get) => ({
  isMockMode: false,
  toastShown: false,
  triggerMockMode: () => {
    if (!get().isMockMode) set({ isMockMode: true });
  },
  resetMockMode: () => set({ isMockMode: false, toastShown: false }),
  markToastShown: () => set({ toastShown: true }),
}));
