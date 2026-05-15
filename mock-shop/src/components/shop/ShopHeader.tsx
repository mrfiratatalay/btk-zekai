import Link from "next/link";
import { Suspense } from "react";
import { Heart, Search, ShoppingCart, UserRound } from "lucide-react";
import { CategoryStrip } from "@/components/shop/CategoryStrip";

export function ShopHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <div className="bg-[#0a0a0f] py-2 px-6 text-center text-xs text-white/60">
        Satın almadan önce bilinçli karar ver —{" "}
        <a href="http://localhost:3001/platform" className="font-semibold text-[#ADFF41] hover:underline">
          Zekai ile Pişmanlık Riskini analiz et →
        </a>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-6 py-4">
        <div className="grid items-center gap-4 md:grid-cols-[220px_minmax(320px,1fr)_auto]">
          <Link href="/" className="flex shrink-0 items-center gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-[#111827]">ZekAI</span>
            <span className="text-2xl font-extrabold tracking-tight text-[#FF6000]">Market</span>
          </Link>
          <div className="relative order-last md:order-none">
            <input className="h-12 w-full rounded-xl border border-[#D1D5DB] bg-white pl-4 pr-14 text-sm outline-none focus:border-[#FF6000]" placeholder="Ürün ara..." />
            <button className="absolute right-0 top-0 flex h-12 w-14 items-center justify-center rounded-r-xl bg-[#FF6000] text-white hover:bg-[#E65700]" aria-label="Ara">
              <Search className="size-5" />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6]">
              <UserRound className="size-5" /><span className="hidden lg:inline">Hesabım</span>
            </button>
            <button className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6]">
              <Heart className="size-5" /><span className="hidden lg:inline">Favoriler</span>
            </button>
            <button className="relative flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6]">
              <ShoppingCart className="size-5" /><span className="hidden lg:inline">Sepetim</span>
              <span className="absolute -right-0.5 top-0 flex size-5 items-center justify-center rounded-full bg-[#FF6000] text-[11px] font-bold text-white">0</span>
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
