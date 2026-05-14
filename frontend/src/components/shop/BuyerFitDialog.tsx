'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatPrice } from '@/lib/mock-data/products'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'
import {
    Bot,
    CircleDollarSign,
    Clock,
    Gift,
    Mic,
    Ruler,
    ShieldCheck,
    Star,
    UserRound,
    Volume2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const maxNeedLength = 500

type QuickOption = {
  label: string;
  icon: LucideIcon;
};

function getQuickOptions(product: Product): QuickOption[] {
  const category = product.category.toLocaleLowerCase("tr-TR");
  const featureText = Object.keys(product.features).join(" ").toLocaleLowerCase("tr-TR");
  const options: QuickOption[] = [
    { label: "Kendim için", icon: UserRound },
    { label: "Hediye", icon: Gift },
    { label: "Bütçem sınırlı", icon: CircleDollarSign },
    { label: "Uzun kullanım", icon: Clock },
    { label: "İlk kez alıyorum", icon: Star },
  ];

  if (featureText.includes("mikrofon")) {
    options.splice(3, 0, { label: "Mikrofon önemli", icon: Mic });
  } else if (category.includes("ev") || category.includes("mobilya")) {
    options.splice(3, 0, { label: "Ölçü ve konfor önemli", icon: Ruler });
  } else if (category.includes("spor")) {
    options.splice(3, 0, { label: "Beden uyumu önemli", icon: Ruler });
  } else if (category.includes("bebek")) {
    options.splice(3, 0, { label: "Güvenlik önemli", icon: ShieldCheck });
  } else {
    options.splice(3, 0, { label: "Kalite riski düşük olsun", icon: ShieldCheck });
  }

  if (featureText.includes("ses") || featureText.includes("db")) {
    options.push({ label: "Sessiz/konforlu çalışsın", icon: Volume2 });
  }

  return options;
}

function getNeedPlaceholder(product: Product) {
  const category = product.category.toLocaleLowerCase("tr-TR");

  if (product.features.Mikrofon || product.features["Gecikme modu"]) {
    return "Online ders ve oyun için kulaklık arıyorum. Mikrofonu iyi olsun, kulağımı rahatsız etmesin, bütçem 1500 TL.";
  }

  if (category.includes("ev")) {
    return "Evde uzun süre kullanacağım. Ölçüsü uygun olsun, iade riski düşük olsun ve fiyatı mantıklı olsun.";
  }

  if (category.includes("spor")) {
    return "Günlük yürüyüşte kullanacağım. Kalıbı rahat olsun, ayağımı vurmasın ve iade riski düşük olsun.";
  }

  if (category.includes("bebek")) {
    return "Bebek takibi için güvenilir ve kolay kurulan bir ürün arıyorum. Destek ve iade süreci net olsun.";
  }

  return "Bu ürünü almayı düşünüyorum. Beklentilerime uygun mu, fiyatı ve iade riski mantıklı mı görmek istiyorum.";
}

export function BuyerFitDialog({ product, triggerClassName }: { product: Product; triggerClassName?: string }) {
  const router = useRouter()
  const [need, setNeed] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const quickOptions = getQuickOptions(product)

  function toggleOption(option: string) {
    setSelectedOptions((current) => {
      const exists = current.includes(option)
      const next = exists
        ? current.filter((item) => item !== option)
        : [...current, option]

      setNeed((text) => {
        if (exists || text.includes(option)) {
          return text
        }

        return text ? `${text} ${option}.` : `${option}.`
      })

      return next
    })
  }

  function startAnalysis() {
    const trimmedNeed = need.trim();

    if (!trimmedNeed) {
      toast.error('Analize başlamak için ihtiyacını kısaca yazmalısın.')
      return
    }

    const params = new URLSearchParams({ need: trimmedNeed })
    router.push(`/buyer/analysis/${product.id}?${params.toString()}`)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={triggerClassName ?? "h-12 flex-1 rounded-xl bg-gradient-to-r from-[#5B2EFF] to-[#7C2DFF] text-base font-extrabold text-white shadow-sm hover:from-[#4C1FDC] hover:to-[#6D28D9]"}>
          <Bot className="size-5" />
          Bana Uygun mu?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border-[#E5E7EB] bg-white p-0 shadow-2xl sm:max-w-[560px]">
        <div className="space-y-5 p-5 sm:p-6">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-[#111827]">
              Sana uygun mu?
            </DialogTitle>
            <DialogDescription className="max-w-md text-sm leading-6 text-[#6B7280]">
              Kullanım amacını ve beklentilerini kısaca anlat, karar motoru bu
              ürünü senin senaryona göre değerlendirsin.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3 sm:grid-cols-[72px_1fr_auto] sm:items-center">
            <div className="relative size-[72px] shrink-0 overflow-hidden rounded-lg bg-white">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="72px"
                className="object-contain p-2"
              />
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-extrabold leading-5 text-[#111827]">
                {product.title}
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Satıcı: {product.sellerName}
              </p>
            </div>
            <p className="text-lg font-extrabold text-[#FF6000]">
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-extrabold text-[#111827]"
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
                className="min-h-30 resize-none rounded-xl border-[#D1D5DB] bg-white p-4 pb-8 text-sm leading-6 shadow-sm focus-visible:border-[#FF6000] focus-visible:ring-[#FF6000]/20"
                placeholder={getNeedPlaceholder(product)}
              />
              <span className="absolute bottom-2.5 right-4 text-xs text-[#6B7280]">
                {need.length}/{maxNeedLength}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-extrabold text-[#111827]">
              Hızlı seçimler
            </p>
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((option) => {
                const selected = selectedOptions.includes(option.label)
                const Icon = option.icon

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => toggleOption(option.label)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition',
                      selected
                        ? 'border-[#FF6000] bg-[#FFF4EC] text-[#FF6000]'
                        : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#FF6000] hover:text-[#FF6000]',
                    )}
                  >
                    <Icon className="size-4" />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#F1F5F9] pt-4">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="h-11 rounded-xl px-4 font-bold"
              >
                Vazgeç
              </Button>
            </DialogClose>
            <Button
              onClick={startAnalysis}
              className="h-11 rounded-xl bg-[#FF6000] px-6 text-base font-extrabold text-white shadow-sm hover:bg-[#E65700]"
            >
              Analizi Başlat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
