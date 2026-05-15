import { SellerKpiCards } from "@/components/seller/SellerKpiCards";
import { SellerUrgentCard } from "@/components/seller/SellerUrgentCard";

export function SellerDashboardSummary() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-stretch lg:gap-4">
      <div className="min-w-0 lg:col-span-7 lg:flex lg:min-h-0 lg:flex-col xl:col-span-7">
        <SellerKpiCards alignHeights compact className="lg:min-h-0 lg:flex-1" />
      </div>
      <div className="flex min-h-0 min-w-0 lg:col-span-5 xl:col-span-5">
        <SellerUrgentCard className="w-full lg:h-full" />
      </div>
    </div>
  );
}
