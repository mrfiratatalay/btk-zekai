"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Package,
  RefreshCw,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ── Mock data ───────────────────────────────────────────────────────────── */
const chartData = [
  { ay: "Oca", satis: 42000, iade: 6200 },
  { ay: "Şub", satis: 51000, iade: 7100 },
  { ay: "Mar", satis: 38000, iade: 5400 },
  { ay: "Nis", satis: 67000, iade: 8800 },
  { ay: "May", satis: 59000, iade: 6900 },
  { ay: "Haz", satis: 74000, iade: 9200 },
  { ay: "Tem", satis: 82000, iade: 7500 },
];

const KPI_CARDS = [
  {
    label: "Aylık Satış",
    value: "₺82.400",
    delta: "+11%",
    positive: true,
    icon: TrendingUp,
    color: "#ADFF41",
  },
  {
    label: "İade Oranı",
    value: "%9,1",
    delta: "-2,4pp",
    positive: true,
    icon: RefreshCw,
    color: "#10B981",
  },
  {
    label: "AI Risk Skoru",
    value: "48/100",
    delta: "Orta Risk",
    positive: false,
    icon: BarChart3,
    color: "#F59E0B",
  },
  {
    label: "Aktif Ürün",
    value: "24",
    delta: "6 riskli",
    positive: false,
    icon: Package,
    color: "#8B5CF6",
  },
];

const PRIORITY_PRODUCTS = [
  {
    id: "bluetooth-kulaklik-pro-x1",
    title: "PulseWave Pro X1 Bluetooth Kulaklık",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=80&q=80",
    riskScore: 72,
    returnRate: "18%",
    lostProfit: "₺3.200",
    issue: "Mikrofon bilgisi eksik, stok fotoğraf şüphesi",
  },
  {
    id: "akilli-saat-fit-neo",
    title: "FitNeo S3 Akıllı Saat",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=80&q=80",
    riskScore: 55,
    returnRate: "12%",
    lostProfit: "₺1.800",
    issue: "Açıklama çok kısa, SEO eksik",
  },
  {
    id: "ergonomik-calisma-sandalyesi",
    title: "NordDesk Ergonomik Sandalye",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=80&q=80",
    riskScore: 44,
    returnRate: "8%",
    lostProfit: "₺950",
    issue: "Ölçü bilgisi yetersiz",
  },
];

const AI_ACTIONS = [
  {
    icon: Bot,
    color: "#ADFF41",
    title: "Başlık Optimizasyonu",
    desc: "3 ürün için SEO başlığı hazır",
    href: "/seller/optimize",
  },
  {
    icon: Star,
    color: "#8B5CF6",
    title: "Yorum Analizi",
    desc: "47 yeni yorum analiz edildi",
    href: "/seller/products",
  },
  {
    icon: AlertTriangle,
    color: "#F59E0B",
    title: "Fiyat Uyarısı",
    desc: "2 üründe sahte indirim sinyali",
    href: "/seller/products",
  },
];

function riskColor(score: number) {
  if (score >= 65) return { bg: "bg-red-500/10 dark:bg-red-500/15", text: "text-red-600 dark:text-red-400" };
  if (score >= 40) return { bg: "bg-amber-500/10 dark:bg-amber-500/15", text: "text-amber-600 dark:text-amber-400" };
  return { bg: "bg-emerald-500/10 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400" };
}

/* ── Custom tooltip ──────────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-sm font-bold" style={{ color: p.color }}>
          {p.dataKey === "satis" ? "Satış" : "İade"}: {p.value.toLocaleString("tr-TR")} ₺
        </p>
      ))}
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export function SellerDashboard() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Genel Bakış</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mağazanın satış, iade ve AI risk sinyallerini takip et.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex size-11 items-center justify-center rounded-2xl"
                  style={{ background: card.color + "18" }}
                >
                  <Icon className="size-5" style={{ color: card.color }} />
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    card.positive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}
                >
                  {card.delta}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-foreground">{card.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + AI Actions */}
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        {/* Sales chart */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-foreground">Satış ve İade Trendi</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Son 7 ay</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#ADFF41]" />
                Satış
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#F59E0B]" />
                İade
              </span>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ADFF41" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ADFF41" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="ay" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="satis" stroke="#ADFF41" strokeWidth={2.5} fill="url(#salGrad)" />
                <Area type="monotone" dataKey="iade" stroke="#F59E0B" strokeWidth={2.5} fill="url(#retGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Actions */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="size-4 text-[#ADFF41]" />
            <h2 className="font-extrabold text-foreground">AI Öneriler</h2>
          </div>
          <div className="space-y-3">
            {AI_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.title} href={a.href}>
                  <div className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-all hover:border-[#ADFF41]/40 hover:bg-[#ADFF41]/5">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: a.color + "18" }}
                    >
                      <Icon className="size-4" style={{ color: a.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                    </div>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              );
            })}
          </div>
          <Button asChild className="mt-4 w-full rounded-xl bg-[#ADFF41] font-semibold text-[#0D0F0B] hover:bg-[#9AE635]">
            <Link href="/seller/optimize">
              <Bot className="mr-2 size-4" />
              AI Optimizasyona Git
            </Link>
          </Button>
        </div>
      </div>

      {/* Priority products */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-foreground">Öncelikli Ürünler</h2>
            <p className="text-xs text-muted-foreground mt-0.5">En yüksek risk ve kâr kaybına göre sıralandı</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl border-border text-foreground">
            <Link href="/seller/products">
              Tüm Ürünler
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          {PRIORITY_PRODUCTS.map((product) => {
            const risk = riskColor(product.riskScore);
            return (
              <div
                key={product.id}
                className="group flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 transition-all hover:border-[#ADFF41]/30 sm:flex-row sm:items-center"
              >
                {/* Image + title */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
                    <Image src={product.image} alt={product.title} fill sizes="56px" className="object-contain p-2" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground leading-snug line-clamp-2">{product.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{product.issue}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className={cn("text-lg font-extrabold", riskColor(product.riskScore).text)}>
                      {product.riskScore}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Risk</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-foreground">{product.returnRate}</p>
                    <p className="text-[10px] text-muted-foreground">İade</p>
                  </div>
                  <div className="text-center">
                    <p className="flex items-center gap-1 text-sm font-bold text-red-500">
                      <TrendingDown className="size-3.5" />
                      {product.lostProfit}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Kayıp/ay</p>
                  </div>
                </div>

                <Button
                  asChild
                  size="sm"
                  className="shrink-0 rounded-xl bg-[#ADFF41] font-semibold text-[#0D0F0B] hover:bg-[#9AE635]"
                >
                  <Link href={`/seller/product/${product.id}`}>AI Analiz</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
