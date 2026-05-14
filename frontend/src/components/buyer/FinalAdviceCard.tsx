"use client";

import Link from "next/link";
import { ArrowLeft, Gauge, ShoppingCart, Target, Undo2 } from "lucide-react";
import { toast } from "sonner";
import type { BuyerAnalysis } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FinalAdviceCard({ analysis }: { analysis: BuyerAnalysis }) {
  return (
    <>
      <div className="h-[220px] md:h-[112px]" />
      <div className="fixed inset-x-3 bottom-3 z-40 md:inset-x-6 md:bottom-4">
        <Card className="mx-auto max-w-[1180px] overflow-hidden rounded-xl border-[#E5E7EB] bg-white/95 shadow-[0_14px_44px_rgba(15,23,42,0.16)] backdrop-blur">
          <CardContent className="grid gap-3 p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#F5F3FF] px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-[#5B2EFF]">
                  Tavsiye
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#FCA5A5] bg-[#FEF2F2] px-2.5 py-1 text-xs font-bold text-[#991B1B]">
                  <Gauge className="size-3.5" />
                  Risk %{analysis.overallRiskPercent}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#FECACA] bg-white px-2.5 py-1 text-xs font-bold text-[#7F1D1D]">
                  <Undo2 className="size-3.5" />
                  İade %{analysis.scores.returnRiskPercent}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 max-w-3xl text-sm font-bold leading-5 text-[#111827] md:text-base">
                {analysis.finalAdvice}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] md:min-w-[520px]">
              <Button
                className="h-10 rounded-lg bg-gradient-to-r from-[#5B2EFF] to-[#2563EB] px-3 text-sm font-bold text-white hover:from-[#4C1FDC] hover:to-[#1D4ED8]"
                onClick={() =>
                  toast.info("Alternatif ürün karşılaştırması sonraki turda açılacak.")
                }
              >
                <Target className="size-4" />
                <span className="truncate">Bana Uygun Alternatifleri Göster</span>
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-lg border-[#E5E7EB] bg-white px-3 text-sm font-semibold"
                onClick={() =>
                  toast.info("Ürün sepete eklendi.")
                }
              >
                <ShoppingCart className="size-4" />
                <span className="truncate">Yine de Bu Ürünü Al</span>
              </Button>
              <Button asChild variant="ghost" className="h-10 rounded-lg px-3 text-sm font-semibold">
                <Link href={`/shop/product/${analysis.productId}`}>
                  <ArrowLeft className="size-4" />
                  <span className="hidden truncate lg:inline">Ürüne Geri Dön</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
