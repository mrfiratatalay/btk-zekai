import {
  AlertTriangle,
  BadgeCheck,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import type { SellerKpi } from "@/types/seller";
import { sellerKpis } from "@/lib/mock-data/seller";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const iconMap = [ShoppingCart, Package, AlertTriangle, BadgeCheck, TrendingUp];

const toneClasses: Record<SellerKpi["tone"], string> = {
  neutral: "bg-[#F8FAFC] text-[#334155]",
  warning: "bg-[#FFFBEB] text-[#B45309]",
  danger: "bg-[#FEF2F2] text-[#DC2626]",
  success: "bg-[#F0FDF4] text-[#15803D]",
};

export function SellerKpiCards() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {sellerKpis.map((kpi, index) => {
        const Icon = iconMap[index] ?? TrendingUp;

        return (
          <Card key={kpi.label} className="rounded-xl border-[#E5E7EB] bg-white shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-[#6B7280]">{kpi.label}</p>
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    toneClasses[kpi.tone],
                  )}
                >
                  <Icon className="size-4" />
                </span>
              </div>
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-[#111827]">
                  {kpi.value}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#6B7280]">{kpi.note}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
