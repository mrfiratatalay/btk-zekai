"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  GitCompare,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Trash2,
  XCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { useAnalysesStore, useCompareStore } from "@/lib/buyer-store";
import { compareAnalyses } from "@/lib/compare-engine";
import type { SavedAnalysis } from "@/types/analysis";
import type { CompareResult } from "@/lib/compare-engine";
import { PlatformNav } from "@/components/platform/PlatformNav";
import { Button } from "@/components/ui/button";
import {
  streamCompareVerdict,
  type CompareVerdictResultApi,
  type CompareProductVerdictApi,
} from "@/lib/api/buyer";

const LEVEL = {
  safe: {
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    dot: "bg-emerald-500",
    icon: ShieldCheck,
  },
  caution: {
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    dot: "bg-amber-500",
    icon: AlertTriangle,
  },
  risky: {
    chip: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
    dot: "bg-red-500",
    icon: XCircle,
  },
} as const;

const VERDICT_CONFIG = {
  best: {
    label: "⭐ En İyi",
    bg: "bg-[#adff41]/10 border-[#adff41]/30",
    text: "text-[#5a8a00] dark:text-[#adff41]",
  },
  ok: {
    label: "✓ Alternatif",
    bg: "bg-muted/60 border-border",
    text: "text-muted-foreground",
  },
  risky: {
    label: "⬇ En Zayıf Aday",
    bg: "bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30",
    text: "text-red-600 dark:text-red-400",
  },
  pending: {
    label: "⏳ Rakip Bekliyor",
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
  },
} as const;

function triggerConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.55 },
    colors: ["#adff41", "#ffffff", "#5a8a00"],
  });
}

/* ─── Score bar ──────────────────────────────────────────────────────────── */
function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="w-8 text-right text-xs font-bold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

