import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/mock-data/products";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: Product }) {
  const savings =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : product.discountPercent;

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <article className="grid h-full grid-cols-[140px_minmax(0,1fr)] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition hover:border-[#FF6000]/30 hover:shadow-md sm:grid-cols-1">
        <div className="relative min-h-[180px] overflow-hidden bg-white p-4 sm:h-[210px]">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain p-4 transition duration-300 group-hover:scale-105"
          />
          <span
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] shadow-sm transition hover:text-[#FF6000]"
            aria-hidden="true"
          >
            <Heart className="size-4" />
          </span>
          {product.discountPercent ? (
            <Badge className="absolute left-3 top-3 rounded-md bg-[#DC2626] px-2.5 py-1 text-xs text-white">
              %{product.discountPercent} indirim
            </Badge>
          ) : null}
        </div>

        <div className="space-y-3 p-4">
          <div className="space-y-1.5">
            <p className="truncate text-xs font-medium text-[#6B7280]">
              {product.brand}
            </p>
            <h3 className="line-clamp-2 min-h-10 text-[15px] font-semibold leading-5 text-[#111827]">
              {product.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Star className="size-4 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-semibold text-[#111827]">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-[#6B7280]">({product.reviewCount} yorum)</span>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-xl font-bold text-[#FF6000]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice ? (
                <span className="text-xs font-medium text-[#9CA3AF] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              ) : null}
            </div>
            {savings ? (
              <p className="text-xs font-semibold text-[#16A34A]">
                %{savings} tasarruf
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-2 text-xs text-[#6B7280]">
            {product.category}
          </div>
        </div>
      </article>
    </Link>
  );
}
