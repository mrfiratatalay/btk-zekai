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

type SellerKpiCardsProps = {
  compact?: boolean;
  /** Satıcı üst özet satırında acil kart ile aynı yükseklik (lg+). */
  alignHeights?: boolean;
  className?: string;
};

export function SellerKpiCards({
  compact = false,
  alignHeights = false,
  className,
}: SellerKpiCardsProps) {
  return (
    <div
      className={cn(
        "grid",
        compact
          ? "grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-5"
          : "grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5",
        alignHeights &&
          "lg:h-full lg:min-h-0 lg:auto-rows-fr lg:grid-rows-1 lg:items-stretch",
        className,
      )}
    >
      {sellerKpis.map((kpi, index) => {
        const Icon = iconMap[index] ?? TrendingUp;

        return (
          <Card
            key={kpi.label}
            size={compact ? "sm" : "default"}
            className={cn(
              "rounded-xl border-[#E5E7EB] bg-white py-0 shadow-sm",
              alignHeights && "lg:flex lg:h-full lg:min-h-0 lg:flex-col",
            )}
          >
            <CardContent
              className={cn(
                compact ? "p-2.5 sm:p-3" : "p-4",
                alignHeights &&
                  "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:justify-between",
              )}
            >
              <div
                className={cn(
                  "mb-1.5 flex items-center justify-between gap-1.5",
                  !compact && "mb-2 gap-2",
                )}
              >
                <p
                  className={cn(
                    "font-semibold leading-tight text-[#6B7280]",
                    compact
                      ? "text-[10px] leading-snug sm:text-[11px]"
                      : "text-xs",
                  )}
                >
                  {kpi.label}
                </p>
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-md",
                    compact ? "size-6" : "size-7",
                    toneClasses[kpi.tone],
                  )}
                >
                  <Icon className={compact ? "size-3" : "size-3.5"} />
                </span>
              </div>
              <p
                className={cn(
                  "font-extrabold tracking-tight text-[#111827]",
                  compact ? "text-sm sm:text-base" : "text-xl",
                )}
              >
                {kpi.value}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-[#9CA3AF] leading-4",
                  compact
                    ? "line-clamp-2 text-[9px] sm:text-[10px]"
                    : "mt-1 line-clamp-2 text-[11px]",
                )}
              >
                {kpi.note}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
