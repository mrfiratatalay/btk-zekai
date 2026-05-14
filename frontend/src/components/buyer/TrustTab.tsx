import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { BuyerAnalysis, TrustSignal } from "@/types/analysis";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const ICON = { success:CheckCircle2, warning:AlertTriangle, danger:ShieldAlert };
const DOT  = { success:"bg-emerald-500", warning:"bg-amber-500", danger:"bg-red-500" };
const TXT  = { success:"text-emerald-600", warning:"text-amber-600", danger:"text-red-600" };
const CATS = ["Yorum Forensiği","Görsel Tutarlılık","Satıcı Geçmişi","Açıklama Tutarlılığı"];

export function TrustTab({ analysis }: { analysis: BuyerAnalysis }) {
  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm leading-7 text-slate-500">{analysis.trustAnalysis.summary}</p>
      <Accordion type="multiple" className="divide-y divide-slate-100">
        {analysis.trustAnalysis.signals.map((s: TrustSignal, i) => {
          const Icon = ICON[s.tone];
          return (
            <AccordionItem key={s.title} value={s.title} className="border-0">
              <AccordionTrigger className="py-4 text-sm hover:no-underline [&>svg]:text-slate-300">
                <div className="flex flex-1 items-center gap-3 pr-3">
                  <span className={cn("size-2 shrink-0 rounded-full", DOT[s.tone])}/>
                  <span className="font-medium text-slate-700">{CATS[i]??s.title}</span>
                  <span className={cn("ml-auto text-xs font-semibold", TXT[s.tone])}>{s.value}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="flex items-start gap-2 text-sm leading-6 text-slate-500">
                  <Icon className={cn("mt-0.5 size-4 shrink-0", TXT[s.tone])}/>
                  <span>{s.description}</span>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
