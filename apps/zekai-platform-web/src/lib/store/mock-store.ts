import { create } from "zustand";

interface MockState {
  isMockMode: boolean;
  toastShown: boolean;
  triggerMockMode: () => void;
  markToastShown: () => void;
}

export const useMockStore = create<MockState>((set, get) => ({
  isMockMode: false,
  toastShown: false,
  triggerMockMode: () => {
    if (!get().isMockMode) set({ isMockMode: true });
  },
  markToastShown: () => set({ toastShown: true }),
}));
