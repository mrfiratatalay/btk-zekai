"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Sparkles, Target, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { sellerImprovements } from "@/lib/mock-data/seller";
import { SellerImprovementCard } from "@/components/seller/SellerImprovementCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const cumulativeImpact = {
  conversionBefore: 5,
  conversionAfter: 14,
  returnBefore: 23,
  returnAfter: 9,
  profitGain: 4200,
};

export function SellerImprovementAssistant() {
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyingAll, setApplyingAll] = useState(false);
  const [allApplied, setAllApplied] = useState(false);

  function applyOne(id: string) {
    setAppliedIds((prev) => new Set([...prev, id]));
  }

  async function applyAll() {
    setApplyingAll(true);
    const ids = sellerImprovements.map((i) => i.id);
    for (let idx = 0; idx < ids.length; idx++) {
      await new Promise((res) => setTimeout(res, 320));
      setAppliedIds((prev) => new Set([...prev, ids[idx]]));
    }
    setApplyingAll(false);
    setAllApplied(true);
    toast.success("Tüm iyileştirmeler uygulandı! Aylık kâr artışı başlıyor.");
  }

  const appliedCount = appliedIds.size;
  const totalCount = sellerImprovements.length;
  const progressPct = Math.round((appliedCount / totalCount) * 100);

  return (
    <div className="space-y-5">
      {/* Kümülatif etki özeti */}
      <section className="rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#312E81]">
              Bu ürün için {totalCount} iyileştirme önerisi hazır
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#4C1D95]">
              Tüm öneriler uygulanırsa tahmini toplam etki:
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2">
                <TrendingUp className="size-4 text-[#16A34A]" />
                <span className="text-sm font-extrabold text-[#111827]">
                  Dönüşüm: %{cumulativeImpact.conversionBefore}{" "}
                  <span className="text-[#6B7280]">→</span>{" "}
                  <span className="text-[#16A34A]">%{cumulativeImpact.conversionAfter}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2">
                <TrendingDown className="size-4 text-[#16A34A]" />
                <span className="text-sm font-extrabold text-[#111827]">
                  İade: %{cumulativeImpact.returnBefore}{" "}
                  <span className="text-[#6B7280]">→</span>{" "}
                  <span className="text-[#16A34A]">%{cumulativeImpact.returnAfter}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2">
                <Target className="size-4 text-[#16A34A]" />
                <span className="text-sm font-extrabold text-[#111827]">
                  Aylık kâr artışı:{" "}
                  <span className="text-[#16A34A]">+₺{cumulativeImpact.profitGain.toLocaleString("tr-TR")}</span>
                </span>
              </div>
            </div>
          </div>

          {!allApplied ? (
            <div className="flex shrink-0 flex-col gap-2 md:items-end">
              <Button
                onClick={applyAll}
                disabled={applyingAll || allApplied}
                className="h-11 gap-2 rounded-xl bg-[#5B2EFF] px-5 font-extrabold text-white hover:bg-[#4C1FDC] disabled:opacity-70"
              >
                {applyingAll ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Uygulanıyor...
                  </>
                ) : (
                  <>
                    <Zap className="size-4" />
                    Hepsini Tek Tıkla Uygula
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.info("Seçerek uygulama — aşağıdan tek tek onaylayabilirsin.")}
                className="h-9 rounded-xl border-[#DDD6FE] bg-white/80 font-bold text-[#5B2EFF]"
              >
                <Sparkles className="size-4" />
                Seçerek Uygula
              </Button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#DCFCE7] px-4 py-3">
              <CheckCircle2 className="size-5 text-[#16A34A]" />
              <span className="font-extrabold text-[#166534]">Tüm öneriler uygulandı!</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {appliedCount > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#4C1D95]">
              <span>{appliedCount}/{totalCount} öneri uygulandı</span>
              <span>%{progressPct}</span>
            </div>
            <Progress value={progressPct} className="mt-1.5 h-2 bg-[#DDD6FE]" />
          </div>
        )}
      </section>

      {/* All applied success banner */}
      {allApplied && (
        <section className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-[#16A34A]" />
            <div>
              <h3 className="font-extrabold text-[#166534]">
                Tüm iyileştirmeler uygulandı — sistem güncelleniyor
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#166534]">
                Başlık, açıklama, SSS ve fiyat stratejisi güncellendi. Sentetik müşteri panelini
                1 hafta sonra yeniden çalıştırarak etkiyi ölçebilirsin.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Individual improvement cards */}
      <section className="space-y-4">
        {sellerImprovements.map((improvement) => (
          <div
            key={improvement.id}
            className={cn(
              "transition-all duration-300",
              appliedIds.has(improvement.id) && "opacity-60"
            )}
          >
            <SellerImprovementCard
              improvement={improvement}
              applied={appliedIds.has(improvement.id)}
              onApply={() => applyOne(improvement.id)}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
