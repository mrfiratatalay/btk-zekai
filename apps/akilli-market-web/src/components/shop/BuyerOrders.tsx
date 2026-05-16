"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Package,
  RotateCcw,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrders, markDelivered, createReturn, type Order } from "@/lib/api/buyer";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  Pending: {
    label: "Kargoda",
    color: "bg-amber-100 text-amber-700",
    icon: Truck,
  },
  Delivered: {
    label: "Teslim Edildi",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  ReturnRequested: {
    label: "İade Talep Edildi",
    color: "bg-orange-100 text-orange-700",
    icon: RotateCcw,
  },
  Completed: {
    label: "Tamamlandı",
    color: "bg-blue-100 text-blue-700",
    icon: CheckCircle2,
  },
};

const RETURN_REASONS = [
  { value: "Damaged", label: "Hasarlı / Kırık ürün" },
  { value: "NotAsExpected", label: "Beklentiyi karşılamadı" },
  { value: "WrongProduct", label: "Yanlış ürün gönderildi" },
  { value: "LowQuality", label: "Düşük kalite" },
  { value: "Other", label: "Diğer" },
];

function formatPrice(v: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(v);
}

function OrderCard({ order, onUpdate }: { order: Order; onUpdate: (o: Order) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [markingDelivered, setMarkingDelivered] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [returnReason, setReturnReason] = useState("Damaged");
  const [returnClaim, setReturnClaim] = useState("");
  const [returningLoading, setReturningLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.Pending;
  const Icon = cfg.icon;

  async function handleMarkDelivered() {
    setMarkingDelivered(true);
    setError(null);
    try {
      const updated = await markDelivered(order.id);
      onUpdate(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Hata oluştu.");
    } finally {
      setMarkingDelivered(false);
    }
  }

  async function handleReturn(e: React.FormEvent) {
    e.preventDefault();
    if (returnClaim.trim().length < 10) { setError("Açıklama en az 10 karakter olmalı."); return; }
    setReturningLoading(true);
    setError(null);
    try {
      await createReturn(order.id, returnReason, returnClaim.trim());
      onUpdate({ ...order, status: "ReturnRequested", canReturn: false });
      setShowReturn(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "İade talebi gönderilemedi.");
    } finally {
      setReturningLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
          <Package className="size-5 text-gray-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-[#111827]">{order.orderNumber}</p>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            {new Date(order.orderedAt).toLocaleDateString("tr-TR")} ·{" "}
            {order.items.length} ürün · {formatPrice(order.total)}
          </p>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", cfg.color)}>
          <Icon className="size-3" />
          {cfg.label}
        </span>
        {expanded ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-[#E5E7EB] px-5 pb-5 pt-4 space-y-4">
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  {item.image && (
                    <Image src={item.image} alt={item.title} fill sizes="56px" className="object-contain p-1.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#111827]">{item.title}</p>
                  <p className="text-xs text-[#6B7280]">{item.sellerName} · x{item.quantity}</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-[#111827]">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 text-sm">
            <div>
              <p className="text-xs text-[#6B7280]">Teslimat Adresi</p>
              <p className="mt-0.5 font-medium text-[#111827] line-clamp-2">{order.deliveryAddress}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280]">Ödeme Yöntemi</p>
              <p className="mt-0.5 font-medium text-[#111827]">{order.paymentMethod}</p>
            </div>
            {order.deliveredAt && (
              <div>
                <p className="text-xs text-[#6B7280]">Teslim Tarihi</p>
                <p className="mt-0.5 font-medium text-[#111827]">
                  {new Date(order.deliveredAt).toLocaleDateString("tr-TR")}
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-wrap gap-3">
            {order.status === "Pending" && (
              <button
                onClick={handleMarkDelivered}
                disabled={markingDelivered}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#FF6000] px-5 text-sm font-bold text-white hover:bg-[#E65700] disabled:opacity-60 transition-colors"
              >
                {markingDelivered ? <Loader2 className="size-4 animate-spin" /> : <Truck className="size-4" />}
                Teslim Aldım
              </button>
            )}

            {order.canReturn && !showReturn && (
              <button
                onClick={() => { setShowReturn(true); setError(null); }}
                className="flex h-10 items-center gap-2 rounded-xl border border-[#E5E7EB] px-5 text-sm font-semibold text-[#6B7280] hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="size-4" />
                İade Talebi Oluştur
              </button>
            )}
          </div>

          {showReturn && (
            <form onSubmit={handleReturn} className="space-y-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm font-bold text-orange-700">İade Talebi</p>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6B7280]">İade Nedeni</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#FF6000]"
                >
                  {RETURN_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6B7280]">Açıklama</label>
                <textarea
                  value={returnClaim}
                  onChange={(e) => setReturnClaim(e.target.value)}
                  placeholder="İade nedeninizi detaylı açıklayın..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#FF6000]"
                />
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={returningLoading}
                  className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF6000] text-sm font-bold text-white hover:bg-[#E65700] disabled:opacity-60"
                >
                  {returningLoading ? <Loader2 className="size-4 animate-spin" /> : "Talebi Gönder"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowReturn(false); setError(null); }}
                  className="flex h-9 flex-1 items-center justify-center rounded-xl border border-[#E5E7EB] text-sm text-[#6B7280] hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export function BuyerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  function handleUpdate(updated: Order) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#FF6000]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-500">{error}</p>
        <Link href="/login" className="text-sm font-semibold text-[#FF6000] hover:underline">
          Giriş Yap →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Siparişlerim</h1>
        <p className="mt-1 text-sm text-[#6B7280]">{orders.length} sipariş</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Toplam", value: orders.length, icon: Package, color: "text-[#111827]" },
          { label: "Kargoda", value: orders.filter((o) => o.status === "Pending").length, icon: Clock, color: "text-amber-600" },
          { label: "Teslim Edildi", value: orders.filter((o) => o.status === "Delivered").length, icon: CheckCircle2, color: "text-green-600" },
          { label: "İade", value: orders.filter((o) => o.status === "ReturnRequested").length, icon: RotateCcw, color: "text-orange-500" },
        ].map((s) => {
          const SIcon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
              <SIcon className={cn("mx-auto mb-1 size-5", s.color)} />
              <p className="text-[11px] text-[#6B7280]">{s.label}</p>
              <p className={cn("text-xl font-black", s.color)}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] py-24">
          <Package className="mb-3 size-10 text-gray-200" />
          <p className="text-sm text-[#6B7280]">Henüz siparişiniz yok.</p>
          <Link href="/" className="mt-3 text-sm font-semibold text-[#FF6000] hover:underline">
            Alışverişe Başla →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
