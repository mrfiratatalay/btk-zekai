import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Scale } from "lucide-react";
import { getReturnById } from "@/lib/mock-data/returns";
import { formatOrderPrice } from "@/lib/mock-data/orders";
import { ReturnEvidenceGrid } from "@/components/returns/ReturnEvidenceGrid";
import { ReturnStatusTimeline } from "@/components/returns/ReturnStatusTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AccountReturnDetailPage({
  params,
}: {
  params: Promise<{ returnId: string }>;
}) {
  const { returnId } = await params;
  const returnRequest = getReturnById(returnId);

  if (!returnRequest) {
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
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <Badge className="rounded-full border-[#DDD6FE] bg-[#F5F3FF] text-[#5B2EFF]">
                    AI Hakem incelemesi başladı
                  </Badge>
                  <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#111827]">
                    İade takip sayfası
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]">
                    Alıcı iddiası, satıcı yanıtı ve kanıtlar aynı dosyada takip
                    ediliyor.
                  </p>
                </div>
                <Button asChild className="rounded-xl bg-[#5B2EFF] font-bold text-white hover:bg-[#4C1D95]">
                  <Link href="/disputes/demo-case-1">
                    <Scale className="size-4" />
                    AI Hakem kararını gör
                  </Link>
                </Button>
              </div>

              <div className="mt-6 flex gap-4">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                  <Image
                    src={returnRequest.productImage}
                    alt={returnRequest.productTitle}
                    fill
                    sizes="96px"
                    className="object-contain p-3"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#111827]">
                    {returnRequest.productTitle}
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {returnRequest.sellerName} · {returnRequest.reasonLabel}
                  </p>
                  <p className="mt-3 text-2xl font-extrabold text-[#111827]">
                    {formatOrderPrice(returnRequest.amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <h2 className="text-lg font-extrabold text-[#111827]">
                  Alıcının iddiası
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#374151]">
                  {returnRequest.buyerClaim}
                </p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <h2 className="text-lg font-extrabold text-[#111827]">
                  Satıcının cevabı
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#374151]">
                  {returnRequest.sellerResponse}
                </p>
              </div>
            </div>

            <ReturnEvidenceGrid items={returnRequest.evidenceImages} />
          </section>

          <ReturnStatusTimeline items={returnRequest.timeline} />
        </div>
      </div>
    </main>
  );
}
