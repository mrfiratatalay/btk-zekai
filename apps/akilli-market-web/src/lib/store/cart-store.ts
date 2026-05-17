import { create } from "zustand";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCartApi,
  type CartItem,
} from "@/lib/api/buyer";

interface CartState {
  items: CartItem[];
  loading: boolean;
  loadCart: () => Promise<void>;
  addItem: (productId: string, stock: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQty: (itemId: number, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  loading: false,

  loadCart: async () => {
    set({ loading: true });
    try {
      const cart = await getCart();
      set({ items: cart.items });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (productId, stock) => {
    // optimistic: geçici olarak quantity artır
    set((s) => {
      const existing = s.items.find((i) => i.productId === productId);
      if (existing) {
        return {
          items: s.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(i.quantity + 1, stock) }
              : i
          ),
        };
      }
      return s;
    });
    const item = await addToCart(productId, 1);
    // sunucudan gelen gerçek item ile güncelle
    set((s) => {
      const exists = s.items.find((i) => i.id === item.id || i.productId === item.productId);
      if (exists) {
        return { items: s.items.map((i) => (i.productId === item.productId ? item : i)) };
      }
      return { items: [...s.items, item] };
    });
  },

  removeItem: async (itemId) => {
    set((s) => ({ items: s.items.filter((i) => i.id !== itemId) }));
    await removeFromCart(itemId);
  },

  updateQty: async (itemId, qty) => {
    if (qty <= 0) {
      await get().removeItem(itemId);
      return;
    }
    set((s) => ({
      items: s.items.map((i) => (i.id === itemId ? { ...i, quantity: qty } : i)),
    }));
    await updateCartItem(itemId, qty);
  },

  clearCart: async () => {
    set({ items: [] });
    await clearCartApi();
  },
}));

export const cartItemCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0);

export const cartTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);
