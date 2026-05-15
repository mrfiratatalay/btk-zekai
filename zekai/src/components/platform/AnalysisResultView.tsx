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
    <li className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <Icon className={cn("size-4 shrink-0", iconCls)} />
      <span className="text-sm text-foreground">{text}</span>
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
      <div className="flex items-center gap-3 border-b border-border bg-card/80 px-6 py-3 backdrop-blur-sm">
        {product && (
          <div className="relative size-9 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
            <Image src={product.image} alt={product.title} fill sizes="36px" className="object-contain p-1.5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{product?.title ?? analysis.productId}</p>
          <p className="text-xs text-muted-foreground">{product?.sellerName}</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground">
          <Link href={`/mock-shop/product/${analysis.productId}`}>
            <ArrowLeft className="size-4" /> Ürüne dön
          </Link>
        </Button>
      </div>

      {/* ── Verdict card — nötr arka plan, renk sadece chip+sayı+bar ──── */}
      <div className="border-b border-border bg-card px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_260px]">

            {/* Sol */}
            <div className="space-y-5">
              {/* Sadece chip renkli */}
              <span className={cn("inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold", lv.chip)}>
                <span className={cn("size-2 rounded-full", lv.dot)} />
                {lv.label}
              </span>

              <h2 className="text-2xl font-bold leading-snug text-foreground md:text-3xl">
                {analysis.finalAdvice}
              </h2>
              <p className="text-sm text-muted-foreground">{lv.desc}</p>

              {/* Sinyal listesi — nötr kart */}
              <ul className="rounded-2xl border border-border bg-background px-5">
                {signals.map((s, i) => (
                  <SignalRow key={i} {...s} />
                ))}
              </ul>
            </div>

            {/* Sağ — risk gauge, nötr kart */}
            <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-border bg-background p-8 text-center">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Pişmanlık Riski</p>
                {/* Renk sadece burada */}
                <p className={cn("text-6xl font-black tabular-nums leading-none", lv.num)}>
                  %{pct}
                </p>
              </div>

              {/* Bar — renk sadece fill'de */}
              <div className="w-full space-y-1.5">
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <motion.div
                    className={cn("h-full rounded-full", lv.bar)}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Düşük</span>
                  <span>Orta</span>
                  <span>Yüksek</span>
                </div>
              </div>

              {product && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating.toFixed(1)} · {product.reviewCount.toLocaleString("tr-TR")} yorum</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="fit">
        <div className="sticky top-0 z-30 border-b border-border bg-background/95 px-6 py-3 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl">
            <TabsList className="inline-flex h-10 gap-1 rounded-xl border border-border bg-muted p-1">
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
                    className="flex items-center gap-1.5 rounded-lg px-4 text-xs font-semibold text-muted-foreground transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    <span className={`size-1.5 rounded-full ${dot}`} />
                    {t.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-10">
          <TabsContent value="fit"    className="mt-0"><FitTab    analysis={analysis} /></TabsContent>
          <TabsContent value="trust"  className="mt-0"><TrustTab  analysis={analysis} /></TabsContent>
          <TabsContent value="price"  className="mt-0"><PriceTab  analysis={analysis} /></TabsContent>
          <TabsContent value="return" className="mt-0"><ReturnRiskTab analysis={analysis} /></TabsContent>
        </div>

        <div className="sticky bottom-0 z-30 border-t border-border bg-background/95 px-6 py-3.5 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-end gap-2">
            <Button asChild size="sm" className="rounded-xl bg-[#ADFF41] font-semibold text-black hover:bg-[#9AE635]">
              <Link href={`/platform?productId=${analysis.productId}`}>
                <Zap className="mr-1.5 size-3.5" />
                Yeniden Analiz
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border font-semibold text-foreground hover:bg-muted"
              onClick={() => toast.info("Ürün sepete eklendi.")}
            >
              <ShoppingCart className="mr-1.5 size-3.5" />
              Yine de Al
            </Button>
          </div>
        </div>
      </Tabs>
    </motion.div>
  );
}
