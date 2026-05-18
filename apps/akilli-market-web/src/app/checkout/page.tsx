"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore, cartDiscountTotal, cartPayableTotal, cartSubtotal } from "@/lib/store/cart-store";
import { createOrder, type Order } from "@/lib/api/buyer";
import { getCurrentUser } from "@/lib/api/auth";
import { formatPrice } from "@/lib/api/products";

const PAYMENT_METHODS = ["Kredi Kartı", "Havale/EFT", "Kapıda Ödeme"] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const subtotal = cartSubtotal(items);
  const discountTotal = cartDiscountTotal(items);
  const total = cartPayableTotal(items);

  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<string>("Kredi Kartı");
  const [loading, setLoading] = useState(false);
  const [placedOrders, setPlacedOrders] = useState<Order[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login?returnUrl=/checkout");
    }
  }, [router]);

  if (items.length === 0 && !done) {
    return (
      <div className="min-h-screen bg-white">
        <ShopHeader />
        <main className="mx-auto max-w-lg px-6 py-20 text-center">
          <ShoppingBag className="mx-auto mb-4 size-14 text-[#D1D5DB]" />
          <p className="font-bold text-[#111827]">Sepetiniz boş</p>
          <Button
            asChild
            className="mt-4 rounded-xl bg-[#FF6000] font-bold text-white hover:bg-[#E65700]"
          >
            <Link href="/">Alışverişe Git</Link>
          </Button>
        </main>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      toast.error("Teslimat adresi gerekli.");
      return;
    }
    setLoading(true);
    try {
      const bundleMap = new Map<string, number>();
      for (const item of items) {
        if (item.bundleId && !bundleMap.has(item.bundleId)) {
          bundleMap.set(item.bundleId, item.quantity);
        }
      }
      const order = await createOrder({
        items: items
          .filter((item) => !item.bundleId)
          .map((item) => ({ productId: item.productId, quantity: item.quantity })),
        bundles: Array.from(bundleMap.entries()).map(([bundleId, quantity]) => ({ bundleId, quantity })),
        deliveryAddress: address,
        paymentMethod: payment,
      });
      await clearCart();
      setPlacedOrders([order]);
      setDone(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sipariş oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white">
        <ShopHeader />
        <main className="mx-auto max-w-lg px-6 py-16 text-center">
          <CheckCircle2 className="mx-auto mb-4 size-16 text-emerald-500" />
          <h1 className="text-2xl font-extrabold text-[#111827]">Siparişiniz Alındı!</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Siparişleriniz hazırlanıyor, en kısa sürede kargoya verilecek.
          </p>

          <div className="mt-6 space-y-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-left">
            {placedOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">Sipariş No:</span>
                <span className="font-bold text-[#111827]">{o.orderNumber}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-2 text-sm font-bold">
              <span className="text-[#6B7280]">Toplam</span>
              <span className="text-[#111827]">
                {formatPrice(placedOrders.reduce((s, o) => s + o.total, 0))}
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-[#E5E7EB] font-semibold"
            >
              <Link href="/">Alışverişe Devam Et</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ShopHeader />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-extrabold text-[#111827]">Siparişi Tamamla</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 rounded-xl border border-[#E5E7EB] p-4">
            <p className="mb-3 text-sm font-bold text-[#111827]">Sipariş Özeti</p>
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="line-clamp-1 flex-1 text-[#374151]">
                  {item.title}{" "}
                  <span className="text-[#9CA3AF]">x{item.quantity}</span>
                  {item.bundleTitle && <span className="ml-1 text-[#FF6000]">({item.bundleTitle})</span>}
                </span>
                <span className="ml-4 font-bold text-[#111827]">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3 text-sm">
              <span className="text-[#6B7280]">Ara toplam</span>
              <span className="font-bold text-[#111827]">{formatPrice(subtotal)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex items-center justify-between text-sm font-bold text-emerald-600">
                <span>Paket indirimi</span>
                <span>-{formatPrice(discountTotal)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3 font-bold">
              <span className="text-[#6B7280]">Odenecek toplam</span>
              <span className="text-[#111827]">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#111827]">Teslimat Adresi</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Mahalle, sokak, bina no, ilçe, şehir"
              className="h-11 rounded-xl border-[#D1D5DB] focus-visible:border-[#FF6000] focus-visible:ring-[#FF6000]/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#111827]">Ödeme Yöntemi</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPayment(p)}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    payment === p
                      ? "border-[#FF6000] bg-[#FFF4EC] text-[#FF6000]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#FF6000]/40"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-[#FF6000] text-base font-bold text-white hover:bg-[#E65700] disabled:opacity-60"
          >
            {loading ? "Sipariş Veriliyor..." : "Siparişi Onayla"}
          </Button>
        </form>
      </main>
    </div>
  );
}
