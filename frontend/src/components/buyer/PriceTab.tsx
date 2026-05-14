"use client";

import { AlertTriangle } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BuyerAnalysis } from "@/types/analysis";

export function PriceTab({ analysis }: { analysis: BuyerAnalysis }) {
  return (
    <div className="max-w-2xl space-y-8">
      <p className="text-sm leading-7 text-slate-500">{analysis.priceAnalysis.summary}</p>

      {analysis.priceAnalysis.warning && (
        <div className="flex items-start gap-2.5 text-sm text-amber-600">
          <AlertTriangle className="mt-0.5 size-4 shrink-0"/>
          <span>{analysis.priceAnalysis.warning}</span>
        </div>
      )}

      {analysis.priceAnalysis.priceHistory?.length > 0 && (
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-400">30 günlük fiyat geçmişi</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analysis.priceAnalysis.priceHistory} margin={{left:-12,right:8,top:4,bottom:4}}>
                <CartesianGrid stroke="#F1F5F9" strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#CBD5E1"}}/>
                <YAxis tickLine={false} axisLine={false} width={52} tick={{fontSize:11,fill:"#CBD5E1"}} tickFormatter={v=>`₺${v}`}/>
                <Tooltip formatter={v=>[`₺${v}`,""]} labelFormatter={l=>`${l}. gün`}
                  contentStyle={{borderRadius:8,border:"1px solid #F1F5F9",fontSize:12,boxShadow:"0 4px 16px rgba(0,0,0,.07)"}}/>
                <Line type="monotone" dataKey="price" name="Bu satıcı" stroke="#0F172A" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="median" name="Pazar medyanı" stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 4" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">Pazar karşılaştırması</p>
        <div className="divide-y divide-slate-100">
          {analysis.priceAnalysis.marketComparison.map(item=>(
            <div key={item.label} className="flex justify-between py-3 text-sm">
              <span className="text-slate-400">{item.label}</span>
              <span className="font-semibold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
