"use client";

import { AlertCircle } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BuyerAnalysis } from "@/types/analysis";

const PAL = ["#EF4444","#F59E0B","#6366F1","#10B981","#94A3B8"];

export function ReturnRiskTab({ analysis }: { analysis: BuyerAnalysis }) {
  return (
    <div className="max-w-2xl space-y-8">
      <p className="text-sm leading-7 text-slate-500">{analysis.returnRiskAnalysis.summary}</p>

      {analysis.returnRiskAnalysis.personalWarning && (
        <div className="flex items-start gap-2.5 text-sm text-red-600">
          <AlertCircle className="mt-0.5 size-4 shrink-0"/>
          <span>{analysis.returnRiskAnalysis.personalWarning}</span>
        </div>
      )}

      <div>
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-400">İade sebep dağılımı</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analysis.returnRiskAnalysis.reasons} layout="vertical"
              margin={{left:8,right:40,top:4,bottom:4}} barSize={11}>
              <XAxis type="number" domain={[0,100]} tickLine={false} axisLine={false}
                tick={{fontSize:11,fill:"#CBD5E1"}} tickFormatter={v=>`%${v}`}/>
              <YAxis type="category" dataKey="label" tickLine={false} axisLine={false}
                width={175} tick={{fontSize:11,fill:"#64748B"}}/>
              <Tooltip formatter={v=>[`%${v}`,"İade oranı"]}
                contentStyle={{borderRadius:8,border:"1px solid #F1F5F9",fontSize:12,boxShadow:"0 4px 16px rgba(0,0,0,.07)"}}/>
              <Bar dataKey="percent" radius={[0,4,4,0]}>
                {analysis.returnRiskAnalysis.reasons.map((_,i)=>(
                  <Cell key={i} fill={PAL[i%PAL.length]}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
