import { BuyerFitDialog } from '@/components/shop/BuyerFitDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/mock-data/products'
import type { Product } from '@/types/product'
import {
    Bluetooth,
    Bot,
    ChevronRight,
    FileSearch,
    Gauge,
    Info,
    Mic,
    PackageCheck,
    Repeat2,
    ShieldCheck,
    Star,
    Truck,
    Zap,
} from 'lucide-react'

const featureIconByKey = [
  { match: 'bluetooth', icon: Bluetooth },
  { match: 'baglanti', icon: Bluetooth },
  { match: 'mikrofon', icon: Mic },
  { match: 'gecikme', icon: Zap },
  { match: 'pil', icon: Zap },
  { match: 'garanti', icon: ShieldCheck },
  { match: 'kullanim', icon: Repeat2 },
] as const

function getFeatureIcon(label: string) {
  const normalized = label.toLocaleLowerCase('tr-TR')
  return (
    featureIconByKey.find((item) => normalized.includes(item.match))?.icon ??
    Info
  )
}

function getAiSignals(product: Product) {
  return [
    {
      label: `${product.reviewCount.toLocaleString('tr-TR')} yorum tarandı`,
      value: 'Tekrar eden beklenti sinyalleri çıkarıldı',
      icon: FileSearch,
    },
    {
      label: 'Fiyat geçmişi kontrol edildi',
      value: product.discountPercent
        ? 'İndirim doğrulanmalı'
        : 'Pazarla kıyaslandı',
      icon: Gauge,
    },
    {
      label: 'İade sinyalleri bulundu',
      value: `${product.category} kategorisine göre değerlendirildi`,
      icon: Repeat2,
    },
    {
      label: 'Satıcı güveni hesaplandı',
      value: 'Listeleme ve yorum kalitesi birlikte okundu',
      icon: ShieldCheck,
    },
  ]
}

export function ProductInfoPanel({ product }: { product: Product }) {
  const featureHighlights = Object.entries(product.features)
    .slice(0, 5)
    .map(([key, value]) => ({
      label: `${key}: ${value}`,
      icon: getFeatureIcon(key),
    }))
  const aiSignals = getAiSignals(product)

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#111827] lg:text-4xl">
          {product.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-bold text-[#111827]">{product.brand}</span>
          <Badge className="rounded-md bg-[#16A34A] px-2 py-1 text-white">
            9.2
          </Badge>
          <span className="text-[#6B7280]">Satıcı:</span>
          <span className="font-bold text-[#2563EB]">{product.sellerName}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-1 font-semibold text-[#111827]">
            <Star className="size-4 fill-[#FFB020] text-[#FFB020]" />
            {product.rating.toFixed(1)}
          </span>
          <span className="text-[#6B7280]">
            ({product.reviewCount.toLocaleString('tr-TR')} Değerlendirme)
          </span>
          <span className="font-semibold text-[#2563EB]">142 Sorulan Soru</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-4xl font-extrabold tracking-tight text-[#FF6000]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice ? (
            <span className="text-lg font-semibold text-[#8A8F98] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
          {product.discountPercent ? (
            <Badge className="rounded-md bg-[#DC2626] px-2.5 py-1 text-white">
              %{product.discountPercent} indirim
            </Badge>
          ) : null}
        </div>
        {product.originalPrice ? (
          <p className="w-fit rounded-full bg-[#E8F7EC] px-3 py-1 text-sm font-semibold text-[#16803A]">
            Kazancınız: {formatPrice(product.originalPrice - product.price)}
          </p>
        ) : null}
        <button
          type="button"
          className="flex items-center gap-1 text-sm font-bold text-[#111827] hover:text-[#FF6000]"
        >
          Peşin fiyatına 3 taksit
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
        <div className="grid gap-3 text-sm text-[#374151]">
          <div className="flex items-center gap-3">
            <Truck className="size-5 text-[#16803A]" />
            <span>Bugün kargoda, 2 saatte sipariş verirseniz</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-[#334155]" />
            <span>15 gün içinde ücretsiz iade</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button className="h-14 rounded-xl bg-[#FF6000] text-lg font-extrabold text-white shadow-sm hover:bg-[#E65700]">
          <PackageCheck className="size-5" />
          Sepete Ekle
        </Button>
        <BuyerFitDialog product={product} />
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm md:grid-cols-3">
        <div className="flex items-center gap-2">
          <PackageCheck className="size-4 text-[#334155]" />
          <span>
            Stok:{' '}
            <strong className="text-[#16803A]">{product.stock} adet</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Mic className="size-4 text-[#334155]" />
          <span>
            Renk: <strong>Siyah</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[#334155]" />
          <span>
            Garanti: <strong className="text-[#16803A]">2 yıl</strong>
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="font-extrabold text-[#111827]">Öne çıkan özellikler</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {featureHighlights.map((feature) => {
            const Icon = feature.icon

            return (
              <div key={feature.label} className="text-center">
                <Icon className="mx-auto size-6 text-[#334155]" />
                <p className="mt-2 text-xs font-medium leading-5 text-[#111827]">
                  {feature.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#5B2EFF] text-white">
            <Bot className="size-5" />
          </span>
          <div>
            <h2 className="font-extrabold text-[#111827]">
              Zekai karar motoru bu ürün için hazır
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#3B1B9A]">
              Satın almadan önce ihtiyacını yaz; sistem yorum, fiyat, iade ve
              satıcı sinyallerini kişisel pişmanlık riskine dönüştürsün.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {aiSignals.map((signal) => {
            const Icon = signal.icon

            return (
              <div
                key={signal.label}
                className="rounded-lg border border-[#DDD6FE] bg-white px-3 py-2"
              >
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#5B2EFF]">
                  <Icon className="size-3.5" />
                  {signal.label}
                </div>
                <p className="mt-1 text-xs font-semibold text-[#374151]">
                  {signal.value}
                </p>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#111827]">
          <FileSearch className="size-4 text-[#FF6000]" />
          Bu ürün senin ihtiyacına göre analiz edilebilir.
        </div>
      </div>
    </section>
  )
}
