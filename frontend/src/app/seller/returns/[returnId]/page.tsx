import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getReturnById } from "@/lib/mock-data/returns";
import { formatOrderPrice } from "@/lib/mock-data/orders";
import { ReturnActionPanel } from "@/components/returns/ReturnActionPanel";
import { ReturnEvidenceGrid } from "@/components/returns/ReturnEvidenceGrid";
import { ReturnStatusTimeline } from "@/components/returns/ReturnStatusTimeline";
import { SellerShell } from "@/components/seller/SellerShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function SellerReturnDetailPage({
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
    <SellerShell
      title="İade Detayı"
      description="Alıcı iddiasını, kanıtları ve satıcı aksiyonlarını tek dosyada yönetin."
    >
      <div className="mb-5">
        <Button asChild variant="ghost" className="rounded-lg font-bold">
          <Link href="/seller/returns">
            <ArrowLeft className="size-4" />
            İadelere dön
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Badge className="rounded-full border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]">
                  Satıcı aksiyonu bekliyor
                </Badge>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#111827]">
                  {returnRequest.productTitle}
                </h1>
                <p className="mt-2 text-sm text-[#6B7280]">
                  {returnRequest.buyerName} · {returnRequest.reasonLabel}
                </p>
              </div>
              <p className="text-3xl font-extrabold text-[#111827]">
                {formatOrderPrice(returnRequest.amount)}
              </p>
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
                <h2 className="font-extrabold text-[#111827]">Alıcı açıklaması</h2>
                <p className="mt-2 text-sm leading-6 text-[#374151]">
                  {returnRequest.buyerClaim}
                </p>
              </div>
            </div>
          </div>

          <ReturnEvidenceGrid items={returnRequest.evidenceImages} />
          <ReturnActionPanel />
        </section>

        <ReturnStatusTimeline items={returnRequest.timeline} />
      </div>
    </SellerShell>
  );
}
