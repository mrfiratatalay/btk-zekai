"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Heart, Search } from "lucide-react";
import { CategoryStrip } from "@/components/shop/CategoryStrip";
import { AccountButton } from "@/components/shop/AccountButton";
import { CartButton } from "@/components/shop/CartButton";

export function ShopHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-6 py-4">
        <div className="grid items-center gap-4 md:grid-cols-[220px_minmax(320px,1fr)_auto]">
          <Link href="/" className="flex shrink-0 items-center gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-[#111827]">Akıllı</span>
            <span className="text-2xl font-extrabold tracking-tight text-[#FF6000]">Market</span>
          </Link>
          <div className="relative order-last md:order-none">
            <input className="h-12 w-full rounded-xl border border-[#D1D5DB] bg-white pl-4 pr-14 text-sm outline-none focus:border-[#FF6000]" placeholder="Ürün ara..." />
            <button className="absolute right-0 top-0 flex h-12 w-14 items-center justify-center rounded-r-xl bg-[#FF6000] text-white hover:bg-[#E65700]" aria-label="Ara">
              <Search className="size-5" />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <AccountButton />
            <button className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6]">
              <Heart className="size-5" /><span className="hidden lg:inline">Favoriler</span>
            </button>
            <CartButton />
          </div>
        </div>
      </div>
      <Suspense fallback={<div className="h-10 border-t border-[#E5E7EB]" />}>
        <CategoryStrip />
      </Suspense>
    </header>
  );
}
