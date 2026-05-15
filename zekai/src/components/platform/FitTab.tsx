import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { BuyerAnalysis } from "@/types/analysis";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const bar = (n: number) => n >= 65 ? "bg-emerald-500" : n >= 40 ? "bg-amber-500" : "bg-red-500";

export function FitTab({ analysis }: { analysis: BuyerAnalysis }) {
  const { fitScore } = analysis.scores;

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm leading-7 text-foreground/80">{analysis.fitAnalysis.summary}</p>

      {analysis.userNeedText && analysis.userNeedText.trim().split(/\s+/).length < 5 && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-500/20 dark:bg-amber-500/10">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-amber-700 dark:text-amber-400">Senaryon kısa — genel kullanım varsayımlarıyla değerlendirildi.</span>
        </div>
      )}

      {/* Alt skorlar — bar göster, sayı yok */}
      <Accordion type="single" collapsible className="divide-y divide-border">
        {analysis.fitAnalysis.subScores.map((sub) => (
          <AccordionItem key={sub.label} value={sub.label} className="border-0">
            <AccordionTrigger className="py-4 text-sm hover:no-underline [&>svg]:text-muted-foreground">
              <div className="flex flex-1 items-center gap-4 pr-4">
                <span className="font-medium text-foreground">{sub.label}</span>
                <div className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-border">
                  <div className={cn("h-full rounded-full", bar(sub.score))} style={{ width: `${sub.score}%` }} />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-sm leading-6 text-muted-foreground">
              {sub.reason}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Basit kontrol listesi */}
      <div className="flex flex-col gap-2 pt-2">
        {[
          { ok: fitScore >= 65,                          t: "Genel kullanım için makul" },
          { ok: analysis.scores.returnRiskPercent < 25,  t: "İade riski kabul edilebilir" },
          { ok: analysis.scores.priceScore >= 55,        t: "Fiyat beklentiyle uyumlu" },
        ].map((item) => (
          <div key={item.t} className="flex items-center gap-2.5 text-sm text-muted-foreground">
            {item.ok
              ? <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              : <AlertTriangle className="size-4 shrink-0 text-amber-500" />}
            <span>{item.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
