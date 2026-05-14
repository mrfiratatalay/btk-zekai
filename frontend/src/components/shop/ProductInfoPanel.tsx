import { BuyerFitDialog } from '@/components/shop/BuyerFitDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/mock-data/products'
import type { Product } from '@/types/product'
import {
    BatteryCharging,
    Bluetooth,
    Box,
    ChevronRight,
    Info,
    Mic,
    PackageCheck,
    PackageSearch,
    ShieldCheck,
    Star,
    Truck,
    Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

function getFeatureIcon(label: string): LucideIcon {
  const normalized = label.toLocaleLowerCase("tr-TR");

  if (normalized.includes("bluetooth") || normalized.includes("baglanti")) {
    return Bluetooth;
  }

  if (normalized.includes("pil") || normalized.includes("sarj")) {
    return BatteryCharging;
  }

  if (normalized.includes("mikrofon") || normalized.includes("ses")) {
    return Mic;
  }

  if (normalized.includes("gecikme") || normalized.includes("guc")) {
    return Zap;
  }

  if (normalized.includes("garanti") || normalized.includes("dayanim")) {
    return ShieldCheck;
  }

  return Info;
}


function getQuestionCount(product: Product) {
  return Math.max(18, Math.round(product.reviewCount / 10));
}

function getTechnicalHighlights(product: Product) {
  return Object.entries(product.features).slice(0, 5);
}

export function ProductInfoPanel({ product }: { product: Product }) {
  const technicalHighlights = getTechnicalHighlights(product);
  const questionCount = getQuestionCount(product);
  const savings =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;


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
          <span className="font-semibold text-[#2563EB]">
            {questionCount.toLocaleString("tr-TR")} sorulan soru
          </span>
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
        {savings ? (
          <p className="w-fit rounded-full bg-[#E8F7EC] px-3 py-1 text-sm font-semibold text-[#16803A]">
            Kazancınız: {formatPrice(savings)}
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
            <span>{product.cargoText}</span>
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

      <div className="grid gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <PackageCheck className="size-4 text-[#334155]" />
          <span>
            Stok:{' '}
            <strong className="text-[#16803A]">{product.stock} adet</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Box className="size-4 text-[#334155]" />
          <span>
            Kategori: <strong>{product.category}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <PackageSearch className="size-4 text-[#334155]" />
          <span>
            Analiz: <strong className="text-[#5B2EFF]">Uygun</strong>
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="font-extrabold text-[#111827]">Teknik öne çıkanlar</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {technicalHighlights.map(([label, value]) => {
            const Icon = getFeatureIcon(label);

            return (
              <div key={label} className="text-center">
                <Icon className="mx-auto size-6 text-[#334155]" />
                <p className="mt-2 text-xs font-extrabold leading-5 text-[#111827]">
                  {label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#6B7280]">{value}</p>
              </div>
            )
          })}
        </div>
      </div>

    </section>
  )
}
