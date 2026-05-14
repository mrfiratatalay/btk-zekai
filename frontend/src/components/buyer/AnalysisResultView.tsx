"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import type { BuyerAnalysis } from "@/types/analysis";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FitTab }        from "@/components/buyer/FitTab";
import { PriceTab }      from "@/components/buyer/PriceTab";
import { ReturnRiskTab } from "@/components/buyer/ReturnRiskTab";
import { TrustTab }      from "@/components/buyer/TrustTab";
import { cn } from "@/lib/utils";

/* ─── Verdict config ─────────────────────────────────────────────────────── */
const LEVEL = {
  safe: {
    heading: "Alabilirsin",
    sub: "Uygunluk, güven ve fiyat sinyalleri genel olarak olumlu.",
    bg: "bg-emerald-50", border: "border-emerald-100",
    num: "text-emerald-900", dot: "bg-emerald-500",
    sub2: "text-emerald-700",
  },
  caution: {
    heading: "Dikkatli ilerle",
    sub: "Satın almadan önce aşağıdaki sekmeleri incele.",
    bg: "bg-amber-50", border: "border-amber-100",
    num: "text-amber-900", dot: "bg-amber-500",
    sub2: "text-amber-700",
  },
  risky: {
    heading: "Alternatife bak",
    sub: "Bu ürün senin senaryona uymuyor. Daha iyi seçenekler var.",
    bg: "bg-red-50", border: "border-red-100",
    num: "text-red-900", dot: "bg-red-500",
    sub2: "text-red-700",
  },
} as const;

/* ─── Score colour (for tabs) ────────────────────────────────────────────── */
function sc(n: number, inv = false) {
  const v = inv ? 100 - n : n;
  if (v >= 65) return "text-emerald-600";
  if (v >= 40) return "text-amber-500";
  return "text-red-500";
}

/* ─────────────────────────────────────────────────────────────────────────── */

export function AnalysisResultView({ analysis, product }: {
  analysis: BuyerAnalysis; product?: Product;
}) {
  const lv  = LEVEL[analysis.recommendationLevel];
  const alt = `/shop/alternatives/${analysis.productId}?need=${encodeURIComponent(analysis.userNeedText ?? "")}`;
  const { fitScore, trustScore, priceScore, returnRiskPercent } = analysis.scores;

  return (
    <motion.div className="min-h-screen bg-white"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        {product && (
          <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-slate-100">
            <Image src={product.image} alt={product.title} fill sizes="36px" className="object-contain p-1"/>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{product?.title ?? analysis.productId}</p>
          <p className="text-xs text-slate-400">{product?.sellerName} · Karar analizi</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0 text-slate-400 hover:text-slate-700">
          <Link href={`/shop/product/${analysis.productId}`}>
            <ArrowLeft className="size-4"/> Ürüne dön
          </Link>
        </Button>
      </div>

      {/* ── Verdict banner ────────────────────────────────────────────── */}
      <div className={cn("border-b px-6 py-8", lv.bg, lv.border)}>
        <div className="mx-auto flex max-w-4xl items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", lv.dot)}/>
              <p className={cn("text-sm font-semibold", lv.sub2)}>{lv.heading}</p>
            </div>
            <p className={cn("text-3xl font-bold tracking-tight", lv.num)}>
              {analysis.finalAdvice}
            </p>
            <p className={cn("text-sm", lv.sub2)}>{lv.sub}</p>
            {analysis.userNeedText && (
              <p className="pt-1 text-xs italic text-slate-400">&quot;{analysis.userNeedText}&quot;</p>
            )}
          </div>
          {/* Risk % — shown ONCE, here only */}
          <div className="shrink-0 text-right">
            <p className={cn("text-5xl font-black tabular-nums leading-none", lv.num)}>
              %{analysis.overallRiskPercent}
            </p>
            <p className={cn("mt-1 text-xs font-medium", lv.sub2)}>pişmanlık riski</p>
          </div>
        </div>
      </div>

      {/* ── Score tabs — sticky ───────────────────────────────────────── */}
      <Tabs defaultValue="fit">
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm">
          <TabsList className="mx-auto grid h-auto max-w-4xl grid-cols-4 gap-0 rounded-none border-0 bg-transparent px-6 py-0">
            {([
              { v:"fit",    label:"Uygunluk", num:`${fitScore}`,          unit:"/100", inv:false },
              { v:"trust",  label:"Güven",    num:`${trustScore}`,         unit:"/100", inv:false },
              { v:"price",  label:"Fiyat",    num:`${priceScore}`,         unit:"/100", inv:false },
              { v:"return", label:"İade",     num:`${returnRiskPercent}`,  unit:"%",    inv:true  },
            ] as const).map((t, i) => (
              <TabsTrigger key={t.v} value={t.v}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-0.5 rounded-none border-b-2 border-transparent bg-transparent",
                  "text-slate-400 transition-colors hover:text-slate-700",
                  "data-[state=active]:border-slate-900 data-[state=active]:text-slate-900",
                  i < 3 && "border-r border-slate-100",
                )}>
                <span className={cn("text-xl font-bold tabular-nums leading-tight", sc(Number(t.num), t.inv))}>
                  {t.inv ? `%${t.num}` : t.num}
                </span>
                <span className="text-[11px] font-medium">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="border-b border-slate-100"/>
        </div>

        {/* Tab content */}
        <div className="mx-auto max-w-4xl px-6 py-10">
          <TabsContent value="fit"    className="mt-0"><FitTab analysis={analysis}/></TabsContent>
          <TabsContent value="trust"  className="mt-0"><TrustTab analysis={analysis}/></TabsContent>
          <TabsContent value="price"  className="mt-0"><PriceTab analysis={analysis}/></TabsContent>
          <TabsContent value="return" className="mt-0"><ReturnRiskTab analysis={analysis}/></TabsContent>
        </div>

        {/* ── Sticky action bar ─────────────────────────────────────── */}
        <div className="sticky bottom-0 z-30 border-t border-slate-100 bg-white/95 px-6 py-3.5 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-end gap-2">
            <Button asChild size="sm"
              className="rounded-lg bg-slate-900 font-medium text-white hover:bg-slate-700">
              <Link href={alt}><Zap className="size-3.5"/>Alternatifleri Göster</Link>
            </Button>
            <Button variant="outline" size="sm"
              className="rounded-lg border-slate-200 font-medium text-slate-600 hover:bg-slate-50"
              onClick={() => toast.info("Ürün sepete eklendi.")}>
              <ShoppingCart className="size-3.5"/>Yine de Al
            </Button>
          </div>
        </div>
      </Tabs>
    </motion.div>
  );
}
