"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingCart, Target } from "lucide-react";
import { toast } from "sonner";
import type { BuyerAnalysis } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FinalAdviceCard({ analysis }: { analysis: BuyerAnalysis }) {
  return (
    <Card className="overflow-hidden rounded-2xl border-[#DDD6FE] bg-white shadow-sm">
      <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-wide text-[#5B2EFF]">
            Benim tavsiyem
          </p>
          <h2 className="max-w-4xl text-2xl font-extrabold leading-tight text-[#111827]">
            {analysis.finalAdvice}
          </h2>
        </div>

        <div className="grid min-w-72 gap-3">
          <Button
            className="h-11 rounded-lg bg-gradient-to-r from-[#5B2EFF] to-[#2563EB] font-bold text-white hover:from-[#4C1FDC] hover:to-[#1D4ED8]"
            onClick={() =>
              toast.info("Alternatif ürün karşılaştırması sonraki turda açılacak.")
            }
          >
            <Target className="size-4" />
            Bana Uygun Alternatifleri Göster
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-lg border-[#E5E7EB] bg-white font-semibold"
            onClick={() =>
              toast.info("Ürün sepete eklendi.")
            }
          >
            <ShoppingCart className="size-4" />
            Yine de Bu Ürünü Al
          </Button>
          <Button asChild variant="ghost" className="h-11 rounded-lg font-semibold">
            <Link href="/shop/product/bluetooth-kulaklik-pro-x1">
              <ArrowLeft className="size-4" />
              Ürüne Geri Dön
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
