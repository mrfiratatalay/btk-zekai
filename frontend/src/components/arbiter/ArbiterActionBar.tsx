"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ArbiterActionBar() {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-[#6B7280]">
          Bu karar öneri niteliğindedir. Taraflar insan değerlendirmesi talep
          edebilir.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-xl bg-[#5B2EFF] font-bold text-white hover:bg-[#4C1D95]"
            onClick={() => toast.success("Çözüm kabul edildi")}
          >
            Çözümü kabul et
          </Button>
          <Button
            variant="outline"
            className="rounded-xl bg-white font-bold"
            onClick={() => toast.info("Dosya insan desteğine taşındı")}
          >
            İnsan desteğine taşı
          </Button>
          <Button
            variant="ghost"
            className="rounded-xl font-bold"
            onClick={() => toast.info("Taraf iletişim akışı açılacak")}
          >
            Tarafla iletişime geç
          </Button>
        </div>
      </div>
    </section>
  );
}
