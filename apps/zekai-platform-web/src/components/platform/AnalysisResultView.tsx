"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ShoppingCart,
  Star,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { BuyerAnalysis } from "@/types/analysis";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FitTab }        from "@/components/platform/FitTab";
import { PriceTab }      from "@/components/platform/PriceTab";
import { ReturnRiskTab } from "@/components/platform/ReturnRiskTab";
import { TrustTab }      from "@/components/platform/TrustTab";
import { cn } from "@/lib/utils";
import { AnalysisSaveBar } from "@/components/platform/AnalysisSaveBar";
import { AskReportBox } from "@/components/platform/AskReportBox";

/* ─────────────────────────────────────────────────────────────────────────
   Her level için renk 3 yerde: chip bg/text · büyük sayı · bar fill.
   Başka hiçbir yerde renk yok.
───────────────────────────────────────────────────────────────────────── */
const LEVEL = {
  safe: {
    label:   "Alabilirsin",
    desc:    "Uygunluk, güven ve fiyat sinyalleri ihtiyacınla örtüşüyor.",
    chip:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    dot:     "bg-emerald-500",
    num:     "text-emerald-700 dark:text-emerald-400",
    bar:     "bg-emerald-500",
  },
  caution: {
    label:   "Dikkatli ilerle",
    desc:    "Satın almadan önce aşağıdaki sekmeleri mutlaka incele.",
    chip:    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    dot:     "bg-amber-500",
    num:     "text-amber-700 dark:text-amber-400",
    bar:     "bg-amber-500",
  },
  risky: {
    label:   "Alternatife bak",
    desc:    "Bu ürün ihtiyacınla örtüşmüyor. Daha iyi alternatifler var.",
    chip:    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    dot:     "bg-red-500",
    num:     "text-red-700 dark:text-red-400",
    bar:     "bg-red-500",
  },
} as const;

/* ── Sinyal — sadece icon renkli, bg/text nötr ───────────────────────── */
type Tone = "ok" | "warn" | "bad";

function SignalRow({ tone, text }: { tone: Tone; text: string }) {
  const Icon    = tone === "ok" ? CheckCircle2 : tone === "warn" ? AlertTriangle : XCircle;
  const iconCls = tone === "ok" ? "text-emerald-500" : tone === "warn" ? "text-amber-500" : "text-red-500";
  return (
    <li className="flex items-start gap-3">
      <Icon className={cn("size-5 mt-0.5 shrink-0", iconCls)} />
      <span className="text-sm font-medium text-foreground leading-relaxed">{text}</span>
    </li>
  );
}

function buildSignals(a: BuyerAnalysis): { tone: Tone; text: string }[] {
  const { fitScore, trustScore, priceScore, returnRiskPercent } = a.scores;
  return [
    fitScore >= 65      ? { tone: "ok",   text: "İhtiyacınla uyumlu" }
    : fitScore >= 40    ? { tone: "warn", text: "Kısmen uyumlu" }
    :                     { tone: "bad",  text: "İhtiyacınla örtüşmüyor" },

    trustScore >= 65    ? { tone: "ok",   text: "Satıcı güvenilir" }
    : trustScore >= 40  ? { tone: "warn", text: "Bazı şüpheli yorumlar var" }
    :                     { tone: "bad",  text: "Güven sinyali zayıf" },

    priceScore >= 65    ? { tone: "ok",   text: "Fiyat piyasayla uyumlu" }
    : priceScore >= 40  ? { tone: "warn", text: "Fiyat biraz yüksek" }
    :                     { tone: "bad",  text: "Fiyat piyasanın üstünde" },

    returnRiskPercent < 20  ? { tone: "ok",   text: "İade riski düşük" }
    : returnRiskPercent < 40 ? { tone: "warn", text: "Orta düzeyde iade riski" }
    :                          { tone: "bad",  text: "İade riski yüksek" },
  ];
}

