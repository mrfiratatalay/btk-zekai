"use client";

import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { SellerImprovement } from "@/types/seller";
import { Button } from "@/components/ui/button";
import { SellerStatusBadge } from "@/components/seller/SellerStatusBadge";
import { cn } from "@/lib/utils";

type Props = {
  improvement: SellerImprovement;
  applied?: boolean;
  onApply?: () => void;
};

export function SellerImprovementCard({ improvement, applied = false, onApply }: Props) {
  function handleApply() {
    onApply?.();
    toast.success(`"${improvement.title}" uygulandı.`);
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 shadow-sm transition-colors duration-300",
        applied ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#E5E7EB]"
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          {applied && (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#16A34A]" />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={cn("text-lg font-extrabold", applied ? "text-[#166534]" : "text-[#111827]")}>
                {improvement.title}
              </h3>
              <SellerStatusBadge status={improvement.priority} />
              {applied && (
                <span className="rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-bold text-[#166534]">
                  Uygulandı
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              {improvement.rationale}
            </p>
          </div>
        </div>
        {!applied && (
          <div className="flex gap-2 shrink-0">
            <Button
              className="h-9 rounded-lg bg-[#FF6000] font-bold text-white hover:bg-[#E65700]"
              onClick={handleApply}
            >
              Öneriyi uygula
            </Button>
            <Button
              variant="outline"
              className="h-9 rounded-lg border-[#E5E7EB] bg-white font-bold"
              onClick={() => toast.info("Düzenleme paneli açıldı.")}
            >
              Düzenle
            </Button>
            <Button
              variant="ghost"
              className="h-9 rounded-lg font-bold"
              onClick={() => toast.info("Öneri sonraya bırakıldı.")}
            >
              Sonra
            </Button>
          </div>
        )}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl bg-[#F8FAFC] p-4">
          <p className="text-sm font-extrabold text-[#111827]">Mevcut durum</p>
          <p className="mt-2 text-sm leading-6 text-[#374151]">
            {improvement.currentState}
          </p>
        </div>
        <div className="rounded-xl bg-[#F8FAFC] p-4">
          <p className="text-sm font-extrabold text-[#111827]">Önerilen değişiklik</p>
          <p className="mt-2 text-sm leading-6 text-[#374151]">
            {improvement.suggestedChange}
          </p>
        </div>
        <div className={cn("rounded-xl p-4", applied ? "bg-[#DCFCE7]" : "bg-[#F0FDF4]")}>
          <p className="text-sm font-extrabold text-[#166534]">Tahmini etki</p>
          <p className="mt-2 text-sm leading-6 text-[#166534]">
            {improvement.expectedImpact}
          </p>
        </div>
      </div>
    </div>
  );
}
