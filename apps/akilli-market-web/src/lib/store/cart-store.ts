import { create } from "zustand";
import {
  getCart,
  addToCart,
  addBundleToCart,
  updateCartItem,
  updateCartBundle,
  removeFromCart,
  removeBundleFromCart,
  clearCartApi,
  type CartItem,
} from "@/lib/api/buyer";

interface CartState {
  items: CartItem[];
  loading: boolean;
  loadCart: () => Promise<void>;
  addItem: (productId: string, stock: number) => Promise<void>;
  addBundle: (bundleId: string) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  removeBundle: (bundleId: string) => Promise<void>;
  updateQty: (itemId: number, qty: number) => Promise<void>;
  updateBundleQty: (bundleId: string, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export interface CartLine {
  id: string;
  kind: "item" | "bundle";
  itemId?: number;
  productId?: string;
  bundleId?: string;
  title: string;
  image: string;
  quantity: number;
  stock: number;
  price: number;
  originalPrice: number;
  discountAmount: number;
  productTitles: string[];
}

function mergeItems(current: CartItem[], incoming: CartItem[]) {
  const map = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) map.set(item.id, item);
  return Array.from(map.values());
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
    const currentItems = useCartStore.getState().items;
    const bundleItem = currentItems.find((i) => i.productId === productId && i.bundleId);
    const standaloneItem = currentItems.find((i) => i.productId === productId && !i.bundleId);

    if (standaloneItem) {
      set((s) => ({
        items: s.items.map((i) =>
          i.productId === productId && !i.bundleId
            ? { ...i, quantity: Math.min(i.quantity + 1, stock) }
            : i
        ),
      }));
      const item = await addToCart(productId, 1);
      set((s) => ({ items: mergeItems(s.items, [item]) }));
      return;
    }

    if (bundleItem) {
      const newQty = Math.min(bundleItem.quantity + 1, stock);
      const updated = await updateCartBundle(bundleItem.bundleId!, newQty);
      set((s) => ({ items: mergeItems(s.items, updated) }));
      return;
    }

    const item = await addToCart(productId, 1);
    set((s) => ({ items: mergeItems(s.items, [item]) }));
  },

  addBundle: async (bundleId) => {
    const items = await addBundleToCart(bundleId, 1);
    set((s) => ({ items: mergeItems(s.items, items) }));
  },

  removeItem: async (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    if (item?.bundleId) {
      await get().removeBundle(item.bundleId);
      return;
    }
    set((s) => ({ items: s.items.filter((i) => i.id !== itemId) }));
    await removeFromCart(itemId);
  },

  removeBundle: async (bundleId) => {
    set((s) => ({ items: s.items.filter((i) => i.bundleId !== bundleId) }));
    await removeBundleFromCart(bundleId);
  },

  updateQty: async (itemId, qty) => {
    const item = get().items.find((i) => i.id === itemId);
    if (item?.bundleId) {
      await get().updateBundleQty(item.bundleId, qty);
      return;
    }
    if (qty <= 0) {
      await get().removeItem(itemId);
      return;
    }
    set((s) => ({ items: s.items.map((i) => (i.id === itemId ? { ...i, quantity: qty } : i)) }));
    const updated = await updateCartItem(itemId, qty);
    set((s) => ({ items: mergeItems(s.items, [updated]) }));
  },

  updateBundleQty: async (bundleId, qty) => {
    if (qty <= 0) {
      await get().removeBundle(bundleId);
      return;
    }
    set((s) => ({ items: s.items.map((i) => (i.bundleId === bundleId ? { ...i, quantity: qty } : i)) }));
    const updated = await updateCartBundle(bundleId, qty);
    set((s) => ({ items: mergeItems(s.items, updated) }));
  },

  clearCart: async () => {
    set({ items: [] });
    await clearCartApi();
  },
}));

export const cartItemCount = (items: CartItem[]) =>
  groupCartLines(items).reduce((sum, line) => sum + line.quantity, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.originalPrice * i.quantity, 0);

export const cartDiscountTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.discountAmount * i.quantity, 0);

export const cartPayableTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const cartTotal = cartPayableTotal;

export function groupCartLines(items: CartItem[]): CartLine[] {
  const lines: CartLine[] = [];
  const bundleMap = new Map<string, CartItem[]>();

  for (const item of items) {
    if (!item.bundleId) {
      lines.push({
        id: `item:${item.id}`,
        kind: "item",
        itemId: item.id,
        productId: item.productId,
        title: item.title,
        image: item.image,
        quantity: item.quantity,
        stock: item.stock,
        price: item.price,
        originalPrice: item.originalPrice,
        discountAmount: item.discountAmount,
        productTitles: [item.title],
      });
      continue;
    }

    const grouped = bundleMap.get(item.bundleId) ?? [];
    grouped.push(item);
    bundleMap.set(item.bundleId, grouped);
  }

  for (const [bundleId, bundleItems] of bundleMap) {
    const quantity = bundleItems[0]?.quantity ?? 1;
    lines.push({
      id: `bundle:${bundleId}`,
      kind: "bundle",
      bundleId,
      title: bundleItems[0]?.bundleTitle ?? "Paket",
      image: bundleItems[0]?.image ?? "",
      quantity,
      stock: Math.min(...bundleItems.map((item) => item.stock)),
      price: bundleItems.reduce((sum, item) => sum + item.price, 0),
      originalPrice: bundleItems.reduce((sum, item) => sum + item.originalPrice, 0),
      discountAmount: bundleItems.reduce((sum, item) => sum + item.discountAmount, 0),
      productTitles: bundleItems.map((item) => item.title),
    });
  }

  return lines;
}
