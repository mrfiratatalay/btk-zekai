import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { BuyerAnalysis } from "@/types/analysis";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const c = (n:number) => n>=65?"text-emerald-600":n>=40?"text-amber-500":"text-red-500";
const b = (n:number) => n>=65?"bg-emerald-500":n>=40?"bg-amber-500":"bg-red-500";

export function FitTab({ analysis }: { analysis: BuyerAnalysis }) {
  const { fitScore } = analysis.scores;
  const needShort = analysis.userNeedText.trim().split(/\s+/).length < 5;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
      <div className="space-y-8">
        <p className="max-w-md text-sm leading-7 text-slate-500">{analysis.fitAnalysis.summary}</p>

        {needShort && (
          <div className="flex items-start gap-2 text-sm text-amber-600">
            <AlertTriangle className="mt-0.5 size-4 shrink-0"/>
            <span>Senaryon kısa — genel kullanım varsayımlarıyla değerlendirildi.</span>
          </div>
        )}

        <Accordion type="single" collapsible className="divide-y divide-slate-100">
          {analysis.fitAnalysis.subScores.map(sub => (
            <AccordionItem key={sub.label} value={sub.label} className="border-0">
              <AccordionTrigger className="py-4 text-sm hover:no-underline [&>svg]:text-slate-300">
                <div className="flex flex-1 items-center gap-4 pr-3 text-left">
                  <span className="font-medium text-slate-700">{sub.label}</span>
                  <div className="ml-auto flex items-center gap-2.5 shrink-0">
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div className={cn("h-full rounded-full", b(sub.score))} style={{width:`${sub.score}%`}}/>
                    </div>
                    <span className={cn("w-6 text-right text-xs font-semibold tabular-nums", c(sub.score))}>{sub.score}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-6 text-slate-500">{sub.reason}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="space-y-5">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Başka senaryolarda</p>
        {analysis.fitAnalysis.scenarioComparisons.map(sc => (
          <div key={sc.scenario} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{sc.scenario}</span>
              <span className={cn("font-semibold tabular-nums", c(sc.score))}>{sc.score}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-slate-100">
              <div className={cn("h-full rounded-full", b(sc.score))} style={{width:`${sc.score}%`}}/>
            </div>
          </div>
        ))}
        <div className="space-y-2.5 pt-3">
          {[
            { ok: fitScore>=65,                              t:"Genel kullanım için makul" },
            { ok: analysis.scores.returnRiskPercent<25,     t:"İade riski kabul edilebilir" },
            { ok: analysis.scores.priceScore>=55,           t:"Fiyat beklentiyle uyumlu" },
          ].map(item=>(
            <div key={item.t} className="flex items-center gap-2 text-xs">
              {item.ok
                ?<CheckCircle2 className="size-3.5 text-emerald-500"/>
                :<AlertTriangle className="size-3.5 text-amber-400"/>}
              <span className="text-slate-500">{item.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
