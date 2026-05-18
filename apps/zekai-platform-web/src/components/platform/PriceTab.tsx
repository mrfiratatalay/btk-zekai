"use client";

import { AlertTriangle } from "lucide-react";
import type { BuyerAnalysis } from "@/types/analysis";

export function PriceTab({ analysis }: { analysis: BuyerAnalysis }) {
  return (
    <div className="max-w-2xl space-y-8">
      <p className="text-sm leading-7 text-muted-foreground">{analysis.priceAnalysis.summary}</p>

      {analysis.priceAnalysis.warning && (
        <div className="flex items-start gap-2.5 text-sm text-amber-600">
          <AlertTriangle className="mt-0.5 size-4 shrink-0"/>
          <span>{analysis.priceAnalysis.warning}</span>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Fiyat bilgileri</p>
        <div className="divide-y divide-border">
          {analysis.priceAnalysis.marketComparison.map(item => (
            <div key={item.label} className="flex justify-between py-3 text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-semibold text-foreground/90">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
