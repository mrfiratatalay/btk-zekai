"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bot,
  CircleDollarSign,
  Clock,
  Gift,
  Mic,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/mock-data/products";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const maxNeedLength = 500;

const quickOptions = [
  { label: "Kendim için", icon: UserRound },
  { label: "Hediye", icon: Gift },
  { label: "Bütçem sınırlı", icon: CircleDollarSign },
  { label: "Mikrofon önemli", icon: Mic },
  { label: "Uzun kullanım", icon: Clock },
  { label: "İlk kez alıyorum", icon: Star },
];

export function BuyerFitDialog({ product }: { product: Product }) {
  const router = useRouter();
  const [need, setNeed] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  function toggleOption(option: string) {
    setSelectedOptions((current) => {
      const exists = current.includes(option);
      const next = exists
        ? current.filter((item) => item !== option)
        : [...current, option];

      setNeed((text) => {
        if (exists || text.includes(option)) {
          return text;
        }

        return text ? `${text} ${option}.` : `${option}.`;
      });

      return next;
    });
  }

  function startAnalysis() {
    if (!need.trim()) {
      toast.error("Analize başlamak için ihtiyacını kısaca yazmalısın.");
      return;
    }

    router.push("/buyer/analysis/demo-analysis-1");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-14 flex-1 rounded-xl bg-gradient-to-r from-[#5B2EFF] to-[#7C2DFF] text-lg font-extrabold text-white shadow-sm hover:from-[#4C1FDC] hover:to-[#6D28D9]">
          <Bot className="size-5" />
          Bana Uygun mu?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border-[#E5E7EB] bg-white p-0 shadow-2xl sm:max-w-[640px]">
        <div className="space-y-6 p-7">
          <DialogHeader className="items-center space-y-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-[#FFF4EC] text-[#FF6000]">
              <Sparkles className="size-7" />
            </span>
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-[#111827]">
              Bu ürün sana uygun mu, birlikte bakalım.
            </DialogTitle>
            <DialogDescription className="max-w-md text-base leading-7 text-[#6B7280]">
              Kullanım amacını ve beklentilerini kısaca anlat, sana en doğru
              öneriyi sunalım.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:grid-cols-[92px_1fr_auto] sm:items-center">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-[#F7F7F7]">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="96px"
                className="object-contain p-2"
              />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 text-base font-extrabold leading-6 text-[#111827]">
                {product.title}
              </p>
              <p className="mt-2 text-sm text-[#6B7280]">
                Satıcı: {product.sellerName}
              </p>
            </div>
            <p className="text-xl font-extrabold text-[#FF6000]">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="space-y-2">
            <label
              className="text-base font-extrabold text-[#111827]"
              htmlFor="buyer-need"
            >
              Bu ürünü ne için kullanacaksın?
            </label>
            <div className="relative">
              <Textarea
                id="buyer-need"
                value={need}
                maxLength={maxNeedLength}
                onChange={(event) => setNeed(event.target.value)}
                className="min-h-40 resize-none rounded-xl border-[#D1D5DB] bg-white p-4 pb-9 text-base leading-7 shadow-sm focus-visible:border-[#FF6000] focus-visible:ring-[#FF6000]/20"
                placeholder="Online ders ve oyun için kulaklık arıyorum. Mikrofonu iyi olsun, kulağımı rahatsız etmesin, bütçem 1500 TL."
              />
              <span className="absolute bottom-3 right-4 text-sm text-[#6B7280]">
                {need.length}/{maxNeedLength}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-base font-extrabold text-[#111827]">
              Hızlı seçimler
            </p>
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((option) => {
                const selected = selectedOptions.includes(option.label);
                const Icon = option.icon;

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => toggleOption(option.label)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition",
                      selected
                        ? "border-[#FF6000] bg-[#FFF4EC] text-[#FF6000]"
                        : "border-[#E5E7EB] bg-white text-[#374151] hover:border-[#FF6000] hover:text-[#FF6000]",
                    )}
                  >
                    <Icon className="size-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-2">
            <DialogClose asChild>
              <Button variant="ghost" className="h-12 rounded-xl px-5 font-bold">
                Vazgeç
              </Button>
            </DialogClose>
            <Button
              onClick={startAnalysis}
              className="h-12 rounded-xl bg-[#FF6000] px-8 text-base font-extrabold text-white shadow-sm hover:bg-[#E65700]"
            >
              Analizi Başlat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
