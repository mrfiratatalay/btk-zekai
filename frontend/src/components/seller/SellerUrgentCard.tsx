"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, HelpCircle } from "lucide-react";
import {
  formatSellerPrice,
  getPriorityProducts,
  sellerStore,
} from "@/lib/mock-data/seller";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function shortProductTitle(title: string) {
  const parts = title.trim().split(/\s+/);
  return parts.slice(0, 3).join(" ");
}

type SellerUrgentCardProps = {
  className?: string;
};

export function SellerUrgentCard({ className }: SellerUrgentCardProps) {
  const top = getPriorityProducts(1)[0];
  const shortTitle = shortProductTitle(top.title);
  const lost = formatSellerPrice(top.lostProfitMonthly);
  const headline = `${sellerStore.urgentProducts} üründe acil iyileştirme fırsatı`;
  const detail = `${shortTitle} · Yüksek iade, mikrofon şikâyetleri ve fiyat algısı; yaklaşık ${lost}/ay kayıp.`;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn("min-h-0 min-w-0 lg:flex lg:h-full lg:flex-col", className)}
      >
        <Card
          size="sm"
          className="flex h-full min-h-0 flex-col rounded-xl border-[#FCD34D] bg-[#FFFBEB] py-0 shadow-sm ring-0"
        >
          <CardContent className="flex min-h-0 flex-1 flex-row flex-nowrap items-center justify-center gap-2 p-2 sm:gap-2.5 sm:p-2.5 md:gap-3 md:px-3 md:py-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#B45309] sm:size-8">
              <AlertTriangle className="size-3.5 sm:size-4" />
            </span>

            <div className="min-w-0 flex-1 pr-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="min-w-0 cursor-default truncate text-[11px] font-extrabold leading-tight text-[#111827] sm:text-xs md:text-[13px]">
                      {headline}
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs text-xs">
                    {headline}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex shrink-0 rounded-md text-[#B45309] outline-offset-2 hover:text-[#92400E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F59E0B]"
                      aria-label="Acil iyileştirme hakkında bilgi"
                    >
                      <HelpCircle className="size-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px] text-xs">
                    Özet, AI risk skoru ve iade sinyallerine göre en kritik
                    ürününüz üzerinden hesaplanır.
                  </TooltipContent>
                </Tooltip>
                <Badge className="hidden shrink-0 rounded-full border border-[#FDE68A] bg-[#FEF3C7] px-1.5 py-0 text-[9px] font-bold text-[#B45309] hover:bg-[#FEF3C7] sm:inline-flex sm:text-[10px]">
                  Öncelikli
                </Badge>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="mt-0.5 truncate text-[10px] leading-snug text-[#78350F] sm:text-[11px] md:text-xs">
                    {detail}
                  </p>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-sm text-xs leading-relaxed"
                >
                  {detail}
                </TooltipContent>
              </Tooltip>
            </div>

            <Button
              asChild
              size="sm"
              className="h-8 shrink-0 rounded-lg bg-[#FF6000] px-2.5 text-[11px] font-bold text-white hover:bg-[#E65700] sm:px-3 md:whitespace-nowrap"
            >
              <Link
                href={`/seller/product/${top.id}`}
                className="inline-flex items-center gap-1"
              >
                <span className="hidden md:inline">Öncelikli ürünü incele</span>
                <span className="md:hidden">İncele</span>
                <ArrowRight className="size-3.5 shrink-0" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
