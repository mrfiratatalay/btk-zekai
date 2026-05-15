import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Heart, Search, ShoppingCart, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryStrip } from "@/components/mock-shop/CategoryStrip";

export function ShopHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      {/* Zekai promo bar */}
      <div className="bg-[#0a0a0f] py-2 px-6 text-center text-xs text-white/60">
        Satın almadan önce bilinçli karar ver —{" "}
        <Link href="/platform" className="font-semibold text-[#adff41] hover:underline">
          Zekai ile Pişmanlık Riskini analiz et →
        </Link>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-6 py-4">
        <div className="grid items-center gap-4 md:grid-cols-[220px_minmax(320px,1fr)_auto]">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Zekai&apos;ye dön
            </Link>
            <div className="h-4 w-px bg-[#E5E7EB]" />
            <Link href="/mock-shop" className="flex shrink-0 items-center gap-1">
              <span className="text-xl font-extrabold tracking-tight text-[#111827]">
                ZekAI
              </span>
              <span className="text-xl font-extrabold tracking-tight text-[#FF6000]">
                Market
              </span>
            </Link>
          </div>

          <div className="relative order-last md:order-none">
            <Input
              className="h-12 rounded-xl border-[#D1D5DB] bg-white pr-14 pl-4 text-[15px] shadow-none focus-visible:border-[#FF6000] focus-visible:ring-[#FF6000]/20"
              placeholder="Ürün, kategori veya marka ara"
            />
            <Button
              size="icon"
              className="absolute right-0 top-0 h-12 w-14 rounded-l-none rounded-r-xl bg-[#FF6000] text-white hover:bg-[#E65700]"
              aria-label="Ara"
            >
              <Search className="size-5" />
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" className="h-11 gap-2 rounded-xl px-3 font-semibold text-[#111827]">
              <UserRound className="size-5" />
              <span className="hidden lg:inline">Hesabım</span>
            </Button>
            <Button variant="ghost" className="h-11 gap-2 rounded-xl px-3 font-semibold text-[#111827]">
              <Heart className="size-5" />
              <span className="hidden lg:inline">Favorilerim</span>
            </Button>
            <Button variant="ghost" className="relative h-11 gap-2 rounded-xl px-3 font-semibold text-[#111827]">
              <ShoppingCart className="size-5" />
              <span className="hidden lg:inline">Sepetim</span>
              <span className="absolute -right-0.5 top-0 flex size-5 items-center justify-center rounded-full bg-[#FF6000] text-[11px] font-bold text-white">
                0
              </span>
            </Button>
          </div>
        </div>
      </div>
      <Suspense fallback={<div className="h-10 border-t border-[#E5E7EB]" />}>
        <CategoryStrip />
      </Suspense>
    </header>
  );
}
