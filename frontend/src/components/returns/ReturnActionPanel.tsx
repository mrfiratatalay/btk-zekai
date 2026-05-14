"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReturnActionPanel() {
  const router = useRouter();
  const [response, setResponse] = useState("");

  function acceptReturn() {
    toast.success("İade kabul edildi");
  }

  function disputeReturn() {
    if (!response.trim()) {
      toast.warning("İtiraz açıklamasını yazmalısın.");
      return;
    }

    toast.success("İtiraz hakem incelemesine taşındı");
    router.push("/disputes/demo-case-1");
  }

  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-extrabold text-[#111827]">Satıcı cevabı</h2>
      <p className="mt-1 text-sm leading-6 text-[#6B7280]">
        Talebi kabul edebilir veya kanıt açıklamasıyla hakem incelemesine
        taşıyabilirsin.
      </p>
      <Textarea
        value={response}
        onChange={(event) => setResponse(event.target.value)}
        placeholder="İtiraz gerekçeni ve varsa kanıt özetini yaz."
        className="mt-4 min-h-32 rounded-xl border-[#E5E7EB] bg-[#F8FAFC]"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="h-11 rounded-xl border-[#16A34A] bg-white font-bold text-[#166534] hover:bg-[#F0FDF4]"
          onClick={acceptReturn}
        >
          İadeyi kabul et
        </Button>
        <Button
          className="h-11 rounded-xl bg-[#5B2EFF] font-bold text-white hover:bg-[#4C1D95]"
          onClick={disputeReturn}
        >
          İtirazı gönder ve hakeme taşı
        </Button>
      </div>
    </section>
  );
}
