import { CheckCircle2 } from "lucide-react";
import { sellerActions } from "@/lib/mock-data/seller";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SellerStatusBadge } from "@/components/seller/SellerStatusBadge";

export function SellerActionList() {
  return (
    <Card className="rounded-xl border-[#E5E7EB] bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-extrabold">
          Bu Hafta Önerilen Aksiyonlar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sellerActions.map((action) => (
          <div
            key={action.id}
            className="rounded-xl border border-[#E5E7EB] bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#16A34A]" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold leading-5 text-[#111827]">
                    {action.title}
                  </h3>
                  <SellerStatusBadge status={action.priority} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  {action.description}
                </p>
                <p className="mt-2 text-sm font-bold text-[#15803D]">
                  {action.impact}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
