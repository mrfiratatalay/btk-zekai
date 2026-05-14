"use client";

import { toast } from "sonner";
import type { SellerImprovement } from "@/types/seller";
import { Button } from "@/components/ui/button";
import { SellerStatusBadge } from "@/components/seller/SellerStatusBadge";

export function SellerImprovementCard({
  improvement,
}: {
  improvement: SellerImprovement;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold text-[#111827]">
              {improvement.title}
            </h3>
            <SellerStatusBadge status={improvement.priority} />
          </div>
          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            {improvement.rationale}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="h-9 rounded-lg bg-[#FF6000] font-bold text-white hover:bg-[#E65700]"
            onClick={() => toast.success("Öneri uygulama kuyruğuna alındı")}
          >
            Öneriyi uygula
          </Button>
          <Button
            variant="outline"
            className="h-9 rounded-lg border-[#E5E7EB] bg-white font-bold"
            onClick={() => toast.info("Düzenleme alanı sonraki sprintte bağlanacak")}
          >
            Düzenle
          </Button>
          <Button
            variant="ghost"
            className="h-9 rounded-lg font-bold"
            onClick={() => toast.info("Öneri sonraya bırakıldı")}
          >
            Sonra
          </Button>
        </div>
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
        <div className="rounded-xl bg-[#F0FDF4] p-4">
          <p className="text-sm font-extrabold text-[#166534]">Tahmini etki</p>
          <p className="mt-2 text-sm leading-6 text-[#166534]">
            {improvement.expectedImpact}
          </p>
        </div>
      </div>
    </div>
  );
}
