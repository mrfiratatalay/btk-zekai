"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Puzzle, Bookmark, RotateCcw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKombinStore } from "@/lib/kombin-store";
import { useKombinsStore } from "@/lib/buyer-store";
import { getRoleLabel, getRoleColor, formatPrice } from "@/lib/kombin-utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DECISION_CONFIG = {
  al: {
    label: "Al",
    sub: "Hedefine uygun bir kombin.",
    icon: CheckCircle2,
    color: "text-[#adff41]",
    border: "border-[#adff41]/30 bg-[#adff41]/5",
  },
  dusun: {
    label: "Düşün",
    sub: "Birkaç noktayı gözden geçir.",
    icon: AlertCircle,
    color: "text-amber-400",
    border: "border-amber-500/30 bg-amber-500/5",
  },
  alma: {
    label: "Alma",
    sub: "Bu kombin hedefin için zayıf.",
    icon: XCircle,
    color: "text-red-400",
    border: "border-red-500/30 bg-red-500/5",
  },
} as const;

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

  const { decision, scores, headline, summary, productResults, missingPiece, warningItem, purchaseOrder } = analysisResult;
  const finalDecision = (decision ?? (scores.overall >= 78 ? "al" : scores.overall >= 60 ? "dusun" : "alma")) as keyof typeof DECISION_CONFIG;
  const cfg = DECISION_CONFIG[finalDecision];
  const Icon = cfg.icon;

  // Merge purchase order + product results into one sorted list
  const orderedProducts = purchaseOrder
    .map((pid, i) => {
      const product = products.find((p) => p.id === pid);
      const pr = productResults.find((r) => r.productId === pid);
      return product ? { product, pr, order: i + 1 } : null;
    })
    .filter(Boolean) as { product: (typeof products)[0]; pr: (typeof productResults)[0] | undefined; order: number }[];

  async function handleSave() {
    try {
      await saveKombin({
        title: goal.goalText.slice(0, 60) || "Yeni Kombin",
        goalText: goal.goalText,
        budget: goal.budget,
        products,
        result: analysisResult!,
      });
    } catch {
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
      className="flex flex-col gap-4"
    >
      {/* Verdict */}
      <div className={cn("rounded-2xl border p-5", cfg.border)}>
        <div className="flex items-center gap-3 mb-3">
          <Icon className={cn("size-6 shrink-0", cfg.color)} />
          <span className={cn("text-2xl font-black", cfg.color)}>{cfg.label}</span>
          <span className="text-sm text-muted-foreground">{cfg.sub}</span>
        </div>
        <p className="font-black text-foreground text-lg leading-snug">{headline}</p>
        {summary && <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{summary}</p>}
      </div>

      {/* Products — single unified list */}
      {orderedProducts.length > 0 && (
        <div className="flex flex-col gap-2">
          {orderedProducts.map(({ product, pr, order }) => (
            <div
              key={product.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 px-3 py-3"
            >
              <span className="flex size-6 shrink-0 mt-0.5 items-center justify-center rounded-full bg-muted text-xs font-black text-muted-foreground">
                {order}
              </span>
              <img
                src={product.image}
                alt={product.title}
                className="size-10 rounded-lg object-cover bg-muted shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground truncate">{product.title}</p>
                  {pr && (
                    <span className={cn("shrink-0 text-xs font-bold", getRoleColor(pr.role))}>
                      {getRoleLabel(pr.role)}
                    </span>
                  )}
                </div>
                {pr?.aiComment && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{pr.aiComment}</p>
                )}
                <p className="mt-0.5 text-xs font-bold text-[#adff41]">{formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alerts */}
      {(missingPiece || warningItem) && (
        <div className="flex flex-col gap-2">
          {missingPiece && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#adff41]/20 bg-[#adff41]/5 px-4 py-3">
              <Puzzle className="size-4 shrink-0 mt-0.5 text-[#adff41]" />
              <p className="text-sm text-muted-foreground"><span className="font-bold text-[#adff41]">Eksik: </span>{missingPiece}</p>
            </div>
          )}
          {warningItem && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-400" />
              <p className="text-sm text-muted-foreground"><span className="font-bold text-amber-400">Dikkat: </span>{warningItem}</p>
            </div>
          )}
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-[#adff41] py-3.5 text-sm font-black text-[#1a2e00] hover:bg-[#9ee833] transition-colors active:scale-[0.98] mt-1"
      >
        <Bookmark className="size-4" />
        Kombini Kaydet
      </button>

      <button
        onClick={reset}
        className="cursor-pointer flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <RotateCcw className="size-4" />
        Yeni Kombin Başlat
      </button>
    </motion.div>
  );
}
