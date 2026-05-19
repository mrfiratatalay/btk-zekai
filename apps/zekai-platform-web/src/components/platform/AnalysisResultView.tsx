"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";
import type { BuyerAnalysis } from "@/types/analysis";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FitTab }        from "@/components/platform/FitTab";
import { PriceTab }      from "@/components/platform/PriceTab";
import { TrustTab }      from "@/components/platform/TrustTab";
import { cn } from "@/lib/utils";
import { AnalysisSaveBar } from "@/components/platform/AnalysisSaveBar";
import { useMockStore } from "@/lib/store/mock-store";

const COMMERCE_WEB_URL = process.env.NEXT_PUBLIC_COMMERCE_WEB_URL ?? "http://localhost:3000";

/* Karar başına tek renk paleti — tek kaynak. */
const LEVEL = {
  safe: {
    label: "ALABİLİRSİN",
    chip:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    dot:   "bg-emerald-500",
    num:   "text-emerald-700 dark:text-emerald-400",
    ring:  "text-emerald-500",
  },
  caution: {
    label: "DİKKATLİ İLERLE",
    chip:  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    dot:   "bg-amber-500",
    num:   "text-amber-700 dark:text-amber-400",
    ring:  "text-amber-500",
  },
  risky: {
    label: "ALTERNATİFE BAK",
    chip:  "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    dot:   "bg-red-500",
    num:   "text-red-700 dark:text-red-400",
    ring:  "text-red-500",
  },
} as const;

type Tone = "ok" | "warn" | "bad";

function ReasonRow({ tone, text }: { tone: Tone; text: string }) {
  const Icon    = tone === "ok" ? CheckCircle2 : tone === "warn" ? AlertTriangle : XCircle;
  const iconCls = tone === "ok" ? "text-emerald-500" : tone === "warn" ? "text-amber-500" : "text-red-500";
  return (
    <li className="flex items-start gap-3">
      <Icon className={cn("size-5 mt-0.5 shrink-0", iconCls)} />
      <span className="text-sm font-medium text-foreground leading-relaxed">{text}</span>
    </li>
  );
}

/** Nedenler: ajanın verdict gerekçeleri; yoksa skor eşiğinden türetilen 3 madde. */
function buildReasons(a: BuyerAnalysis): { tone: Tone; text: string }[] {
  if (a.verdict?.reasons?.length) {
    return a.verdict.reasons.slice(0, 4).map((r) => ({ tone: r.icon as Tone, text: r.text }));
  }
  const { fitScore, trustScore, priceScore } = a.scores;
  return [
    fitScore >= 65   ? { tone: "ok",   text: "İhtiyacınla uyumlu" }
    : fitScore >= 40 ? { tone: "warn", text: "İhtiyacınla kısmen uyumlu" }
    :                  { tone: "bad",  text: "İhtiyacınla örtüşmüyor" },

    trustScore >= 65   ? { tone: "ok",   text: "Güven sinyalleri yeterli" }
    : trustScore >= 40 ? { tone: "warn", text: "Bazı güven soruları mevcut" }
    :                    { tone: "bad",  text: "Güven sinyali zayıf" },

    priceScore >= 65   ? { tone: "ok",   text: "Fiyat piyasayla uyumlu" }
    : priceScore >= 40 ? { tone: "warn", text: "Fiyat piyasanın biraz üstünde" }
    :                    { tone: "bad",  text: "Fiyat piyasanın belirgin üstünde" },
  ];
}

