"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Button } from "@/components/ui/button";
import { useCartStore, cartDiscountTotal, cartItemCount, cartPayableTotal, cartSubtotal, groupCartLines } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/api/products";

export default function CartPage() {
  const { items, loading, loadCart, removeItem, removeBundle, updateQty, updateBundleQty } = useCartStore();
  const lines = groupCartLines(items);
  const subtotal = cartSubtotal(items);
  const discountTotal = cartDiscountTotal(items);
  const total = cartPayableTotal(items);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />

      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-extrabold text-[#111827]">Sepetim</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 animate-pulse rounded-xl bg-[#F3F4F6]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <ShoppingBag className="size-14 text-[#D1D5DB]" />
            <p className="text-lg font-bold text-[#111827]">Sepetiniz boş</p>
            <p className="text-sm text-[#6B7280]">Ürün eklemek için alışverişe devam edin.</p>
            <Button asChild className="rounded-xl bg-[#FF6000] font-bold text-white hover:bg-[#E65700]">
              <Link href="/">Alışverişe Devam Et</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#F9FAFB]">
                  {line.image && (
                    <Image
                      src={line.image}
                      alt={line.title}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-[#111827]">
                        {line.title}
                      </p>
                      {line.kind === "bundle" && (
                        <div className="mt-1 space-y-1">
                          <p className="w-fit rounded-full bg-orange-50 px-2 py-0.5 text-xs font-bold text-[#FF6000]">
                            Paket
                          </p>
                          <p className="line-clamp-2 text-xs text-[#6B7280]">
                            {line.productTitles.join(" + ")}
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => line.kind === "bundle" ? removeBundle(line.bundleId!) : removeItem(line.itemId!)}
                      className="shrink-0 cursor-pointer text-[#9CA3AF] transition hover:text-[#DC2626]"
                      aria-label={line.kind === "bundle" ? "Paketi kaldır" : "Ürünü kaldır"}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#FF6000]">
                      {formatPrice(line.price * line.quantity)}
                    </span>
                    {line.discountAmount > 0 && (
                      <span className="text-xs font-semibold text-emerald-600">
                        -{formatPrice(line.discountAmount * line.quantity)}
                      </span>
                    )}

                    <div className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-1">
                      <button
                        onClick={() => line.kind === "bundle" ? updateBundleQty(line.bundleId!, line.quantity - 1) : updateQty(line.itemId!, line.quantity - 1)}
                        className="cursor-pointer p-1.5 text-[#6B7280] transition hover:text-[#111827]"
                        aria-label="Azalt"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-6 text-center text-sm font-bold text-[#111827]">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => line.kind === "bundle" ? updateBundleQty(line.bundleId!, Math.min(line.quantity + 1, line.stock)) : updateQty(line.itemId!, Math.min(line.quantity + 1, line.stock))}
                        disabled={line.quantity >= line.stock}
                        className="cursor-pointer p-1.5 text-[#6B7280] transition hover:text-[#111827] disabled:opacity-40"
                        aria-label="Artır"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#6B7280]">Ara toplam ({cartItemCount(items)} urun)</span>
                  <span className="font-bold text-[#111827]">{formatPrice(subtotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-emerald-600">Paket indirimi</span>
                    <span className="font-bold text-emerald-600">-{formatPrice(discountTotal)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-2">
                  <span className="font-semibold text-[#6B7280]">Toplam</span>
                  <span className="text-xl font-extrabold text-[#111827]">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="flex-1 rounded-xl border-[#E5E7EB] font-semibold">
                <Link href="/">Alışverişe Devam Et</Link>
              </Button>
              <Button asChild className="flex-1 h-12 rounded-xl bg-[#FF6000] text-base font-bold text-white hover:bg-[#E65700]">
                <Link href="/checkout">Siparişi Tamamla</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
