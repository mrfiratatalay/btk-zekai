"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart-store";
import { useFavoritesStore } from "@/lib/store/favorites-store";
import { getCurrentUser } from "@/lib/api/auth";

export function StoreInitializer() {
  const loadCart = useCartStore((s) => s.loadCart);
  const loadFavorites = useFavoritesStore((s) => s.loadFavorites);

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.role === "Buyer") {
      loadCart();
      loadFavorites();
    }
  }, [loadCart, loadFavorites]);

  return null;
}
