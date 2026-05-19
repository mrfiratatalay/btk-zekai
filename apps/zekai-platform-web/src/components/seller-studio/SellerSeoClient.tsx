"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, ChevronRight, Copy, FileText, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { getProduct } from "@/lib/api/products";
import { generateSeo, type SeoResult } from "@/lib/api/seller";

export function SellerSeoClient({ productId }: { productId: string }) {
  const productQuery = useQuery({
    queryKey: ["seller-product-detail", productId],
    queryFn: () => getProduct(productId),
  });

  const seoMutation = useMutation({
    mutationFn: () => generateSeo(productId),
    onError: (err: Error) => alert(`SEO analizi üretilemedi: ${err.message}`),
  });

  if (productQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-amber-500" />
      </div>
    );
  }
  if (productQuery.error || !productQuery.data) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Ürün yüklenemedi.</div>;
  }

  const product = productQuery.data;
  const result = seoMutation.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/seller/products" className="hover:text-foreground">Ürünlerim</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/seller/product/${productId}`} className="hover:text-foreground line-clamp-1">
          {product.title}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">SEO</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10">
          <FileText className="size-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">SEO Optimizasyonu</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Anahtar kelime, başlık, meta açıklama ve URL slug önerilerini AI ile üret.
          </p>
        </div>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={() => seoMutation.mutate()}
        disabled={seoMutation.isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-60 cursor-pointer"
      >
        {seoMutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Üretiliyor…
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            {result ? "Yeniden Üret" : "SEO Analizi Üret"}
          </>
        )}
      </button>

      {/* Result */}
      {result && <SeoResultPanel result={result} />}
    </div>
  );
}

function SeoResultPanel({ result }: { result: SeoResult }) {
  return (
    <div className="space-y-4">
      {(result._mock || result._cached) && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            {result._mock && <p><strong>Demo mod —</strong> Gemini API geçici olarak kullanılamadı, örnek SEO çıktısı gösteriliyor.</p>}
            {result._cached && !result._mock && <p>Daha önce üretilmiş kayıtlı SEO çıktısı kullanılıyor (sıfır AI maliyeti).</p>}
          </div>
        </div>
      )}

      <Field label="Birincil Anahtar Kelime" value={result.focusKeyword} />

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          İkincil Anahtar Kelimeler
        </p>
        <div className="flex flex-wrap gap-1.5">
          {result.secondaryKeywords.map((kw, i) => (
            <CopyChip key={i} value={kw} />
          ))}
        </div>
      </div>

      <Field label="SEO Başlığı" value={result.seoTitle} hint={`${result.seoTitle.length} karakter`} multiline />
      <Field
        label="Meta Açıklama"
        value={result.metaDescription}
        hint={`${result.metaDescription.length} karakter`}
        multiline
      />
      <Field label="URL Slug Önerisi" value={result.urlSlugSuggestion} />

      <div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          İyileştirme Önerileri
        </p>
        <ul className="space-y-2">
          {result.improvementTips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-green-500" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Field({ label, value, hint, multiline }: { label: string; value: string; hint?: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="group relative rounded-xl border border-border bg-card p-3">
        <p className={`pr-9 text-sm text-foreground ${multiline ? "whitespace-pre-wrap" : "truncate"}`}>{value}</p>
        <button
          type="button"
          onClick={copy}
          className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          title="Kopyala"
        >
          {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  );
}

function CopyChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground hover:bg-muted cursor-pointer"
    >
      {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3 text-muted-foreground" />}
      {value}
    </button>
  );
}
