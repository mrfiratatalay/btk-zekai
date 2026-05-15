"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, ChevronRight, Sparkles, TrendingDown, TrendingUp, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSellerPrice, getPriorityProducts, sellerProducts, sellerStore } from "@/lib/mock-data/seller";

const priorityProducts = getPriorityProducts(3);

const KPI_CARDS = [
  {
    label: "Aylık Tahmini Kayıp",
    value: formatSellerPrice(8900),
    sub: "İade ve düşük dönüşüm",
    color: "red",
    icon: TrendingDown,
  },
  {
    label: "Aktif Ürün",
    value: "12",
    sub: "Demo Store'dan senkronize",
    color: "gray",
    icon: Zap,
  },
  {
    label: "İade Oranı",
    value: "%23",
    sub: "Sektör ortalaması %12",
    color: "amber",
    icon: TrendingDown,
  },
  {
    label: "İyileştirme Fırsatı",
    value: "+₺4.200",
    sub: "Aylık potansiyel gelir",
    color: "green",
    icon: TrendingUp,
  },
];

const QUICK_ACTIONS = [
  {
    href: "/seller/products",
    icon: Users,
    label: "Müşteri Simülasyonu Başlat",
    desc: "Ürünlerini 12 profille test et",
    green: true,
  },
  {
    href: "/seller/ai-studio",
    icon: Sparkles,
    label: "AI Studio'ya Git",
    desc: "İçerik ve fiyat optimizasyonu",
    green: false,
  },
  {
    href: "/seller/products",
    icon: Bot,
    label: "AI ile Düzenle",
    desc: "Ürün açıklamalarını güçlendir",
    green: false,
  },
];

const RECENT_SIMS = [
  {
    productId: "bluetooth-kulaklik-pro-x1",
    title: "Premium Bluetooth Kulaklık Beyaz",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80",
    result: "5 aktif · 4 kararsız · 3 vazgeçti",
    date: "Bugün 10:42",
    score: 34,
  },
  {
    productId: "spor-ayakkabi-runflex",
    title: "RunFlex Hafif Tabanlı Spor Ayakkabı",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80",
    result: "6 aktif · 3 kararsız · 3 vazgeçti",
    date: "Bugün 09:12",
    score: 29,
  },
];

export function SellerDashboard() {
  return (
    <div className="space-y-6">
      {/* ── Greeting ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Merhaba, Mehmet 👋
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Demo Store · {sellerProducts.length} ürün · Son senkronizasyon: az önce
          </p>
        </div>
        <Link
          href="/seller/products"
          className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-600"
        >
          <Sparkles className="size-4" />
          Simülasyon Başlat
        </Link>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#111]"
            >
              <div className={cn(
                "mb-3 flex size-9 items-center justify-center rounded-xl",
                kpi.color === "red" && "bg-red-50 dark:bg-red-500/10",
                kpi.color === "amber" && "bg-amber-50 dark:bg-amber-500/10",
                kpi.color === "green" && "bg-green-50 dark:bg-green-500/10",
                kpi.color === "gray" && "bg-gray-100 dark:bg-white/8",
              )}>
                <Icon className={cn(
                  "size-4",
                  kpi.color === "red" && "text-red-500",
                  kpi.color === "amber" && "text-amber-500",
                  kpi.color === "green" && "text-green-500",
                  kpi.color === "gray" && "text-gray-400",
                )} />
              </div>
              <p className="text-xs font-medium text-gray-400">{kpi.label}</p>
              <p className={cn(
                "mt-1 text-2xl font-black",
                kpi.color === "red" && "text-red-600 dark:text-red-400",
                kpi.color === "amber" && "text-amber-600 dark:text-amber-400",
                kpi.color === "green" && "text-green-600 dark:text-green-400",
                kpi.color === "gray" && "text-gray-900 dark:text-white",
              )}>
                {kpi.value}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Main grid: Priority products + Quick actions ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* Priority products */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Acil Müdahale Gerekiyor</h2>
            <Link
              href="/seller/products"
              className="flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400"
            >
              Tüm ürünler <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111]">
            {priorityProducts.map((product, i) => (
              <Link
                key={product.id}
                href={`/seller/product/${product.id}`}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors",
                  i > 0 && "border-t border-gray-100 dark:border-white/8",
                )}
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                  <Image src={product.image} alt={product.title} fill sizes="48px" className="object-contain p-1.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{product.title}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-400">{product.mainIssue}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-red-500">
                    -{formatSellerPrice(product.lostProfitMonthly)}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-green-600 dark:text-green-400">
                    +{formatSellerPrice(product.improvableRevenueMonthly)} fırsat
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-gray-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="mb-3 text-base font-bold text-gray-900 dark:text-white">Hızlı İşlemler</h2>
          <div className="space-y-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border p-4 transition-all hover:shadow-md",
                    action.green
                      ? "border-green-200 bg-green-500 hover:bg-green-600 dark:border-green-500/20"
                      : "border-gray-200 bg-white hover:bg-gray-50 dark:border-white/10 dark:bg-[#111] dark:hover:bg-white/5",
                  )}
                >
                  <div className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    action.green ? "bg-white/20" : "bg-gray-100 dark:bg-white/8",
                  )}>
                    <Icon className={cn("size-5", action.green ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-bold", action.green ? "text-white" : "text-gray-900 dark:text-white")}>
                      {action.label}
                    </p>
                    <p className={cn("mt-0.5 text-xs", action.green ? "text-green-100" : "text-gray-400")}>
                      {action.desc}
                    </p>
                  </div>
                  <ChevronRight className={cn("size-4 shrink-0", action.green ? "text-white/60" : "text-gray-300")} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent simulations ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Son Simülasyonlar</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {RECENT_SIMS.map((sim) => (
            <Link
              key={sim.productId}
              href={`/seller/product/${sim.productId}/simulation`}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-white/10 dark:bg-[#111]"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                <Image src={sim.image} alt={sim.title} fill sizes="56px" className="object-contain p-2" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{sim.title}</p>
                <p className="mt-1 text-[11px] text-green-600 dark:text-green-400 font-semibold">{sim.result}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">{sim.date}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-gray-300" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Store summary ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#111]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Mağaza Özeti</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700 dark:bg-green-500/10 dark:text-green-400">
            <span className="size-1.5 rounded-full bg-green-500" />
            Demo Store Bağlı
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Toplam Ürün", value: sellerStore.activeProducts },
            { label: "30 Gün Satış", value: sellerStore.totalSales30d },
            { label: "Güven Skoru", value: `${sellerStore.trustScore}/100` },
            { label: "Bekleyen İşlem", value: sellerStore.pendingActions },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-gray-50 p-3 text-center dark:bg-white/5">
              <p className="text-[11px] text-gray-400">{s.label}</p>
              <p className="mt-1 text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
