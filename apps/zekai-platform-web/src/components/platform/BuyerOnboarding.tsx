"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/lib/buyer-store";

interface BuyerOnboardingProps {
  onComplete: () => void;
}

export function BuyerOnboarding({ onComplete }: BuyerOnboardingProps) {
  const [name, setName] = useState("");
  const saveProfile = useProfileStore((s) => s.save);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveProfile({ name: name.trim() || "Alıcı", onboarded: true });
    } catch {
      toast.error("Profil kaydedilemedi, daha sonra tekrar dene.");
    }
    onComplete();
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl"
        >
          {/* Logo */}
          <div className="mb-6 flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#adff41]/10 border border-[#adff41]/30">
              <Zap className="size-5 text-[#5a8a00] dark:text-[#adff41]" />
            </div>
            <span className="text-sm font-black">
              Zek<span className="text-[#5a8a00] dark:text-[#adff41]">AI</span>
            </span>
          </div>

          <h1 className="text-xl font-black text-foreground">
            Alıcı Karar Merkezine hoş geldin! 👋
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Zekai, ürün analizlerini kaydeder, karşılaştırır ve alışveriş
            kararlarını yönetmene yardımcı olur.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="buyer-name"
                className="mb-1.5 block text-xs font-semibold text-muted-foreground"
              >
                Adın ne? (İsteğe bağlı)
              </label>
              <input
                id="buyer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Fırat"
                maxLength={40}
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-[#adff41]/50 focus:bg-[#adff41]/5 transition-all"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#adff41] text-[#0a0a0f] font-bold hover:bg-[#9aef30] rounded-xl"
            >
              <Zap className="mr-2 size-4" />
              Başla
            </Button>
          </form>

          <p className="mt-4 text-center text-[11px] text-muted-foreground/50">
            Profilin hesabına kaydedilir.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
