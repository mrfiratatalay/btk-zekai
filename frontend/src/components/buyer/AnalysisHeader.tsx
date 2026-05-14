import { AlertTriangle, Bot, FileText, ShieldAlert } from "lucide-react";
import type { BuyerAnalysis } from "@/types/analysis";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function AnalysisHeader({ analysis }: { analysis: BuyerAnalysis }) {
  return (
    <Card className="overflow-hidden rounded-2xl border-[#FCA5A5] bg-white shadow-sm">
      <CardContent className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-center md:p-6">
        <div className="space-y-3">
          <Badge className="gap-1 rounded-full bg-[#111827] text-white">
            <Bot className="size-3.5" />
            Kanıta dayalı kişisel karar raporu
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] md:text-4xl">
              Bu ürünü mevcut senaryon için almanı önermiyorum.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-[#4B5563]">
              Sebep: mikrofon şikayetleri, oyun gecikmesi belirsizliği, yapay
              indirim sinyali ve iade riskinin senin kullanım ihtiyacınla
              çakışması.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {["Mikrofon kanıtı", "Fiyat geçmişi", "Bot yorum şüphesi", "İade kök nedeni"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1.5 text-[#374151]"
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="grid min-w-64 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-[#111827]">
            <ShieldAlert className="size-9 text-[#DC2626]" />
            <div>
              <p className="text-sm font-semibold text-[#7F1D1D]">Pişmanlık riski</p>
              <p className="text-3xl font-extrabold">%{analysis.overallRiskPercent}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#FCD34D] bg-[#FFFBEB] p-4 text-[#111827]">
            <AlertTriangle className="size-6 text-[#F59E0B]" />
            <div>
              <p className="text-sm font-semibold text-[#92400E]">Karar</p>
              <p className="text-base font-extrabold">Satın alma, alternatif bak</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-4 text-[#111827]">
            <FileText className="size-6 text-[#5B2EFF]" />
            <div>
              <p className="text-sm font-semibold text-[#3B1B9A]">Kanıt</p>
              <p className="text-base font-extrabold">4 sekmede doğrulandı</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
