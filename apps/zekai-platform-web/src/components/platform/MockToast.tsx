"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useMockStore } from "@/lib/store/mock-store";

export function MockToast() {
  const isMockMode = useMockStore((s) => s.isMockMode);
  const toastShown = useMockStore((s) => s.toastShown);
  const markToastShown = useMockStore((s) => s.markToastShown);

  useEffect(() => {
    if (isMockMode && !toastShown) {
      toast.warning("AI Demo Modu Aktif", {
        description:
          "Gemini API limiti aşıldı. Gösterilen yanıtlar gerçek AI analizi değil, demo verisidir.",
        duration: 8000,
      });
      markToastShown();
    }
  }, [isMockMode, toastShown, markToastShown]);

  return null;
}
