"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileImage } from "lucide-react";
import { toast } from "sonner";
import type { ReturnReasonKey } from "@/types/return";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const reasons: Array<{ key: ReturnReasonKey; label: string }> = [
  { key: "damaged", label: "Hasarlı geldi" },
  { key: "not_as_expected", label: "Beklediğim gibi değil" },
  { key: "wrong_product", label: "Yanlış ürün" },
  { key: "low_quality", label: "Kalitesiz" },
  { key: "other", label: "Diğer" },
];

export function ReturnRequestForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<ReturnReasonKey>("damaged");
  const [description, setDescription] = useState("");

  function submitReturnRequest() {
    if (!description.trim()) {
      toast.warning("İade açıklamasını kısaca yazmalısın.");
      return;
    }

    toast.success("İade talebi alındı");
    router.push("/account/returns/demo-return-1");
  }

  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#111827]">İade talebi aç</h2>
          <p className="mt-1 text-sm leading-6 text-[#6B7280]">
            Sebebi seç, durumu kısaca anlat ve varsa kanıt görseli ekle.
          </p>
        </div>
        <div className="rounded-lg bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-[#6B7280]">
          Sipariş: {orderId}
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <p className="text-sm font-extrabold text-[#111827]">İade sebebi</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {reasons.map((reason) => (
              <button
                key={reason.key}
                type="button"
                onClick={() => setSelectedReason(reason.key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-bold transition",
                  selectedReason === reason.key
                    ? "border-[#FF6000] bg-[#FFF4EC] text-[#FF6000]"
                    : "border-[#E5E7EB] bg-white text-[#374151] hover:border-[#FF6000]/40",
                )}
              >
                {reason.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-extrabold text-[#111827]">Açıklama</p>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ürünle ilgili yaşadığın sorunu kısa ve net anlat."
            className="mt-2 min-h-32 rounded-xl border-[#E5E7EB] bg-[#F8FAFC]"
          />
        </div>

        <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-[#F8FAFC] p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-white text-[#6B7280]">
              <FileImage className="size-5" />
            </span>
            <div>
              <p className="font-extrabold text-[#111827]">Fotoğraf ekleme alanı</p>
              <p className="text-sm text-[#6B7280]">
                Kanıt fotoğrafları talep dosyasına eklenir.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={submitReturnRequest}
          className="h-11 rounded-xl bg-[#FF6000] px-6 font-bold text-white hover:bg-[#E65700]"
        >
          Talebi gönder
        </Button>
      </div>
    </section>
  );
}
