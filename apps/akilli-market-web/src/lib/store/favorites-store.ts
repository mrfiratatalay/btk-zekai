import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FavoriteItem {
  productId: string;
  title: string;
  price: number;
  image: string;
}

interface FavoritesState {
  items: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      addFavorite: (item) =>
        set((s) => {
          if (s.items.find((i) => i.productId === item.productId)) return s;
          return { items: [...s.items, item] };
        }),
      removeFavorite: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      isFavorite: (productId) => !!get().items.find((i) => i.productId === productId),
      toggleFavorite: (item) => {
        const state = get();
        if (state.isFavorite(item.productId)) {
          state.removeFavorite(item.productId);
        } else {
          state.addFavorite(item);
        }
      },
    }),
    { name: "market-favorites" }
  )
);

export const favoritesCount = (items: FavoriteItem[]) => items.length;
