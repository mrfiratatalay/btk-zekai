"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/api/products";
import type { Product } from "@/types/product";
import { useCartStore } from "@/lib/store/cart-store";
import {
  BatteryCharging,
  Bluetooth,
  Check,
  Info,
  Mic,
  PackageCheck,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

function getFeatureIcon(label: string): LucideIcon {
  const n = label.toLocaleLowerCase("tr-TR");
  if (n.includes("bluetooth") || n.includes("baglanti")) return Bluetooth;
  if (n.includes("pil") || n.includes("sarj")) return BatteryCharging;
  if (n.includes("mikrofon") || n.includes("ses")) return Mic;
  if (n.includes("gecikme") || n.includes("guc")) return Zap;
  if (n.includes("garanti") || n.includes("dayanim")) return ShieldCheck;
  return Info;
}

export function ProductInfoPanel({ product }: { product: Product }) {
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const specs = Object.entries(product.features).slice(0, 4);

  function handleAddToCart() {
    addItem(product.id, product.stock);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <section className="flex flex-col gap-6">

      {/* Title + meta */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-600">{product.brand}</span>
          <span>·</span>
          <span>{product.sellerName}</span>
          {product.badges?.[0] && (
            <Badge className="rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100">
              {product.badges[0]}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold leading-tight text-slate-900">
          {product.title}
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-4 ${i < Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-slate-700">{product.rating.toFixed(1)}</span>
          <span className="text-sm text-slate-400">
            ({product.reviewCount.toLocaleString("tr-TR")} değerlendirme)
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-4xl font-black text-slate-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-lg text-slate-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Key specs */}
      {specs.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {specs.map(([label, value]) => {
            const Icon = getFeatureIcon(label);
            return (
              <div key={label} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400">{label}</p>
                  <p className="text-xs font-semibold text-slate-800">{value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stock */}
      {product.stock <= 20 && product.stock > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
          <span className="size-2 shrink-0 rounded-full bg-amber-500" />
          <p className="text-sm font-medium text-amber-700">
            Son <strong>{product.stock} adet</strong> kaldı
          </p>
        </div>
      )}
      {product.stock === 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5">
          <span className="size-2 shrink-0 rounded-full bg-red-500" />
          <p className="text-sm font-medium text-red-700">Stokta yok</p>
        </div>
      )}

      {/* Kargo + iade */}
      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2.5">
          <Truck className="size-4 shrink-0 text-emerald-500" />
          <span>{product.cargoText}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="size-4 shrink-0 text-slate-400" />
          <span>İade koşulları için satıcıya danışın</span>
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="h-12 w-full rounded-xl bg-[#FF6000] text-base font-bold text-white hover:bg-[#E65700] disabled:opacity-50"
      >
        {addedToCart ? (
          <><Check className="size-5" /> Eklendi!</>
        ) : (
          <><PackageCheck className="size-5" /> Sepete Ekle</>
        )}
      </Button>

      {/* Seller row */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <span>Satıcı:</span>
          <span className="font-semibold text-slate-800">{product.sellerName}</span>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
          {product.sellerName}
        </span>
      </div>

    </section>
  );
}