/* ─── Product column card ────────────────────────────────────────────────── */
function ProductColumn({
  analysis,
  row,
  onRemove,
  isPending,
  aiProductVerdict,
}: {
  analysis: SavedAnalysis;
  row: CompareResult["table"][number] | null;
  onRemove: (id: string) => void;
  isPending?: boolean;
  aiProductVerdict?: CompareProductVerdictApi;
}) {
  const isAiBest = aiProductVerdict?.relative_fit === "best";
  const isAiSkip = aiProductVerdict?.relative_fit === "skip";

  const verdictKey = aiProductVerdict
    ? isAiBest ? "best" : isAiSkip ? "risky" : "ok"
    : (isPending || !row) ? "pending" : row.verdict;

  const verdict = VERDICT_CONFIG[verdictKey];
  const lv = LEVEL[analysis.recommendationLevel];

  const cardBorder = isAiBest
    ? "border-[#adff41]/50 shadow-[#adff41]/10 z-10 scale-[1.02]"
    : isAiSkip
    ? "border-red-300/50 dark:border-red-500/30"
    : !aiProductVerdict && row?.verdict === "best"
    ? "border-[#adff41]/50 shadow-[#adff41]/10 z-10 scale-[1.02]"
    : "border-border/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl sm:rounded-[32px] border-2 bg-card/80 backdrop-blur-3xl shadow-sm transition-all hover:shadow-xl",
        cardBorder,
      )}
    >
      {/* Verdict banner */}
      <div className={cn("px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-wider", verdict.bg, verdict.text)}>
        {verdict.label}
      </div>

      {/* Product info */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col items-center">
        <div className="relative mb-5 w-full aspect-[4/3] max-w-[160px] mx-auto overflow-hidden rounded-2xl bg-muted/20">
          <Image
            src={analysis.productImage}
            alt={analysis.productTitle}
            fill
            sizes="160px"
            className="object-contain p-4 mix-blend-multiply dark:mix-blend-normal hover:scale-105 transition-transform duration-500"
          />
        </div>
        <p className="line-clamp-2 text-center text-sm font-bold text-foreground leading-snug">
          {analysis.productTitle}
        </p>
        {aiProductVerdict?.one_line_reason && (
          <p className="mt-1.5 px-1 text-center text-[11px] text-muted-foreground leading-snug italic">
            {aiProductVerdict.one_line_reason}
          </p>
        )}
        <p className="mt-2 text-center text-lg font-black tracking-tight">{analysis.productPrice}</p>

        <div className="mt-3 flex justify-center">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shadow-inner", lv.chip)}>
            <span className={cn("size-1.5 rounded-full", lv.dot)} />
            %{analysis.overallRiskPercent} Risk
          </span>
        </div>
      </div>

      {/* Scores */}
      <div className="space-y-4 border-t border-border/50 px-4 py-4 sm:px-6 sm:py-6 bg-muted/10">
        {row ? (
          <>
            <div>
              <p className="mb-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Uygunluk</p>
              <ScoreBar value={row.fitScore} color="bg-[#adff41]" />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Güven</p>
              <ScoreBar value={row.trustScore} color="bg-blue-500" />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Fiyat Skoru</p>
              <ScoreBar value={row.priceScore} color="bg-purple-500" />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">İade Güveni</p>
              <ScoreBar value={100 - row.returnRiskPercent} color="bg-emerald-500" />
            </div>
            <div className="border-t border-border/50 pt-4 mt-2">
              <p className="mb-1.5 text-xs font-black text-foreground uppercase tracking-wide">Zekai Skoru</p>
              <ScoreBar value={row.compositeScore} color="bg-foreground" />
            </div>
          </>
        ) : (
          <p className="text-center text-xs text-muted-foreground py-4">
            Karşılaştırma bekleniyor...
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 sm:px-6 sm:py-4 bg-muted/20">
        <Link
          href={`/platform/analysis/${analysis.id}`}
          className="rounded-full bg-background border border-border px-4 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted transition-colors"
        >
          Raporu Gör
        </Link>
        <button
          onClick={() => onRemove(analysis.id)}
          className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all"
          aria-label="Kuyruğu çıkar"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export function CompareView() {
  const compareIds = useCompareStore((s) => s.ids);
  const removeFromCompare = useCompareStore((s) => s.remove);
  const clearCompare = useCompareStore((s) => s.clear);
  const allAnalyses = useAnalysesStore((s) => s.analyses);

  const [comparisonNeed, setComparisonNeed] = useState("");
  const [aiVerdict, setAiVerdict] = useState<CompareVerdictResultApi | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  const analyses = compareIds
    .map((id) => allAnalyses.find((a) => a.id === id))
    .filter(Boolean) as SavedAnalysis[];

  const result = analyses.length >= 2
    ? compareAnalyses(analyses, "")
    : null;

  const handleCompare = useCallback(async () => {
    if (analyses.length < 2 || !comparisonNeed.trim() || isComparing) return;
    setIsComparing(true);
    setAiVerdict(null);
    setCompareError(null);

    try {
      await streamCompareVerdict(
        {
          comparisonNeed: comparisonNeed.trim(),
          analyses: analyses.map((a) => ({
            productId: a.productId,
            productTitle: a.productTitle,
            productCategory: "",
            productPrice: parseFloat(a.productPrice.replace(/[^0-9.,]/g, "").replace(",", ".")) || 0,
            userNeedText: a.userNeedText,
            fitScore: a.scores.fitScore,
            trustScore: a.scores.trustScore,
            priceScore: a.scores.priceScore,
            returnRiskPercent: a.scores.returnRiskPercent,
          })),
        },
        (event) => {
          const verdict = event.actions?.state_delta?.compare_verdict as CompareVerdictResultApi | undefined;
          if (verdict?.winner_id) {
            setAiVerdict(verdict);
            const hasWinner = verdict.product_verdicts.some(
              (pv: CompareProductVerdictApi) => pv.relative_fit === "best",
            );
            if (hasWinner) triggerConfetti();
          }
        },
      );
    } catch (err) {
      setCompareError(err instanceof Error ? err.message : "Karşılaştırma başarısız oldu.");
    } finally {
      setIsComparing(false);
    }
  }, [analyses, comparisonNeed, isComparing]);

  function handleRemove(id: string) {
    removeFromCompare(id);
    setAiVerdict(null);
  }

  function handleClear() {
    clearCompare();
    setAiVerdict(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <PlatformNav />

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {compareIds.length > 0 && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleClear}
              className="cursor-pointer text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors"
            >
              Listeyi Temizle
            </button>
          </div>
        )}

        {/* Empty state */}
        {compareIds.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
            <GitCompare className="mx-auto mb-3 size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Karşılaştırma kuyruğu boş.</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Kaydedilen analizlerden ürün ekle.
            </p>
            <Link
              href="/platform/saved"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#adff41]/30 bg-[#adff41]/10 px-4 py-2 text-xs font-semibold text-[#5a8a00] dark:text-[#adff41] hover:bg-[#adff41]/20 transition-colors"
            >
              Kaydedilenlere Git
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        )}

        {analyses.length > 0 && (
          <>
            {/* AI Compare input */}
            <div className="mb-6 rounded-2xl border border-border/50 bg-card/60 p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                type="text"
                value={comparisonNeed}
                onChange={(e) => setComparisonNeed(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                placeholder="Ne için karşılaştırıyorsunuz? (örn. kampüste günlük kullanım)"
                disabled={isComparing}
                className="flex-1 rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#adff41]/50 disabled:opacity-50"
              />
              <Button
                onClick={handleCompare}
                disabled={analyses.length < 2 || !comparisonNeed.trim() || isComparing}
                className="cursor-pointer shrink-0 rounded-xl bg-[#adff41] text-[#0a0a0f] font-bold hover:bg-[#adff41]/90 disabled:opacity-50 flex items-center gap-2"
              >
                {isComparing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Karşılaştırılıyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    ZekAI Karşılaştır
                  </>
                )}
              </Button>
            </div>

            {/* Error */}
            {compareError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30 px-4 py-3 text-sm text-red-600 dark:text-red-400"
              >
                <XCircle className="size-4 shrink-0" />
                {compareError}
              </motion.div>
            )}

            {/* AI Verdict banner */}
            <AnimatePresence>
              {aiVerdict && (
                <motion.div
                  key="ai-verdict"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mb-8 overflow-hidden rounded-[32px] border border-[#adff41]/40 bg-gradient-to-r from-[#adff41]/5 via-background to-background shadow-lg shadow-[#adff41]/5 p-1"
                >
                  <div className="rounded-[28px] bg-background/80 backdrop-blur-md p-4 sm:p-6 space-y-3">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex size-10 sm:size-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-[#adff41] shadow-inner shadow-white/20">
                        <Trophy className="size-5 sm:size-6 text-[#0a0a0f]" />
                      </div>
                      <div>
                        <p className="text-base sm:text-lg font-black tracking-tight text-foreground">
                          {aiVerdict.headline}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-3xl">
                          {aiVerdict.winner_reason}
                        </p>
                      </div>
                    </div>
                    {aiVerdict.caution && (
                      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        {aiVerdict.caution}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product columns */}
            <div className="overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
              <div
                className={cn(
                  "grid gap-4 md:min-w-0",
                  analyses.length === 1
                    ? "grid-cols-1 max-w-xs"
                    : analyses.length === 2
                    ? "grid-cols-2 min-w-[640px] md:min-w-0"
                    : "grid-cols-3 min-w-[860px] md:min-w-0",
                )}
              >
                {analyses.map((analysis) => {
                  const row = result?.table.find((r) => r.id === analysis.id);
                  const aiPv = aiVerdict?.product_verdicts.find(
                    (pv) => pv.product_id === analysis.productId,
                  );
                  return (
                    <div key={analysis.id} className="snap-start">
                      <ProductColumn
                        analysis={analysis}
                        row={row ?? null}
                        onRemove={handleRemove}
                        isPending={!row}
                        aiProductVerdict={aiPv}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add more CTA */}
            {analyses.length < 3 && (
              <div className="mt-4 text-center">
                <Link
                  href="/platform/saved"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/20 px-5 py-3 text-xs text-muted-foreground hover:border-[#adff41]/30 hover:text-[#5a8a00] dark:hover:text-[#adff41] transition-colors"
                >
                  <GitCompare className="size-3.5" />
                  + Ürün Ekle ({3 - analyses.length} daha ekleyebilirsin)
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
