"use client";

import Image from "next/image";
import { Check, PackagePlus } from "lucide-react";
import { useState } from "react";
import type { PublicProductBundle } from "@/lib/api/products";
import { formatPrice } from "@/lib/api/products";
import { useCartStore } from "@/lib/store/cart-store";

export function ProductBundleCard({ bundle }: { bundle: PublicProductBundle }) {
  const [added, setAdded] = useState(false);
  const addBundle = useCartStore((s) => s.addBundle);

  async function handleAddBundle() {
    await addBundle(bundle.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <section className="rounded-2xl border border-orange-100 bg-[#FFF7F0] p-4">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#FF6000]">
          <PackagePlus className="size-5" />
        </div>
        <div>
          <p className="text-xs font-extrabold text-[#FF6000]">Bu urunle birlikte iyi gider</p>
          <h2 className="mt-0.5 text-lg font-extrabold text-[#111827]">{bundle.title}</h2>
          <p className="mt-1 text-sm leading-5 text-[#6B7280]">{bundle.campaignText || bundle.shortDescription}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {[bundle.primaryProduct, bundle.complementaryProduct].map((product) => (
          <div key={product.id} className="min-w-0 rounded-xl bg-white p-3">
            <div className="relative mx-auto mb-2 aspect-square w-full max-w-[120px]">
              {product.image && <Image src={product.image} alt={product.title} fill sizes="120px" className="object-contain" />}
            </div>
            <p className="line-clamp-2 text-xs font-semibold leading-4 text-[#374151]">{product.title}</p>
            <p className="mt-1 text-sm font-extrabold text-[#111827]">{formatPrice(product.price)}</p>
          </div>
        ))}
        <span className="text-2xl font-light text-[#FF6000]">+</span>
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-white px-4 py-3 text-sm">
        <div className="flex items-center justify-between text-[#6B7280]">
          <span>Normal toplam</span>
          <span className="line-through">{formatPrice(bundle.originalTotal)}</span>
        </div>
        <div className="flex items-center justify-between font-bold text-emerald-600">
          <span>Paket indirimi</span>
          <span>-{formatPrice(bundle.discountAmount)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-2 font-extrabold text-[#111827]">
          <span>Odenecek toplam</span>
          <span>{formatPrice(bundle.bundleTotal)}</span>
        </div>
      </div>

      <button
        onClick={handleAddBundle}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF6000] text-sm font-extrabold text-white transition hover:bg-[#E65700]"
      >
        {added ? <><Check className="size-4" /> Eklendi</> : bundle.ctaLabel}
      </button>
    </section>
  );
}
