"use client";

import type { BuyerAnalysis } from "@/types/analysis";
import { AlertTriangle } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function PriceTab({ analysis }: { analysis: BuyerAnalysis }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="space-y-4">
        <Card className="rounded-xl border-[#E5E7EB] bg-white shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-sm font-medium text-[#6B7280]">Fiyat skoru</p>
              <p className="mt-1 text-4xl font-extrabold text-[#FF6000]">
                {analysis.scores.priceScore}/100
              </p>
            </div>
            <Progress value={analysis.scores.priceScore} />
            <p className="text-sm leading-6 text-[#6B7280]">
              {analysis.priceAnalysis.summary}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[#FCD34D] bg-[#FFFBEB] shadow-sm">
          <CardContent className="flex gap-3 p-4 text-[#78350F]">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#F59E0B]" />
            <p className="text-sm leading-6">{analysis.priceAnalysis.warning}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[#E5E7EB] bg-white shadow-sm">
          <CardContent className="space-y-2 p-4">
            {analysis.priceAnalysis.marketComparison.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
              >
                <span className="text-[#6B7280]">{item.label}</span>
                <span className="font-bold text-[#111827]">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-[#E5E7EB] bg-white shadow-sm">
        <CardContent className="h-[320px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analysis.priceAnalysis.priceHistory}>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} />
              <YAxis tickLine={false} width={46} />
              <Tooltip
                formatter={(value) => [`${value} TL`, ""]}
                labelFormatter={(label) => `Gün: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="price"
                name="Bu satıcı"
                stroke="#FF6000"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="median"
                name="Pazar medyanı"
                stroke="#5B2EFF"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