/* ── Main ──────────────────────────────────────────────────────────────── */
export function AnalysisResultView({
  analysis, product,
}: {
  analysis: BuyerAnalysis; product?: Product;
}) {
  const lv      = LEVEL[analysis.recommendationLevel];
  const reasons = buildReasons(analysis);
  const pct     = Math.min(100, analysis.overallRiskPercent);
  const { fitScore, trustScore, priceScore } = analysis.scores;
  const isMockMode = useMockStore((s) => s.isMockMode);
  const alternatives = analysis.alternatives ?? [];

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {isMockMode && (
        <div className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-3.5 shrink-0" />
          Demo modu — AI kapasitesi geçici olarak doldu. Bu analiz gerçek Gemini verisi değil.
        </div>
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
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
            <Link href={`${COMMERCE_WEB_URL}/product/${analysis.productId}`}>
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Ürüne Dön</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">

        {/* ── 1. TEK KARAR ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-center pt-12 pb-10 text-center">
          {/* Risk halkası */}
          <div className="hidden">
            <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" className="stroke-muted" strokeWidth="7" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"
                className={lv.ring}
                strokeDasharray="283"
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * pct) / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pişmanlık Riski</span>
              <span className={cn("text-4xl font-black tabular-nums leading-none", lv.num)}>%{pct}</span>
            </div>
          </div>

          {/* Büyük karar */}
          <h1 className={cn(
            "inline-flex items-center gap-2 rounded-full px-5 py-2 text-lg font-black tracking-wide shadow-sm sm:text-xl",
            lv.chip,
          )}>
            <span className={cn("size-2.5 rounded-full", lv.dot)} />
            {lv.label}
          </h1>

          {/* Tek cümle özet */}
          <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-foreground sm:text-lg">
            {analysis.finalAdvice}
          </p>

        </div>

        {/* ── 2. NEDENLER ───────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border/50 bg-muted/30 p-5 sm:p-6">
          <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
            Neden bu sonuç?
          </h2>
          <ul className="space-y-4">
            {reasons.map((r, i) => (
              <ReasonRow key={i} {...r} />
            ))}
          </ul>
        </div>

        {/* ── 3. ALTERNATİFLER ──────────────────────────────────────────── */}
        {alternatives.length > 0 && (
          <div className="mt-6 rounded-2xl border border-[#adff41]/30 bg-[#adff41]/5 p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-4 text-[#5a8a00] dark:text-[#adff41]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                Daha iyi alternatifler
              </h2>
              <span className="ml-auto text-xs font-bold text-muted-foreground">
                {alternatives.length} öneri · Google
              </span>
            </div>
            <ul className="space-y-3">
              {alternatives.slice(0, 3).map((alt, i) => (
                <li key={i} className="rounded-xl border border-border/50 bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{alt.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {alt.approx_price > 0 && (
                          <span className="font-bold text-foreground tabular-nums">~₺{Math.round(alt.approx_price)}</span>
                        )}
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          alt.confidence === "high" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                          alt.confidence === "medium" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                          alt.confidence === "low" && "bg-muted text-muted-foreground",
                        )}>
                          {alt.confidence === "high" ? "Yüksek güven" : alt.confidence === "medium" ? "Orta güven" : "Düşük güven"}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{alt.why_better_fit}</p>
                      {alt.trade_offs && (
                        <p className="mt-1 text-xs text-muted-foreground/70"><span className="font-semibold">Eksisi:</span> {alt.trade_offs}</p>
                      )}
                    </div>
                    {alt.source_url && (
                      <a
                        href={alt.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex cursor-pointer shrink-0 items-center gap-1 rounded-full border border-border/50 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors"
                      >
                        Gör <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── 4. DETAYLI İNCELEME (katlanır) ─────────────────────────────── */}
        <details className="group mt-6 rounded-2xl border border-border/50 bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 sm:px-6">
            <span className="text-sm font-bold text-foreground">
              Detaylı inceleme — Uygunluk · Güven · Fiyat
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>

          <div className="border-t border-border/50 px-2 pb-6 pt-2 sm:px-4">
            <Tabs defaultValue="fit" className="w-full">
              <TabsList className="my-4 flex h-11 w-full items-center justify-between rounded-full bg-muted p-1 sm:max-w-[460px]">
                {([
                  { v: "fit",   label: "Uygunluk", score: fitScore   },
                  { v: "trust", label: "Güven",    score: trustScore },
                  { v: "price", label: "Fiyat",    score: priceScore },
                ] as const).map((t) => {
                  const dot = t.score >= 65 ? "bg-emerald-500" : t.score >= 40 ? "bg-amber-500" : "bg-red-500";
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

              <div className="px-3 pb-2">
                <TabsContent value="fit"   className="mt-0"><FitTab   analysis={analysis} /></TabsContent>
                <TabsContent value="trust" className="mt-0"><TrustTab analysis={analysis} /></TabsContent>
                <TabsContent value="price" className="mt-0"><PriceTab analysis={analysis} /></TabsContent>
              </div>
            </Tabs>
          </div>
        </details>

        <div className="h-28" />
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 z-40 border-t border-border/40 bg-background/95 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 sm:gap-4">
          <AnalysisSaveBar analysis={analysis} product={product!} />
          <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90 shrink-0 font-bold h-11 px-4 sm:px-8 sm:h-12 shadow-lg transition-transform hover:scale-105">
            <Link href={`/platform?productId=${analysis.productId}`}>
              <Zap className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Yeniden Analiz Et</span>
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
