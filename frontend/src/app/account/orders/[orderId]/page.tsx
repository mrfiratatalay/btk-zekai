import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CreditCard, MapPin, ShieldCheck, Truck } from "lucide-react";
import { formatOrderPrice, getOrderById } from "@/lib/mock-data/orders";
import { ReturnRequestForm } from "@/components/returns/ReturnRequestForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F5F6F8]">
      <div className="mx-auto max-w-[1180px] px-4 py-6">
        <Button asChild variant="ghost" className="mb-5 rounded-lg font-bold">
          <Link href="/account/orders">
            <ArrowLeft className="size-4" />
            Siparişlere dön
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge className="rounded-full border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]">
                    Teslim edildi
                  </Badge>
                  <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#111827]">
                    Sipariş detayı
                  </h1>
                  <p className="mt-1 text-sm text-[#6B7280]">{order.orderNumber}</p>
                </div>
                <p className="text-3xl font-extrabold text-[#111827]">
                  {formatOrderPrice(order.total)}
                </p>
              </div>

              <div className="mt-6 flex gap-4">
                <div className="relative size-28 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                  <Image
                    src={order.item.image}
                    alt={order.item.title}
                    fill
                    sizes="112px"
                    className="object-contain p-3"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#111827]">
                    {order.item.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {order.item.sellerName} · {order.item.category}
                  </p>
                  <p className="mt-3 text-sm font-bold text-[#111827]">
                    {order.item.quantity} adet · {formatOrderPrice(order.item.price)}
                  </p>
                </div>
              </div>
            </div>

            <ReturnRequestForm orderId={order.id} />
          </section>

          <aside className="space-y-4">
            {[
              {
                icon: Truck,
                title: "Teslimat",
                value: `${order.deliveredAt} · ${order.deliveryAddress}`,
              },
              {
                icon: CreditCard,
                title: "Ödeme",
                value: order.paymentMethod,
              },
              {
                icon: MapPin,
                title: "Adres",
                value: order.deliveryAddress,
              },
              {
                icon: ShieldCheck,
                title: "İade politikası",
                value: "Teslimden sonra 14 gün içinde talep açılabilir.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2 font-extrabold text-[#111827]">
                    <Icon className="size-4 text-[#FF6000]" />
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </aside>
        </div>
      </div>
    </main>
  );
}
