"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Share2 } from "lucide-react";
import type { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductGallery({ product }: { product: Product }) {
  const [selected, setSelected] = useState(product.image);
  const images = Array.from(new Set([product.image, ...product.thumbnails]));
  const idx = Math.max(0, images.indexOf(selected));

  function shift(offset: number) {
    setSelected(images[(idx + offset + images.length) % images.length]);
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
        {product.discountPercent ? (
          <Badge className="absolute left-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white shadow">
            %{product.discountPercent}
          </Badge>
        ) : null}

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <Button variant="outline" size="icon"
            className="size-9 rounded-full border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
            aria-label="Favorilere ekle">
            <Heart className="size-4 text-slate-600" />
          </Button>
          <Button variant="outline" size="icon"
            className="size-9 rounded-full border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
            aria-label="Paylaş">
            <Share2 className="size-4 text-slate-600" />
          </Button>
        </div>

        <Image src={selected} alt={product.title} fill priority
          sizes="(max-width: 1024px) 100vw, 480px"
          className="object-contain p-8 transition-opacity duration-200" />

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

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {images.map((img, i) => (
              <button key={img} type="button" onClick={() => setSelected(img)}
                className={cn("size-1.5 rounded-full transition-all",
                  img === selected ? "bg-slate-800 w-4" : "bg-slate-400/60")}
                aria-label={`Görsel ${i + 1}`} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((img, i) => (
            <button key={img} type="button" onClick={() => setSelected(img)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 bg-slate-50 transition-all",
                img === selected
                  ? "border-slate-800"
                  : "border-transparent hover:border-slate-200",
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
