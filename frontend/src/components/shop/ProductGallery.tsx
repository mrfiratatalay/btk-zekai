"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Share2, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductGallery({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(product.image);
  const images = Array.from(new Set([product.image, ...product.thumbnails]));
  const selectedIndex = Math.max(0, images.indexOf(selectedImage));

  function selectByOffset(offset: number) {
    const nextIndex = (selectedIndex + offset + images.length) % images.length;
    setSelectedImage(images[nextIndex]);
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#F4F4F4] p-6">
        {product.discountPercent ? (
          <Badge className="absolute left-4 top-4 z-10 rounded-md bg-[#DC2626] px-3 py-1.5 text-sm text-white">
            %{product.discountPercent} indirim
          </Badge>
        ) : null}
        <div className="absolute right-4 top-4 z-10 grid gap-3">
          <Button
            variant="outline"
            size="icon-lg"
            className="rounded-full border-[#E5E7EB] bg-white shadow-sm"
            aria-label="Favorilere ekle"
          >
            <Heart className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            className="rounded-full border-[#E5E7EB] bg-white shadow-sm"
            aria-label="Paylaş"
          >
            <Share2 className="size-5" />
          </Button>
        </div>
        <Image
          src={selectedImage}
          alt={product.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 380px"
          className="object-contain p-8"
        />
        <Button
          variant="outline"
          size="icon-lg"
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border-[#E5E7EB] bg-white shadow-sm"
          onClick={() => selectByOffset(-1)}
          aria-label="Önceki görsel"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <Button
          variant="outline"
          size="icon-lg"
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border-[#E5E7EB] bg-white shadow-sm"
          onClick={() => selectByOffset(1)}
          aria-label="Sonraki görsel"
        >
          <ChevronRight className="size-5" />
        </Button>
        <Button
          variant="outline"
          className="absolute bottom-4 right-4 z-10 h-10 rounded-lg border-[#E5E7EB] bg-white px-4 font-bold shadow-sm"
        >
          <SlidersHorizontal className="size-4" />
          Tüm Özellikler
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {images.slice(0, 4).map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => setSelectedImage(image)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-2 transition",
              selectedImage === image && "border-[#FF6000] ring-2 ring-[#FF6000]/20",
            )}
            aria-label="Ürün görselini seç"
          >
            <Image
              src={image}
              alt={product.title}
              fill
              sizes="120px"
              className="object-contain p-2"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
