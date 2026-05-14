"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { SellerActionItem } from "@/types/seller";
import { sellerActions } from "@/lib/mock-data/seller";
import { cn } from "@/lib/utils";
import { SellerStatusBadge } from "@/components/seller/SellerStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const PREVIEW_COUNT = 3;

function ActionBlock({
  action,
  compact,
  fillHeight,
}: {
  action: SellerActionItem;
  compact?: boolean;
  /** Önizlemede sol kartla aynı yükseklikte eşit üç bölüm için. */
  fillHeight?: boolean;
}) {
  const outer = cn(
    "rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-2.5 sm:p-3",
    fillHeight && "flex h-full min-h-0 flex-col",
  );

  if (!compact) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-3">
        <div className="flex gap-2 sm:gap-2.5">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#16A34A]" />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-start justify-between gap-1.5 gap-y-1">
              <h3 className="text-sm font-extrabold leading-snug text-[#111827]">
                {action.title}
              </h3>
              <SellerStatusBadge
                status={action.priority}
                variant="actions"
                className=""
              />
            </div>
            <p className="text-sm leading-relaxed text-[#6B7280]">{action.description}</p>
            <p className="text-sm font-bold text-[#15803D]">
              Beklenen etki: {action.impact}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={outer}>
      <div
        className={cn(
          "flex gap-2 sm:gap-2.5",
          fillHeight ? "min-h-0 flex-1 flex-row items-stretch" : "items-start",
        )}
      >
        <CheckCircle2
          className={cn(
            "mt-0.5 size-4 shrink-0 text-[#16A34A] sm:size-4",
            fillHeight && "sm:mt-1",
          )}
        />
        <div
          className={cn(
            "min-w-0 flex-1",
            fillHeight && "flex min-h-0 flex-1 flex-col",
            !fillHeight && "space-y-1",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-1.5 gap-y-1">
            <h3 className="line-clamp-2 min-w-0 flex-1 text-[11px] font-extrabold leading-snug text-[#111827] sm:text-xs">
              {action.title}
            </h3>
            <SellerStatusBadge
              status={action.priority}
              variant="actions"
              className="shrink-0 px-1.5 py-0 text-[9px] sm:text-[10px]"
            />
          </div>
          <p
            className={cn(
              "line-clamp-2 text-[10px] leading-snug text-[#6B7280] sm:text-[11px]",
              fillHeight ? "mt-1 min-h-0 flex-1" : "mt-1",
            )}
          >
            {action.description}
          </p>
          <p
            className={cn(
              "text-[10px] font-bold leading-snug text-[#15803D] sm:text-[11px]",
              fillHeight && "mt-auto shrink-0 pt-1",
              !fillHeight && "",
            )}
          >
            Beklenen etki: {action.impact}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SellerActionList() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const preview = sellerActions.slice(0, PREVIEW_COUNT);

  return (
    <>
      <Card className="flex h-full min-h-0 flex-col rounded-xl border-[#E5E7EB] bg-white shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0 pb-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-extrabold sm:text-lg">
              Bu Hafta Önerilen Aksiyonlar
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-[#6B7280] sm:text-sm">
              En yüksek etki önceliğine göre özet.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="h-8 shrink-0 gap-1 rounded-lg px-2 text-xs font-bold text-[#FF6000] hover:bg-[#FFF7ED] hover:text-[#E65700] sm:h-9 sm:px-3 sm:text-sm"
            onClick={() => setSheetOpen(true)}
          >
            Tümünü gör
            <ArrowRight className="size-3.5 sm:size-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-2 pb-4 pt-0">
          {preview.map((action) => (
            <div
              key={action.id}
              className="flex min-h-0 flex-1 basis-0 flex-col"
            >
              <ActionBlock action={action} compact fillHeight />
            </div>
          ))}
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-[#E5E7EB] px-4 pb-4 pt-4 text-left">
            <SheetTitle className="text-lg font-extrabold text-[#111827]">
              Tüm önerilen aksiyonlar
            </SheetTitle>
            <SheetDescription className="text-sm text-[#6B7280]">
              Bu hafta için AI ve iade sinyallerine göre sıralanan aksiyonların tamamı.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1 px-4">
            <div className="flex flex-col gap-3 py-4 pr-1">
              {sellerActions.map((action, index) => (
                <div key={action.id}>
                  {index > 0 ? <Separator className="mb-3 bg-[#F3F4F6]" /> : null}
                  <ActionBlock action={action} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
