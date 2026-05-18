"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Briefcase,
  Check,
  ChevronRight,
  Copy,
  Heart,
  Loader2,
  Package,
  RefreshCw,
  Share2,
  Smile,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { SellerProductPerformance } from "@/types/seller";
import { formatSellerPrice } from "@/lib/format";
import { generateSocialContent, type SocialMediaContent } from "@/lib/api/seller";

type Tone = "profesyonel" | "samimi" | "mizahi";

const TONES: { key: Tone; label: string; Icon: React.ElementType }[] = [
  { key: "profesyonel", label: "Profesyonel", Icon: Briefcase },
  { key: "samimi", label: "Samimi", Icon: Heart },
  { key: "mizahi", label: "Mizahi", Icon: Smile },
];

/* ── Platform SVG ikonları ─────────────────────────────────────── */
function IgIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" fill="none">
      <defs>
        <linearGradient id="ig2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="30%" stopColor="#e6683c" />
          <stop offset="55%" stopColor="#dc2743" />
          <stop offset="78%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#ig2)" />
      <circle cx="16" cy="16" r="5.5" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="22.5" cy="9.5" r="1.5" fill="white" />
    </svg>
  );
}
function TkIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" fill="none">
      <rect width="32" height="32" rx="9" fill="#010101" />
      <path
        d="M21 10.2c-.9-.6-1.6-1.5-1.9-2.7h-2.7v11.7c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3 1-2.3 2.3-2.3c.2 0 .5 0 .7.1v-2.8c-.2 0-.4-.1-.7-.1C11.5 14.1 9 16.6 9 19.7s2.5 5.6 5.6 5.6 5.6-2.5 5.6-5.6V13c1 .7 2.2 1.1 3.5 1.1v-2.6c-.7 0-1.9-.4-2.7-1.3z"
        fill="white"
      />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" fill="none">
      <rect width="32" height="32" rx="9" fill="#000" />
      <path
        d="M22 9h-2.8l-3 3.8L13.4 9H9l5 6.5L9 23h2.8l3.3-4.1L18.6 23H23l-5.3-6.9L22 9z"
        fill="white"
      />
    </svg>
  );
}

