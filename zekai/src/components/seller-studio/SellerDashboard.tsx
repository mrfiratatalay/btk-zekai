"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Bot, ChevronRight, Loader2, Sparkles, TrendingDown, TrendingUp, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSellerProducts, getSellerKpis, type SellerProduct, type KpiDto } from "@/lib/api/seller";
import { getProducts, type ProductListItem } from "@/lib/api/products";
import { getCurrentUser } from "@/lib/api/auth";

function formatPrice(v: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(v);
}

const RECENT_SIMS = [
  { productId: "bluetooth-kulaklik-pro-x1", title: "Premium Bluetooth Kulaklık Beyaz", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80", result: "5 aktif · 4 kararsız · 3 vazgeçti", date: "Bugün 10:42" },
  { productId: "spor-ayakkabi-runflex", title: "RunFlex Hafif Tabanlı Spor Ayakkabı", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80", result: "6 aktif · 3 kararsız · 3 vazgeçti", date: "Bugün 09:12" },
];

const TONE_ICON: Record<string, React.ElementType> = {
  danger: TrendingDown, warning: TrendingDown, success: TrendingUp, neutral: Zap,
};
const TONE_BG: Record<string, string> = {
  danger: "bg-red-50 dark:bg-red-500/10",
  warning: "bg-amber-50 dark:bg-amber-500/10",
  success: "bg-green-50 dark:bg-green-500/10",
  neutral: "bg-gray-100 dark:bg-white/8",
};
const TONE_TEXT: Record<string, string> = {
  danger: "text-red-500", warning: "text-amber-500", success: "text-green-500", neutral: "text-gray-400",
};
const TONE_VALUE: Record<string, string> = {
  danger: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  success: "text-green-600 dark:text-green-400",
  neutral: "text-gray-900 dark:text-white",
};

export function SellerDashboard() {
  const user = getCurrentUser();
  const isSeller = user?.role === "Seller";

  const [kpis, setKpis] = useState<KpiDto[]>([]);
  const [priorityProducts, setPriorityProducts] = useState<(SellerProduct & { image?: string })[]>([]);
  const [publicProducts, setPublicProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const pub = await getProducts();
        setPublicProducts(pub);

        if (isSeller) {
          const [kpiData, sellerProds] = await Promise.all([
            getSellerKpis(),
            getSellerProducts(),
          ]);
          setKpis(kpiData);
          // Top 3 priority (lowest health score)
          const sorted = [...sellerProds].sort((a, b) => a.healthScore - b.healthScore).slice(0, 3);
          setPriorityProducts(sorted.map((sp) => ({
            ...sp,
            image: pub.find((p) => p.id === sp.id)?.primaryImage,
          })));
        } else {
          // Default KPIs for non-seller view
          setKpis([
            { label: "Aylık Tahmini Kayıp", value: "₺8.900", note: "İade ve düşük dönüşüm", tone: "danger" },
            { label: "Aktif Ürün", value: String(pub.length), note: "Senkronize edildi", tone: "neutral" },
            { label: "İade Oranı", value: "%23", note: "Sektör ortalaması %12", tone: "warning" },
            { label: "İyileştirme Fırsatı", value: "+₺4.200", note: "Aylık potansiyel", tone: "success" },
          ]);
          const priority = [...pub].slice(0, 3).map((p) => ({
            id: p.id, title: p.title, image: p.primaryImage, primaryImage: p.primaryImage,
            category: p.category, price: p.price, stock: p.stock,
            sales30d: 0, returnRate: 0, conversionRate: 0, healthScore: 50,
            lostProfitMonthly: 0, improvableRevenueMonthly: 0,
            status: "Watch" as const, mainIssue: "Analiz bekleniyor",
            updatedAt: new Date().toISOString(),
          }));
          setPriorityProducts(priority);
        }
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isSeller]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-green-500" />
      </div>
    );
  }

  const storeName = isSeller ? (user?.fullName ?? "Satıcı") : "Demo Mağaza";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Merhaba, {storeName.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {publicProducts.length} ürün · Son senkronizasyon: az önce
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

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = TONE_ICON[kpi.tone] ?? Zap;
          return (
            <div key={kpi.label} className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#111]">
              <div className={cn("mb-3 flex size-9 items-center justify-center rounded-xl", TONE_BG[kpi.tone])}>
                <Icon className={cn("size-4", TONE_TEXT[kpi.tone])} />
              </div>
              <p className="text-xs font-medium text-gray-400">{kpi.label}</p>
              <p className={cn("mt-1 text-2xl font-black", TONE_VALUE[kpi.tone])}>{kpi.value}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">{kpi.note}</p>
            </div>
          );
        })}
      </div>

      {/* Priority products + Quick actions */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Acil Müdahale Gerekiyor</h2>
            <Link href="/seller/products" className="flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-400">
              Tüm ürünler <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111]">
            {priorityProducts.map((product, i) => (
              <Link
                key={product.id}
                href={`/seller/product/${product.id}`}
                className={cn("flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors", i > 0 && "border-t border-gray-100 dark:border-white/8")}
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
                  {product.image && (
                    <Image src={product.image} alt={product.title} fill sizes="48px" className="object-contain p-1.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{product.title}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-400">{product.mainIssue || product.category}</p>
                </div>
                <div className="shrink-0 text-right">
                  {product.lostProfitMonthly > 0 && (
                    <p className="text-sm font-bold text-red-500">-{formatPrice(product.lostProfitMonthly)}</p>
                  )}
                  {product.improvableRevenueMonthly > 0 && (
                    <p className="mt-0.5 text-[11px] font-semibold text-green-600 dark:text-green-400">
                      +{formatPrice(product.improvableRevenueMonthly)} fırsat
                    </p>
                  )}
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
            {[
              { href: "/seller/products", icon: Users, label: "Müşteri Simülasyonu Başlat", desc: "Ürünlerini 12 profille test et", green: true },
              { href: "/seller/ai-studio", icon: Sparkles, label: "AI Studio'ya Git", desc: "İçerik ve fiyat optimizasyonu", green: false },
              { href: "/seller/products", icon: Bot, label: "AI ile Düzenle", desc: "Ürün açıklamalarını güçlendir", green: false },
            ].map((action) => {
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
                  <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", action.green ? "bg-white/20" : "bg-gray-100 dark:bg-white/8")}>
                    <Icon className={cn("size-5", action.green ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-bold", action.green ? "text-white" : "text-gray-900 dark:text-white")}>{action.label}</p>
                    <p className={cn("mt-0.5 text-xs", action.green ? "text-green-100" : "text-gray-400")}>{action.desc}</p>
                  </div>
                  <ChevronRight className={cn("size-4 shrink-0", action.green ? "text-white/60" : "text-gray-300")} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent simulations */}
      <div>
        <h2 className="mb-3 text-base font-bold text-gray-900 dark:text-white">Son Simülasyonlar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {RECENT_SIMS.map((sim) => {
            const pub = publicProducts.find((p) => p.id === sim.productId);
            return (
              <Link
                key={sim.productId}
                href={`/seller/product/${sim.productId}/simulation`}
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-white/10 dark:bg-[#111]"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
                  <Image src={pub?.primaryImage ?? sim.image} alt={sim.title} fill sizes="56px" className="object-contain p-2" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{sim.title}</p>
                  <p className="mt-1 text-[11px] font-semibold text-green-600 dark:text-green-400">{sim.result}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{sim.date}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-gray-300" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Store summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#111]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Mağaza Özeti</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700 dark:bg-green-500/10 dark:text-green-400">
            <span className="size-1.5 rounded-full bg-green-500" />
            {isSeller ? "Bağlı" : "Demo"} Store
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Toplam Ürün", value: publicProducts.length },
            { label: "30 Gün Satış", value: isSeller ? priorityProducts.reduce((s, p) => s + p.sales30d, 0) : 424 },
            { label: "Aktif Mağaza", value: "Demo" },
            { label: "Bekleyen İşlem", value: priorityProducts.filter((p) => p.status === "Urgent").length },
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
