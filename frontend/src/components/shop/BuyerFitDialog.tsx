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
    CheckCircle2,
    CircleDollarSign,
    Clock,
    Dumbbell,
    Gift,
    Home,
    Mic,
    Star,
    UserRound,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const maxNeedLength = 500

const commonQuickOptions = [
  { label: 'Kendim için', icon: UserRound },
  { label: 'Hediye', icon: Gift },
  { label: 'Bütçem sınırlı', icon: CircleDollarSign },
  { label: 'İlk kez alıyorum', icon: Star },
]

type QuickOption = (typeof commonQuickOptions)[number]

const categoryQuickOptions: Record<string, QuickOption[]> = {
  Elektronik: [
    { label: 'Mikrofon önemli', icon: Mic },
    { label: 'Uzun kullanım', icon: Clock },
  ],
  'Ev & Yasam': [
    { label: 'Uzun kullanım', icon: Clock },
    { label: 'Ev/ofis için', icon: Home },
  ],
  'Spor & Outdoor': [
    { label: 'Rahatlık önemli', icon: CheckCircle2 },
    { label: 'Spor için', icon: Dumbbell },
  ],
  Mutfak: [
    { label: 'Sık kullanacağım', icon: Clock },
    { label: 'Kolay temizlik', icon: CheckCircle2 },
  ],
} satisfies Record<string, Array<{ label: string; icon: typeof UserRound }>>

export function BuyerFitDialog({ product }: { product: Product }) {
  const router = useRouter()
  const [need, setNeed] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const quickOptions = [
    ...commonQuickOptions.slice(0, 3),
    ...(categoryQuickOptions[product.category] ?? [
      { label: 'Uzun kullanım', icon: Clock },
    ]),
    commonQuickOptions[3],
  ]

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
    if (!need.trim()) {
      toast.error('Analize başlamak için ihtiyacını kısaca yazmalısın.')
      return
    }

    const query = new URLSearchParams({ need: need.trim() })
    router.push(`/buyer/analysis/${product.id}?${query.toString()}`)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-14 flex-1 rounded-xl bg-gradient-to-r from-[#5B2EFF] to-[#7C2DFF] text-lg font-extrabold text-white shadow-sm hover:from-[#4C1FDC] hover:to-[#6D28D9]">
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
            <DialogDescription className="text-sm leading-6 text-[#6B7280]">
              Ne için kullanacağını yaz. Zekai bu ürünü senin beklentine göre
              yorum, fiyat ve iade sinyalleriyle kontrol eder.
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
                placeholder={
                  product.category === 'Ev & Yasam'
                    ? 'Bilgisayar masam için alıyorum. Uzun kullanımda rahat olsun, sağlam dursun.'
                    : product.category === 'Spor & Outdoor'
                      ? 'Günlük yürüyüş için alıyorum. Rahat olsun, ayağımı vurmasın.'
                      : 'Ne için kullanacağını ve senin için önemli olan 2-3 şeyi yaz.'
                }
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
