"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Heart, Search } from "lucide-react";
import { CategoryStrip } from "@/components/shop/CategoryStrip";
import { AccountButton } from "@/components/shop/AccountButton";
import { CartButton } from "@/components/shop/CartButton";
import { useFavoritesStore, favoritesCount } from "@/lib/store/favorites-store";

function FavoritesButton() {
  const items = useFavoritesStore((s) => s.items);
  const count = favoritesCount(items);

  return (
    <Link
      href="/favorites"
      className="relative flex cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm font-semibold text-[#374151] transition-colors hover:border-[#FF6000] hover:text-[#FF6000]"
    >
      <Heart className="size-4" />
      <span className="hidden lg:inline">Favoriler</span>
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1 flex size-5 items-center justify-center rounded-full bg-[#FF6000] text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export function ShopHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-4">
          {/* Logo — sıra 1 */}
          <Link href="/" className="order-1 shrink-0">
            <span className="text-xl font-extrabold tracking-tight text-[#111827]">Akıllı</span>
            <span className="text-xl font-extrabold tracking-tight text-[#FF6000]">Market</span>
          </Link>

          {/* Sağ butonlar — mobilde logo yanında (sıra 2, ml-auto), masaüstünde sona (sm:order-3) */}
          <div className="order-2 ml-auto flex shrink-0 items-center gap-1.5 sm:order-3 sm:ml-0">
            <FavoritesButton />
            <CartButton />
            <AccountButton />
          </div>

          {/* Arama — mobilde tam genişlik ikinci satır (sıra 3), masaüstünde orta (sm:order-2) */}
          <div className="relative order-3 w-full min-w-0 sm:order-2 sm:flex-1 sm:w-auto">
            <input
              suppressHydrationWarning
              className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white pl-4 pr-14 text-sm outline-none focus:border-[#FF6000]"
              placeholder="Ürün ara..."
            />
            <button
              suppressHydrationWarning
              className="absolute right-0 top-0 flex h-11 w-12 cursor-pointer items-center justify-center rounded-r-xl bg-[#FF6000] text-white transition-colors hover:bg-[#E65700]"
              aria-label="Ara"
            >
              <Search className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="h-10 border-t border-[#E5E7EB]" />}>
        <CategoryStrip />
      </Suspense>
    </header>
  );
}
