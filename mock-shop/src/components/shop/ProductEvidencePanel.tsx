import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  LineChart,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";
import type { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/mock-data/products";

function pct(value: number) {
  return `%${value}`;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ProductEvidencePanel({ product }: { product: Product }) {
  const evidence = product.analysisEvidence;

  if (!evidence) {
    return null;
  }

  const verifiedReviewCount = evidence.reviews.filter((review) => review.verifiedPurchase).length;
  const bestPrice = Math.min(
    product.price,
    ...evidence.market.alternativeSellers.map((seller) => seller.price),
  );

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#111827]">
            <MessageSquareText className="size-4 text-[#FF6000]" />
            Yorum kaniti
          </div>
          <p className="mt-3 text-2xl font-black text-[#111827]">
            {evidence.reviews.length}
          </p>
          <p className="text-xs leading-5 text-[#6B7280]">
            {verifiedReviewCount} dogrulanmis satin alma yorumu
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#111827]">
            <LineChart className="size-4 text-[#2563EB]" />
            Fiyat konumu
          </div>
          <p className="mt-3 text-2xl font-black text-[#111827]">
            {formatPrice(product.price)}
          </p>
          <p className="text-xs leading-5 text-[#6B7280]">
            Pazar medyani {formatPrice(evidence.market.medianPrice)}
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#111827]">
            <RotateCcw className="size-4 text-[#7C2DFF]" />
            Iade sinyali
          </div>
          <p className="mt-3 text-2xl font-black text-[#111827]">
            {pct(evidence.returnReasons[0]?.percent ?? 0)}
          </p>
          <p className="text-xs leading-5 text-[#6B7280]">
            {evidence.returnReasons[0]?.label ?? "Belirgin ana sebep yok"}
          </p>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#111827]">
            <Store className="size-4 text-[#16803A]" />
            Satici sinyali
          </div>
          <p className="mt-3 text-2xl font-black text-[#111827]">
            {evidence.sellerSignals.storeRating.toFixed(1)}
          </p>
          <p className="text-xs leading-5 text-[#6B7280]">
            Yanit suresi: {evidence.sellerSignals.responseTime}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <section className="rounded-xl border border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#111827]">Musteri yorumlari</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Agentic analizde kullanilan temsilci yorumlar
              </p>
            </div>
            <Badge className="rounded-md bg-[#FFF4EC] text-[#FF6000]">
              {product.reviewCount.toLocaleString("tr-TR")} toplam
            </Badge>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {evidence.reviews.map((review) => (
              <article key={review.id} className="grid gap-3 px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF8E6] px-2 py-1 text-xs font-extrabold text-[#A15C00]">
                    <Star className="size-3 fill-[#FFB020] text-[#FFB020]" />
                    {review.rating}
                  </span>
                  {review.verifiedPurchase ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#16803A]">
                      <CheckCircle2 className="size-3.5" />
                      Dogrulanmis satin alma
                    </span>
                  ) : null}
                  <span className="text-xs text-[#6B7280]">{dateLabel(review.date)}</span>
                  <span className="text-xs text-[#6B7280]">
                    {review.helpfulCount} kisi faydali buldu
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-[#111827]">{review.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4B5563]">{review.text}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {review.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-semibold text-[#374151]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-6">
          <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center gap-2">
              <Camera className="size-5 text-[#334155]" />
              <h2 className="font-extrabold text-[#111827]">Gorsel kanit</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-[#F8FAFC] p-3">
                <p className="text-xs text-[#6B7280]">Studyo fotografi</p>
                <p className="mt-1 font-black text-[#111827]">
                  {evidence.visualNotes.studioPhotoCount}
                </p>
              </div>
              <div className="rounded-lg bg-[#F8FAFC] p-3">
                <p className="text-xs text-[#6B7280]">Musteri fotografi</p>
                <p className="mt-1 font-black text-[#111827]">
                  {evidence.visualNotes.customerPhotoCount}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[#4B5563]">
              {evidence.visualNotes.consistencyNotes.map((note) => (
                <div key={note} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#16A34A]" />
                  <span>{note}</span>
                </div>
              ))}
              {evidence.visualNotes.redFlags.map((note) => (
                <div key={note} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#F59E0B]" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
            <div className="flex items-center gap-2">
              <RotateCcw className="size-5 text-[#7C2DFF]" />
              <h2 className="font-extrabold text-[#111827]">Iade sebepleri</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {evidence.returnReasons.map((reason) => (
                <div key={reason.label} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-[#374151]">{reason.label}</span>
                    <span className="font-black text-[#111827]">{pct(reason.percent)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF2F7]">
                    <div className="h-full rounded-full bg-[#7C2DFF]" style={{ width: `${reason.percent}%` }} />
                  </div>
                  <p className="text-xs leading-5 text-[#6B7280]">{reason.evidence}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center gap-2">
            <LineChart className="size-5 text-[#2563EB]" />
            <h2 className="font-extrabold text-[#111827]">Fiyat gecmisi</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {evidence.priceHistory.map((point) => (
              <div key={point.day} className="grid grid-cols-[70px_1fr_auto] items-center gap-3 text-sm">
                <span className="font-bold text-[#6B7280]">{point.day}</span>
                <div className="h-2 overflow-hidden rounded-full bg-[#EEF2F7]">
                  <div
                    className="h-full rounded-full bg-[#2563EB]"
                    style={{ width: `${Math.min(100, Math.round((point.price / evidence.priceHistory[0].price) * 100))}%` }}
                  />
                </div>
                <span className="font-black text-[#111827]">{formatPrice(point.price)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#16803A]" />
            <h2 className="font-extrabold text-[#111827]">Pazar karsilastirmasi</h2>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="flex items-center justify-between rounded-lg bg-[#F8FAFC] p-3 text-sm">
              <span className="font-semibold text-[#374151]">Adil fiyat araligi</span>
              <span className="font-black text-[#111827]">
                {formatPrice(evidence.market.fairPriceMin)} - {formatPrice(evidence.market.fairPriceMax)}
              </span>
            </div>
            {evidence.market.alternativeSellers.map((seller) => (
              <div key={seller.name} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-bold text-[#111827]">{seller.name}</p>
                  <p className="text-xs text-[#6B7280]">Magaza puani {seller.rating.toFixed(1)}</p>
                </div>
                <span className={seller.price === bestPrice ? "font-black text-[#16803A]" : "font-black text-[#111827]"}>
                  {formatPrice(seller.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
