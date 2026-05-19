"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Heart, Share2 } from "lucide-react";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavoritesStore } from "@/lib/store/favorites-store";

export function ProductGallery({ product }: { product: Product }) {
  const images = Array.from(new Set([product.image, ...product.thumbnails])).filter(Boolean);
  const [selected, setSelected] = useState(images[0] ?? "");
  const [copied, setCopied] = useState(false);
  const idx = Math.max(0, images.indexOf(selected));

  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));

  function shift(offset: number) {
    setSelected(images[(idx + offset + images.length) % images.length]);
  }

  function handleFavorite() {
    toggleFavorite(product.id);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-3">
      {/* Ana görsel */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
        {/* Favori + Paylaş */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFavorite}
            className={`size-9 rounded-full shadow-sm backdrop-blur-sm transition ${
              isFavorite
                ? "border-[#FF6000] bg-orange-50 text-[#FF6000] hover:bg-orange-50"
                : "border-slate-200 bg-white/90 text-slate-600 hover:bg-white"
            }`}
            aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <Heart className={`size-4 ${isFavorite ? "fill-[#FF6000]" : ""}`} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="size-9 rounded-full border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
            aria-label="Bağlantıyı kopyala"
          >
            {copied ? <Check className="size-4 text-emerald-500" /> : <Share2 className="size-4 text-slate-600" />}
          </Button>
        </div>

        {selected && (
          <Image src={selected} alt={product.title} fill priority
            sizes="(max-width: 1024px) 100vw, 480px"
            className="object-contain p-8 transition-opacity duration-200" />
        )}

        {images.length > 1 && (
          <>
            <Button variant="outline" size="icon"
              onClick={() => shift(-1)}
              className="absolute left-3 top-1/2 z-10 size-9 -translate-y-1/2 rounded-full border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
              aria-label="Önceki">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon"
              onClick={() => shift(1)}
              className="absolute right-3 top-1/2 z-10 size-9 -translate-y-1/2 rounded-full border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
              aria-label="Sonraki">
              <ChevronRight className="size-4" />
            </Button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((img, i) => (
              <button key={img} type="button" onClick={() => setSelected(img)}
                className={cn("size-1.5 rounded-full transition-all",
                  img === selected ? "w-4 bg-slate-800" : "bg-slate-400/60")}
                aria-label={`Görsel ${i + 1}`} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail'lar */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, i) => (
            <button key={img} type="button" onClick={() => setSelected(img)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 bg-slate-50 transition-all",
                img === selected ? "border-slate-800" : "border-transparent hover:border-slate-200",
              )}>
              <Image src={img} alt={`${product.title} görsel ${i + 1}`}
                fill sizes="100px" className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
