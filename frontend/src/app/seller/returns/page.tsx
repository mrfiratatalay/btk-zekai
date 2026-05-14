import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatOrderPrice } from "@/lib/mock-data/orders";
import { returnRequests } from "@/lib/mock-data/returns";
import { SellerShell } from "@/components/seller/SellerShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusLabel = {
  seller_review: "Yeni talep",
  seller_disputed: "Satıcı itiraz etti",
  arbiter_review: "Hakem kararı bekliyor",
  resolution_proposed: "Çözüm önerildi",
  resolved: "Çözüldü",
};

export default function SellerReturnsPage() {
  return (
    <SellerShell
      title="İadeler"
      description="İade taleplerini, satıcı yanıtlarını ve hakem sürecine taşınan dosyaları takip edin."
    >
      <section className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] p-5">
          <h2 className="text-xl font-extrabold text-[#111827]">
            İade talepleri
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Öncelik, tutar ve uyuşmazlık durumuna göre hızlı aksiyon alın.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB]">
                <TableHead className="min-w-[280px] px-4">Ürün</TableHead>
                <TableHead>Alıcı</TableHead>
                <TableHead>Sebep</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead className="text-right">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returnRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
                        <Image
                          src={request.productImage}
                          alt={request.productTitle}
                          fill
                          sizes="56px"
                          className="object-contain p-1.5"
                        />
                      </div>
                      <div>
                        <p className="line-clamp-2 font-extrabold text-[#111827]">
                          {request.productTitle}
                        </p>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          {request.orderId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{request.buyerName}</TableCell>
                  <TableCell>{request.reasonLabel}</TableCell>
                  <TableCell>{request.requestedAt}</TableCell>
                  <TableCell>
                    <Badge className="rounded-full border-[#DDD6FE] bg-[#F5F3FF] text-[#5B2EFF]">
                      {statusLabel[request.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-extrabold">
                    {formatOrderPrice(request.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" className="rounded-lg bg-white font-bold">
                      <Link href={`/seller/returns/${request.id}`}>
                        İncele
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </SellerShell>
  );
}
