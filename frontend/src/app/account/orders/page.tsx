import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { customerOrders } from "@/lib/mock-data/orders";
import { OrderSummaryCard } from "@/components/returns/OrderSummaryCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AccountOrdersPage() {
  return (
    <main className="min-h-screen bg-[#F5F6F8]">
      <div className="mx-auto max-w-[1180px] px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" className="rounded-lg font-bold">
            <Link href="/shop">
              <ArrowLeft className="size-4" />
              Pazara dön
            </Link>
          </Button>
          <Badge className="gap-1 rounded-full border-[#E5E7EB] bg-white text-[#374151]">
            <PackageCheck className="size-3.5" />
            Sipariş merkezi
          </Badge>
        </div>

        <section className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">
            Siparişlerim
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            Teslim edilen ürünleri, iade durumunu ve hakem sürecine giden
            talepleri buradan takip edebilirsin.
          </p>
        </section>

        <section className="space-y-4">
          {customerOrders.map((order) => (
            <OrderSummaryCard key={order.id} order={order} />
          ))}
        </section>
      </div>
    </main>
  );
}
