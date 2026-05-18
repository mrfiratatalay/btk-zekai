"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/api/products";
import { Badge } from "@/components/ui/badge";
import { useFavoritesStore } from "@/lib/store/favorites-store";

export function ProductCard({ product }: { product: Product }) {
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));

  const savings =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : product.discountPercent;

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  }

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <article className="grid h-full grid-cols-[140px_minmax(0,1fr)] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition hover:border-[#FF6000]/30 hover:shadow-md sm:grid-cols-1">
        <div className="relative min-h-[180px] overflow-hidden bg-white p-4 sm:h-[210px]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-contain p-4 transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[#D1D5DB]">
              <svg className="size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Favorites button */}
          <button
            onClick={handleFavorite}
            className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border shadow-sm transition ${
              isFavorite
                ? "border-[#FF6000] bg-orange-50 text-[#FF6000]"
                : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#FF6000] hover:text-[#FF6000]"
            }`}
            aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Heart className={`size-4 ${isFavorite ? "fill-[#FF6000]" : ""}`} />
          </button>

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

          <div className="space-y-1">
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
        </div>
      </article>
    </Link>
  );
}
