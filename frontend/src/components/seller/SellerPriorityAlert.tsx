import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { sellerStore } from "@/lib/mock-data/seller";
import { Button } from "@/components/ui/button";

export function SellerPriorityAlert() {
  return (
    <section className="overflow-hidden rounded-xl border border-[#FCD34D] bg-[#FFFBEB] p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]">
            <AlertTriangle className="size-6" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#111827]">
              {sellerStore.urgentProducts} ürününde acil iyileştirme fırsatı var
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-[#78350F]">
              En kritik ürün PulseWave Pro X1. Yüksek iade oranı, mikrofon
              şikâyetleri ve fiyat algısı nedeniyle aylık yaklaşık ₺4.200 kâr
              kaybı oluşuyor.
            </p>
          </div>
        </div>

        <Button asChild className="h-11 rounded-xl bg-[#FF6000] font-bold text-white hover:bg-[#E65700]">
          <Link href="/seller/product/bluetooth-kulaklik-pro-x1">
            Öncelikli ürünü incele
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