/* ── Main ──────────────────────────────────────────────────────────────── */
export function AnalysisResultView({
  analysis, product,
}: {
  analysis: BuyerAnalysis; product?: Product;
}) {
  const lv      = LEVEL[analysis.recommendationLevel];
  const signals = buildSignals(analysis);
  const pct     = Math.min(100, analysis.overallRiskPercent);
  const { fitScore, trustScore, priceScore, returnRiskPercent } = analysis.scores;

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          {product && (
            <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-background shadow-inner">
              <Image src={product.image} alt={product.title} fill sizes="40px" className="object-contain p-1.5 mix-blend-multiply dark:mix-blend-normal" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">{product?.title ?? analysis.productId}</p>
            <p className="text-xs text-muted-foreground">{product?.sellerName}</p>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5 rounded-full border-border/50 font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Link href={`/mock-shop/product/${analysis.productId}`}>
              <ArrowLeft className="size-4" /> Ürüne Dön
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Hero Section (Compact & Premium) ──── */}
      <div className="bg-background pb-10 pt-8 border-b border-border/40">
        <div className="mx-auto max-w-3xl px-6">
          
          <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12">
            
            {/* Sol: Risk Göstergesi (Circular Gauge) */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative flex size-32 items-center justify-center">
                <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" className="stroke-muted" strokeWidth="8" />
                  <motion.circle 
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                    className={lv.num.split(" ")[0]}
                    strokeDasharray="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * pct) / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="text-center flex flex-col items-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Risk</span>
                  <span className={cn("text-3xl font-black tabular-nums tracking-tighter leading-none", lv.num)}>%{pct}</span>
                </div>
              </div>
              <span className={cn("mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm", lv.chip)}>
                 <span className={cn("size-2 rounded-full", lv.dot)} />
                 {lv.label}
              </span>
            </div>

            {/* Sağ: Başlık ve Sinyaller */}
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-snug">
                {analysis.finalAdvice}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {lv.desc}
              </p>
              
              <div className="mt-8 rounded-2xl bg-muted/30 p-5 border border-border/50">
                <ul className="space-y-4">
                  {signals.map((s, i) => (
                    <SignalRow key={i} {...s} />
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="fit" className="w-full">
        <div className="sticky top-[73px] z-30 border-b border-border/40 bg-background/95 px-6 py-3 backdrop-blur-md">
          <div className="mx-auto max-w-4xl">
            <TabsList className="flex h-12 w-full max-w-[500px] mx-auto items-center justify-between rounded-full bg-muted p-1">
              {([
                { v: "fit",    label: "Uygunluk", score: fitScore,           inv: false },
                { v: "trust",  label: "Güven",    score: trustScore,          inv: false },
                { v: "price",  label: "Fiyat",    score: priceScore,          inv: false },
                { v: "return", label: "İade",      score: returnRiskPercent,  inv: true  },
              ] as const).map((t) => {
                const v = t.inv ? 100 - t.score : t.score;
                const dot = v >= 65 ? "bg-emerald-500" : v >= 40 ? "bg-amber-500" : "bg-red-500";
                return (
                  <TabsTrigger
                    key={t.v}
                    value={t.v}
                    className="flex-1 rounded-full text-xs font-bold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <span className={`size-1.5 rounded-full ${dot} mr-1.5 hidden sm:inline-block`} />
                    {t.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-10 pb-20">
          <TabsContent value="fit"    className="mt-0"><FitTab    analysis={analysis} /></TabsContent>
          <TabsContent value="trust"  className="mt-0"><TrustTab  analysis={analysis} /></TabsContent>
          <TabsContent value="price"  className="mt-0"><PriceTab  analysis={analysis} /></TabsContent>
          <TabsContent value="return" className="mt-0"><ReturnRiskTab analysis={analysis} /></TabsContent>

          <AskReportBox />
        </div>

        {/* Bottom Actions */}
        <div className="sticky bottom-0 z-40 border-t border-border/40 bg-background/95 px-6 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
            <AnalysisSaveBar analysis={analysis} product={product!} />
            <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90 shrink-0 font-bold px-8 h-12 shadow-lg transition-transform hover:scale-105">
              <Link href={`/platform?productId=${analysis.productId}`}>
                <Zap className="mr-2 size-4" />
                Yeniden Analiz Et
              </Link>
            </Button>
          </div>
        </div>

      </Tabs>
    </motion.div>
  );
}
