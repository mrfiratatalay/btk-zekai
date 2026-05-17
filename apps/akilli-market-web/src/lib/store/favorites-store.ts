import { create } from "zustand";
import {
  getFavorites,
  addFavoriteApi,
  removeFavoriteApi,
  type FavoriteItem,
} from "@/lib/api/buyer";

interface FavoritesState {
  items: FavoriteItem[];
  loading: boolean;
  loadFavorites: () => Promise<void>;
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  items: [],
  loading: false,

  loadFavorites: async () => {
    set({ loading: true });
    try {
      const items = await getFavorites();
      set({ items });
    } finally {
      set({ loading: false });
    }
  },

  addFavorite: async (productId) => {
    await addFavoriteApi(productId);
    await get().loadFavorites();
  },

  removeFavorite: async (productId) => {
    set((s) => ({ items: s.items.filter((i) => i.productId !== productId) }));
    await removeFavoriteApi(productId);
  },

  isFavorite: (productId) =>
    get().items.some((i) => i.productId === productId),

  toggleFavorite: async (productId) => {
    if (get().isFavorite(productId)) {
      await get().removeFavorite(productId);
    } else {
      await get().addFavorite(productId);
    }
  },
}));

export const favoritesCount = (items: FavoriteItem[]) => items.length;
