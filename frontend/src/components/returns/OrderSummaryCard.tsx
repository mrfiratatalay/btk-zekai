import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CustomerOrder } from "@/types/order";
import { formatOrderPrice } from "@/lib/mock-data/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusLabel = {
  delivered: "Teslim edildi",
  return_requested: "İade sürecinde",
  completed: "Tamamlandı",
};

export function OrderSummaryCard({ order }: { order: CustomerOrder }) {
  return (
    <article className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
            <Image
              src={order.item.image}
              alt={order.item.title}
              fill
              sizes="80px"
              className="object-contain p-2"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border-[#E5E7EB] bg-[#F8FAFC] text-[#374151]">
                {statusLabel[order.status]}
              </Badge>
              <span className="text-sm text-[#6B7280]">{order.orderNumber}</span>
            </div>
            <h2 className="mt-2 line-clamp-2 font-extrabold text-[#111827]">
              {order.item.title}
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              {order.item.sellerName} · Teslim: {order.deliveredAt}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <p className="text-2xl font-extrabold text-[#111827]">
            {formatOrderPrice(order.total)}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-lg bg-white font-bold">
              <Link href={`/account/orders/${order.id}`}>
                Detay
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            {order.returnId ? (
              <Button asChild className="rounded-lg bg-[#5B2EFF] font-bold text-white hover:bg-[#4C1D95]">
                <Link href={`/account/returns/${order.returnId}`}>
                  İade takibi
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
