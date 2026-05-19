"use client";

import { motion } from "framer-motion";
import {
  Star,
  ShieldCheck,
  Scale,
  Puzzle,
  Heart,
  AlertTriangle,
  ChevronRight,
  Bookmark,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useKombinStore } from "@/lib/kombin-store";
import { useKombinsStore } from "@/lib/buyer-store";
import { getRoleLabel, getRoleColor, getScoreColor, formatPrice } from "@/lib/kombin-utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Circular score gauge
function ScoreGauge({ score }: { score: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 100) * circumference;
  const color = score >= 75 ? "#adff41" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width={140} height={140} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={70}
          cy={70}
          r={r}
          fill="none"
          stroke="#1a2a0a"
          strokeWidth={10}
        />
        {/* Progress */}
        <motion.circle
          cx={70}
          cy={70}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-4xl font-black leading-none"
          style={{ color }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function SubScoreCard({
  icon: Icon,
  label,
  value,
  invert,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  invert?: boolean;
}) {
  const color = invert
    ? value <= 25 ? "text-[#adff41]" : value <= 50 ? "text-amber-400" : "text-red-400"
    : getScoreColor(value);

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted/20 px-3 py-3">
      <Icon className="size-4 text-muted-foreground" />
      <span className={cn("text-xl font-black", color)}>{value}</span>
      <span className="text-[10px] text-center text-muted-foreground leading-tight">{label}</span>
    </div>
  );
}

export function Step3Analysis() {
  const router = useRouter();
  const { analysisResult, products, goal, reset } = useKombinStore();
  const saveKombin = useKombinsStore((s) => s.saveKombin);

  if (!analysisResult) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Analiz sonucu bulunamadı.
      </div>
    );
  }

  const result = analysisResult;
  const { scores, headline, summary, productResults, missingPiece, warningItem, purchaseOrder, suggestions } =
    result;

  const orderedProductsForPurchase = purchaseOrder
    .map((pid) => products.find((p) => p.id === pid))
    .filter(Boolean) as typeof products;

  async function handleSaveKombin() {
    try {
      await saveKombin({
        title: goal.goalText.slice(0, 60) || "Yeni Kombin",
        goalText: goal.goalText,
        budget: goal.budget,
        products,
        result,
      });
    } catch (err) {
      console.error("[Kombin] Kaydedilemedi:", err);
      toast.error("Kombin kaydedilemedi. Tekrar dene.");
      return;
    }

    toast.success("Kombin kaydedildi!");
    router.push("/platform/kombins");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-5"
    >
      {/* Overall Score */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:gap-5 sm:items-start">
        <ScoreGauge score={scores.overall} />
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Genel Kombin Skoru
          </p>
          <p className={cn("text-xl font-black", getScoreColor(scores.overall))}>{headline}</p>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </div>
      </div>

      {/* Sub scores */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SubScoreCard icon={Heart}       label="İhtiyaç Uyumu"  value={scores.needFit} />
        <SubScoreCard icon={Puzzle}      label="Parça Uyumu"    value={scores.partFit} />
        <SubScoreCard icon={Scale}       label="Bütçe Dengesi"  value={scores.budgetBalance} />
        <SubScoreCard icon={ShieldCheck} label="Risk"           value={scores.risk} invert />
      </div>

      {/* Product roles */}
      {productResults.length > 0 && (
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Puzzle className="size-3.5" /> Parça Rolleri
          </p>
          <div className="space-y-2">
            {productResults.map((pr) => {
              const product = products.find((p) => p.id === pr.productId);
              if (!product) return null;
              return (
                <div
                  key={pr.productId}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="size-10 rounded-lg object-cover bg-muted shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{product.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{pr.aiComment}</p>
                  </div>
                  <span className={cn("shrink-0 text-xs font-bold", getRoleColor(pr.role))}>
                    {getRoleLabel(pr.role)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing / Warning */}
      {(missingPiece || warningItem) && (
        <div className="grid gap-2 sm:grid-cols-2">
          {missingPiece && (
            <div className="rounded-xl border border-[#adff41]/30 bg-[#adff41]/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Puzzle className="size-4 text-[#adff41]" />
                <span className="text-xs font-bold text-[#adff41] uppercase tracking-wide">Eksik Parça</span>
              </div>
              <p className="text-sm text-muted-foreground">{missingPiece}</p>
              {suggestions.length > 0 && (
                <button className="cursor-pointer mt-2 flex items-center gap-1 text-xs font-semibold text-[#adff41] hover:underline">
                  Önerileri Gör <ChevronRight className="size-3.5" />
                </button>
              )}
            </div>
          )}
          {warningItem && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="size-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Dikkat</span>
              </div>
              <p className="text-sm text-muted-foreground">{warningItem}</p>
            </div>
          )}
        </div>
      )}

      {/* Purchase order */}
      {orderedProductsForPurchase.length > 0 && (
        <div>
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Star className="size-3.5" /> Satın Alma Sırası
          </p>
          <div className="flex flex-col gap-2">
            {orderedProductsForPurchase.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#adff41]/10 text-sm font-black text-[#adff41]">
                  {i + 1}
                </span>
                <img src={p.image} alt={p.title} className="size-10 rounded-lg object-cover bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(p.price)}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">Öncelik {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action button */}
      <div className="pt-2">
        <button
          onClick={handleSaveKombin}
          className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-[#adff41] py-3.5 text-sm font-black text-[#1a2e00] hover:bg-[#9ee833] transition-colors active:scale-[0.98]"
        >
          <Bookmark className="size-4" />
          Kombini Kaydet
        </button>
      </div>

      {/* Reset */}
      <button
        onClick={reset}
        className="cursor-pointer flex items-center justify-center gap-2 rounded-xl py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <RotateCcw className="size-4" />
        Yeni Kombin Başlat
      </button>
    </motion.div>
  );
}
