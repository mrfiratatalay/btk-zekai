"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  GitCompare,
  ShieldCheck,
  Star,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSavedAnalyses,
  getCompareQueue,
  removeFromCompareQueue,
  clearCompareQueue,
} from "@/lib/buyer-store";
import { notifyStoreUpdate } from "@/components/platform/PlatformNav";
import { compareAnalyses } from "@/lib/compare-engine";
import type { SavedAnalysis } from "@/types/analysis";
import type { CompareResult } from "@/lib/compare-engine";
import { PlatformNav } from "@/components/platform/PlatformNav";
import { Button } from "@/components/ui/button";

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
  }
} as const;

/* ─── Score bar ──────────────────────────────────────────────────────────── */
function ScoreBar({
  value,
  max = 100,
  color,
}: {
  value: number;
  max?: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
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
}: {
  analysis: SavedAnalysis;
  row: CompareResult["table"][number] | null;
  onRemove: (id: string) => void;
  isPending?: boolean;
}) {
  const verdict = (isPending || !row) ? VERDICT_CONFIG["pending"] : VERDICT_CONFIG[row.verdict];
  const lv = LEVEL[analysis.recommendationLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[32px] border-2 bg-card/80 backdrop-blur-3xl shadow-sm transition-all hover:shadow-xl",
        row?.verdict === "best"
          ? "border-[#adff41]/50 shadow-[#adff41]/10 z-10 scale-[1.02]"
          : "border-border/30"
      )}
    >
      {/* Verdict banner */}
      <div className={cn("px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-wider", verdict.bg, verdict.text)}>
        {verdict.label}
      </div>

      {/* Product info */}
      <div className="flex-1 p-6 flex flex-col items-center">
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
        <p className="mt-2 text-center text-lg font-black tracking-tight">{analysis.productPrice}</p>

        <div className="mt-3 flex justify-center">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shadow-inner", lv.chip)}>
            <span className={cn("size-1.5 rounded-full", lv.dot)} />
            %{analysis.overallRiskPercent} Risk
          </span>
        </div>
      </div>

      {/* Scores */}
      <div className="space-y-4 border-t border-border/50 px-6 py-6 bg-muted/10">
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
      <div className="flex items-center justify-between border-t border-border/50 px-6 py-4 bg-muted/20">
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
  const [queue, setQueue] = useState<string[]>([]);
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [needText, setNeedText] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const q = getCompareQueue();
    const all = getSavedAnalyses();
    setQueue(q);
    const items = q.map((id) => all.find((a) => a.id === id)).filter(Boolean) as SavedAnalysis[];
    setAnalyses(items);
    if (items.length >= 2) {
      setResult(compareAnalyses(items, ""));
    }
    setMounted(true);

    function refresh() {
      const q2 = getCompareQueue();
      const all2 = getSavedAnalyses();
      setQueue(q2);
      const items2 = q2.map((id) => all2.find((a) => a.id === id)).filter(Boolean) as SavedAnalysis[];
      setAnalyses(items2);
      if (items2.length >= 2) setResult(compareAnalyses(items2, needText));
    }
    window.addEventListener("zekai-store-update", refresh);
    return () => window.removeEventListener("zekai-store-update", refresh);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRemove(id: string) {
    removeFromCompareQueue(id);
    const q = getCompareQueue();
    const all = getSavedAnalyses();
    setQueue(q);
    const items = q.map((i) => all.find((a) => a.id === i)).filter(Boolean) as SavedAnalysis[];
    setAnalyses(items);
    if (items.length >= 2) setResult(compareAnalyses(items, needText));
    else setResult(null);
    notifyStoreUpdate();
  }

  function handleCompare() {
    if (analyses.length < 2) return;
    setResult(compareAnalyses(analyses, needText));
  }

  function handleClear() {
    clearCompareQueue();
    setQueue([]);
    setAnalyses([]);
    setResult(null);
    notifyStoreUpdate();
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b border-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PlatformNav />

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {queue.length > 0 && (
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
        {queue.length === 0 && (
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

        {/* Columns */}
        {analyses.length > 0 && (
          <>
            {/* Winner banner */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mb-10 overflow-hidden rounded-[32px] border border-[#adff41]/40 bg-gradient-to-r from-[#adff41]/5 via-background to-background shadow-lg shadow-[#adff41]/5 p-1"
                >
                  <div className="flex items-start md:items-center gap-4 rounded-[28px] bg-background/80 backdrop-blur-md p-6">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#adff41] shadow-inner shadow-white/20">
                      <Star className="size-6 text-[#0a0a0f] fill-[#0a0a0f]" />
                    </div>
                    <div>
                      <p className="text-lg font-black tracking-tight text-foreground">
                        Zekai Kararı
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-3xl">
                        {result.reasoning}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product columns */}
            <div className="overflow-x-auto pb-4">
              <div
                className={cn(
                  "grid gap-4 min-w-[600px] md:min-w-0",
                  analyses.length === 1
                    ? "grid-cols-1 max-w-xs"
                    : analyses.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
                )}
              >
                {analyses.map((analysis) => {
                  const row = result?.table.find((r) => r.id === analysis.id);
                  if (!row) {
                    return (
                      <ProductColumn
                        key={analysis.id}
                        analysis={analysis}
                        row={null}
                        onRemove={handleRemove}
                        isPending={true}
                      />
                    );
                  }
                  return (
                    <ProductColumn
                      key={analysis.id}
                      analysis={analysis}
                      row={row}
                      onRemove={handleRemove}
                    />
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