/* ── Kopyala butonu ─────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
    >
      {copied
        ? <><Check className="size-3 text-green-500" /><span className="text-green-600 dark:text-green-400">Kopyalandı</span></>
        : <><Copy className="size-3" />Kopyala</>}
    </button>
  );
}

/* ── Platform bölümü — Apple'ın "Settings" listesi gibi ───────── */
function PlatformRow({
  icon,
  label,
  children,
  action,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="flex gap-4 py-5">
      {/* Sol: ikon */}
      <div className="mt-0.5 shrink-0">{icon}</div>

      {/* Orta: başlık + içerik */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-foreground">{label}</p>
          {action}
        </div>

        {loading ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-green-500" />
              İçerik hazırlanıyor...
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
              <div className="h-2 w-4/5 animate-pulse rounded-full bg-muted" />
              <div className="h-2 w-3/5 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/* ── Instagram içerik görünümü ──────────────────────────────────── */
function InstagramContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const hashIdx = lines.findIndex((l) => l.startsWith("#"));
  const body = hashIdx > 0 ? lines.slice(0, hashIdx).join("\n").trim() : content;
  const tags = hashIdx > 0 ? lines.slice(hashIdx).join(" ") : "";
  const full = content;
  return (
    <div className="space-y-2">
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{body}</p>
      {tags && <p className="text-sm text-green-600 dark:text-green-400">{tags}</p>}
      <CopyButton text={full} />
    </div>
  );
}

/* ── TikTok içerik görünümü ─────────────────────────────────────── */
function TiktokContent({ scenes }: { scenes: { time: string; text: string }[] }) {
  const full = scenes.map((s) => `${s.time}  ${s.text}`).join("\n");
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {scenes.map((s) => (
          <div key={s.time} className="flex gap-3 text-sm">
            <span className="shrink-0 font-mono text-xs font-semibold text-green-500 dark:text-green-400 pt-px">
              {s.time}
            </span>
            <span className="text-foreground">{s.text}</span>
          </div>
        ))}
      </div>
      <CopyButton text={full} />
    </div>
  );
}

/* ── Twitter içerik görünümü ────────────────────────────────────── */
function TwitterContent({ content }: { content: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm leading-relaxed text-foreground">{content}</p>
      <CopyButton text={content} />
    </div>
  );
}

/* ── Ana bileşen ────────────────────────────────────────────────── */
export function SellerSocialMedia({ product }: { product: SellerProductPerformance }) {
  const [tone, setTone] = useState<Tone>("samimi");
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState<SocialMediaContent | null>(null);
  const hasGenerated = content !== null;

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await generateSocialContent(product.id, tone);
      setContent(result);
      toast.success("3 platform için içerik üretildi.");
    } catch {
      toast.error("İçerik üretilemedi, lütfen tekrar dene.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRegenerate() {
    setContent(null);
    await handleGenerate();
  }

  return (
    <div className="pb-16">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/seller/products" className="transition-colors hover:text-gray-700 dark:hover:text-gray-200">
          Ürünlerim
        </Link>
        <ChevronRight className="size-3.5" />
        <Link
          href={`/seller/product/${product.id}`}
          className="max-w-[160px] truncate transition-colors hover:text-gray-700 dark:hover:text-gray-200"
        >
          {product.title}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">Sosyal Medya İçeriği</span>
      </div>

      {/* Sayfa başlığı */}
      <div className="mt-6 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Sosyal Medya İçeriği
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ürünün için 3 platforma uygun içerik oluştur ve kopyala.
        </p>
      </div>

      {/* Ürün özeti — minimalist, tek satır */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
          {product.image
            ? <Image src={product.image} alt={product.title} fill className="object-contain p-1" />
            : <div className="flex h-full items-center justify-center"><Package className="size-4 text-gray-300" /></div>
          }
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{product.title}</p>
          <p className="text-xs text-muted-foreground">{product.category} · {formatSellerPrice(product.price)}</p>
        </div>
      </div>

      {/* Ton seçimi + Üret aksiyonu */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">

        {/* Ton seçici */}
        <div className="px-5 py-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ton Seçimi</p>
          <div className="flex flex-wrap gap-2">
            {TONES.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setTone(key)}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  tone === key
                    ? "border-green-300 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Aksiyon butonu — border-t ile ayrılmış, SellerAIEdit pattern */}
        {!hasGenerated ? (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex w-full cursor-pointer items-center justify-center gap-2 border-t border-border py-3.5 text-sm font-semibold text-green-600 transition-colors hover:bg-green-500/8 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-400"
          >
            {generating
              ? <><Loader2 className="size-4 animate-spin" />Üretiliyor...</>
              : <><Sparkles className="size-4" />İçerik Üret</>}
          </button>
        ) : (
          <button
            onClick={handleRegenerate}
            disabled={generating}
            className="flex w-full cursor-pointer items-center justify-center gap-2 border-t border-border py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${generating ? "animate-spin" : ""}`} />
            Yeniden Üret
          </button>
        )}
      </div>

      {/* Başarı satırı */}
      {hasGenerated && (
        <div className="mt-4 flex items-center gap-2 px-1">
          <div className="flex size-4 items-center justify-center rounded-full bg-green-500">
            <Check className="size-2.5 text-white" />
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">
            3 platform için içerik üretildi.
          </p>
        </div>
      )}

      {/* Platform listesi — Apple Settings benzeri, divider'lı tek kart */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">

        {/* Instagram */}
        <div className="px-5">
          <PlatformRow
            icon={<IgIcon />}
            label="Instagram"
            loading={generating}
            action={hasGenerated && content ? <CopyButton text={content.instagram} /> : undefined}
          >
            {hasGenerated && content && <InstagramContent content={content.instagram} />}
            {!hasGenerated && !generating && (
              <p className="text-sm text-muted-foreground/40">İçerik üretilmedi</p>
            )}
          </PlatformRow>
        </div>

        <div className="mx-5 border-t border-border" />

        {/* TikTok */}
        <div className="px-5">
          <PlatformRow
            icon={<TkIcon />}
            label="TikTok / Reels"
            loading={generating}
            action={hasGenerated && content ? <CopyButton text={content.tiktok.map(s => `${s.time}  ${s.text}`).join("\n")} /> : undefined}
          >
            {hasGenerated && content && <TiktokContent scenes={content.tiktok} />}
            {!hasGenerated && !generating && (
              <p className="text-sm text-muted-foreground/40">İçerik üretilmedi</p>
            )}
          </PlatformRow>
        </div>

        <div className="mx-5 border-t border-border" />

        {/* Twitter */}
        <div className="px-5">
          <PlatformRow
            icon={<XIcon />}
            label="X (Twitter)"
            loading={generating}
            action={hasGenerated && content ? <CopyButton text={content.twitter} /> : undefined}
          >
            {hasGenerated && content && <TwitterContent content={content.twitter} />}
            {!hasGenerated && !generating && (
              <p className="text-sm text-muted-foreground/40">İçerik üretilmedi</p>
            )}
          </PlatformRow>
        </div>
      </div>

      {/* Alt bilgi */}
      {!hasGenerated && !generating && (
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Share2 className="size-3.5" />
          Ürün başlığı, kategori ve açıklaması kullanılarak içerik üretilir.
        </p>
      )}

    </div>
  );
}
