"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { useFavoritesStore } from "@/lib/store/favorites-store";
import { useCartStore } from "@/lib/store/cart-store";

function formatPrice(v: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(v);
}

export default function FavoritesPage() {
  const { items, loading, loadFavorites, removeFavorite } = useFavoritesStore();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  async function moveToCart(productId: string) {
    await addItem(productId, 99);
    await removeFavorite(productId);
  }

  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-extrabold text-[#111827]">
          Favorilerim
          {items.length > 0 && <span className="ml-2 text-base font-normal text-[#6B7280]">({items.length})</span>}
        </h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 animate-pulse rounded-xl bg-[#F3F4F6]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Heart className="size-14 text-[#D1D5DB]" />
            <p className="text-lg font-bold text-[#111827]">Favoriniz yok</p>
            <p className="text-sm text-[#6B7280]">Ürün sayfalarındaki kalp ikonuyla favorilerinize ekleyebilirsiniz.</p>
            <Link href="/" className="rounded-xl bg-[#FF6000] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#E65700]">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
                <Link href={`/product/${item.productId}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#F9FAFB]">
                  <Image src={item.image} alt={item.title} fill sizes="80px" className="object-contain p-2" />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/product/${item.productId}`} className="line-clamp-2 text-sm font-semibold text-[#111827] hover:text-[#FF6000]">
                      {item.title}
                    </Link>
                    <button onClick={() => removeFavorite(item.productId)} className="shrink-0 text-[#9CA3AF] hover:text-red-500 transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#FF6000]">{formatPrice(item.price)}</span>
                    <button
                      onClick={() => moveToCart(item.productId)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#FF6000] px-3 py-2 text-xs font-bold text-white hover:bg-[#E65700] transition-colors"
                    >
                      <ShoppingCart className="size-3.5" />
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
