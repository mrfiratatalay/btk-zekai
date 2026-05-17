"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Check,
  ChevronRight,
  ImagePlus,
  Loader2,
  Plus,
  Send,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { SellerProductPerformance } from "@/types/seller";
import { formatSellerPrice } from "@/lib/format";
import { updateProductContent } from "@/lib/api/seller";

async function delay(ms = 1600) {
  return new Promise((r) => setTimeout(r, ms));
}

const COMMERCE_WEB = process.env.NEXT_PUBLIC_COMMERCE_WEB_URL ?? "http://localhost:3000";

export function SellerAIEdit({ product }: { product: SellerProductPerformance }) {
  const [title, setTitle] = useState(product.title);
  const [shortDescription, setShortDescription] = useState(product.shortDescription);
  const [description, setDescription] = useState(product.description);
  const [features, setFeatures] = useState<string[]>(product.features);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));

  const [aiGenerating, setAiGenerating] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [aiApplied, setAiApplied] = useState(false);
  const [addingFeature, setAddingFeature] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [isDraft, setIsDraft] = useState(false);

  const optimizationScore = aiApplied ? 87 : description ? 54 : 28;

  async function handleGenerateCEO() {
    setAiGenerating(true);
    try {
      await delay(1800);
      const base = title.split("|")[0].trim();
      setTitle(`${base} | Profesyonel Kalite | Ücretsiz Kargo`);
      setShortDescription(`${product.category} kategorisinde öne çıkan, uzun ömürlü ve kullanıcı dostu ürün.`);
      setDescription(
        `${product.category} kategorisinde öne çıkan bu ürün, günlük kullanımda maksimum verim sunar. ` +
        `Dayanıklı yapısı ve kullanıcı dostu tasarımıyla uzun vadeli bir yatırım arayan alıcılara hitap eder.\n\n` +
        `Ürün kapsamlı test süreçlerinden geçmiş olup mağaza garantisi kapsamındadır.`
      );
      if (features.length === 0) {
        setFeatures([
          "Yüksek kalite malzeme",
          "Kullanıcı dostu ergonomik tasarım",
          "2 yıl distribütör garantisi",
          "Hızlı ve güvenli kargo",
          "Kolay iade imkânı",
        ]);
      }
      setAiApplied(true);
      setIsDraft(true);
      toast.success("CEO uyumlu içerik üretildi — taslak olarak kaydedebilirsin");
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleGenerateImage() {
    setImageGenerating(true);
    try {
      await delay(2500);
      toast.success("Görsel üretildi");
    } finally {
      setImageGenerating(false);
    }
  }

  // Sadece DB'ye kaydet, markette yayınlama
  async function handleSaveDraft() {
    setSaving(true);
    try {
      await updateProductContent(product.id, {
        title, shortDescription, description, features,
        price: Number(price), stock: Number(stock),
      }, { publish: false });
      setIsDraft(true);
      toast.success("Taslak kaydedildi");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Kayıt başarısız.");
    } finally {
      setSaving(false);
    }
  }

  // DB'ye kaydet + Akıllı Market cache'ini temizle
  async function handlePublish() {
    setPublishing(true);
    try {
      await updateProductContent(product.id, {
        title, shortDescription, description, features,
        price: Number(price), stock: Number(stock),
      }, { publish: true });
      setIsDraft(false);
      toast.success("Değişiklikler Akıllı Market'e yayınlandı");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Yayınlama başarısız.");
    } finally {
      setPublishing(false);
    }
  }

  function addFeature() {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    setFeatures((prev) => [...prev, trimmed]);
    setNewFeature("");
    setAddingFeature(false);
    setIsDraft(true);
  }

  function removeFeature(i: number) {
    setFeatures((prev) => prev.filter((_, idx) => idx !== i));
    setIsDraft(true);
  }

  return (
    <div className="pb-12">
      {/* Breadcrumb only — no redundant page title */}
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <Link href="/seller/products" className="transition-colors hover:text-gray-700 dark:hover:text-gray-200">
          Ürünlerim
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/seller/product/${product.id}`} className="max-w-[200px] truncate transition-colors hover:text-gray-700 dark:hover:text-gray-200">
          {product.title}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-gray-600 dark:text-gray-300">AI ile Düzenle</span>
        {isDraft && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            Taslak
          </span>
        )}
      </div>

      {/* Split layout */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[300px_1fr]">

        {/* ── LEFT: Image panel ── */}
        <div className="flex flex-col gap-4">

          {/* Image card */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/8 dark:bg-[#111]">
            {/* Main image */}
            <div className="relative aspect-square bg-[#f8f8f8] dark:bg-white/5">
              {imageGenerating ? (
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="relative flex size-12 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-violet-400/20" />
                    <div className="relative flex size-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/15">
                      <Wand2 className="size-5 text-violet-500" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Görsel üretiliyor...</p>
                </div>
              ) : (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-contain p-6"
                  sizes="300px"
                />
              )}
            </div>

            {/* Optimization score */}
            <div className="border-t border-gray-100 px-4 py-3 dark:border-white/8">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-gray-400">Optimizasyon</p>
                <span className={`text-[11px] font-bold ${optimizationScore >= 80 ? "text-green-500" : optimizationScore >= 50 ? "text-amber-500" : "text-red-400"}`}>
                  {optimizationScore}/100
                </span>
              </div>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${optimizationScore >= 80 ? "bg-green-500" : optimizationScore >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                  style={{ width: `${optimizationScore}%` }}
                />
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 px-4 pb-3">
              {[product.image, product.image].map((src, i) => (
                <button
                  key={i}
                  className="relative size-14 cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition-opacity hover:opacity-70 dark:border-white/8 dark:bg-white/5"
                >
                  <Image src={src} alt="" fill className="object-contain p-1" sizes="56px" />
                </button>
              ))}
              <button className="flex size-14 cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-200 text-gray-300 transition-colors hover:border-gray-300 hover:text-gray-400 dark:border-white/12">
                <ImagePlus className="size-4" />
              </button>
            </div>

            {/* AI generate button — clean, at the bottom */}
            <button
              onClick={handleGenerateImage}
              disabled={imageGenerating}
              className="flex w-full cursor-pointer items-center justify-center gap-2 border-t border-gray-100 py-3 text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/8 dark:text-violet-400 dark:hover:bg-violet-500/8"
            >
              <Wand2 className="size-4" />
              {imageGenerating ? "Üretiliyor..." : "AI ile Görsel Üret"}
            </button>
          </div>

          {/* Action buttons — clearly separated */}
          <div className="flex flex-col gap-2">
            {/* Secondary: draft save */}
            <button
              onClick={handleSaveDraft}
              disabled={saving || publishing}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/8"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {saving ? "Kaydediliyor..." : "Taslak Kaydet"}
            </button>

            {/* Primary: publish to marketplace */}
            <button
              onClick={handlePublish}
              disabled={saving || publishing}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-600 disabled:opacity-60"
            >
              {publishing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {publishing ? "Yayınlanıyor..." : "Akıllı Market'e Yayınla"}
            </button>

            <Link
              href={`/seller/product/${product.id}`}
              className="flex h-9 w-full items-center justify-center rounded-xl text-sm font-medium text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
            >
              İptal
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Content editor ── */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/8 dark:bg-[#111]">

          {/* Başlık */}
          <div className="px-6 pt-6 pb-5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ürün Başlığı</label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setIsDraft(true); }}
              className="mt-2 block w-full bg-transparent text-lg font-semibold leading-snug text-gray-900 outline-none placeholder-gray-300 dark:text-white"
              placeholder="Ürün başlığı..."
            />
          </div>

          <div className="border-t border-gray-100 dark:border-white/8" />

          {/* Açıklama */}
          <div className="px-6 pt-5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ürün Açıklaması</label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setIsDraft(true); }}
              rows={6}
              className="mt-2 block w-full resize-none bg-transparent text-sm leading-relaxed text-gray-700 outline-none placeholder-gray-300 dark:text-gray-300"
              placeholder="Açıklama yazın ya da AI ile otomatik üretin..."
            />
          </div>
          {/* AI içerik butonu — görsel butonuyla aynı dil */}
          <button
            disabled={aiGenerating}
            onClick={handleGenerateCEO}
            className="flex w-full cursor-pointer items-center justify-center gap-2 border-t border-gray-100 py-3 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/8 dark:text-green-400 dark:hover:bg-green-500/8"
          >
            {aiGenerating
              ? <><Loader2 className="size-4 animate-spin" /> Üretiliyor...</>
              : <><Sparkles className="size-4" /> AI ile İçerik Üret</>
            }
          </button>

          <div className="border-t border-gray-100 dark:border-white/8" />

          {/* Özellikler */}
          <div className="px-6 py-5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ürün Özellikleri</label>
            {features.length === 0 && !addingFeature ? (
              <p className="mt-2 text-sm text-gray-300 dark:text-gray-600">
                Henüz özellik eklenmemiş.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {features.map((f, i) => (
                  <li key={i} className="group flex items-start gap-2.5">
                    <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-green-500" />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{f}</span>
                    <button
                      onClick={() => removeFeature(i)}
                      className="mt-0.5 rounded p-0.5 text-gray-200 opacity-0 transition hover:text-red-400 group-hover:opacity-100 dark:text-white/20"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {addingFeature ? (
              <div className="mt-3 flex items-center gap-2">
                <input
                  autoFocus
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addFeature();
                    if (e.key === "Escape") { setAddingFeature(false); setNewFeature(""); }
                  }}
                  placeholder="Özellik yaz, Enter ile ekle..."
                  className="h-9 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none focus:border-green-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <button onClick={addFeature} className="flex h-9 items-center gap-1 rounded-xl bg-green-500 px-3 text-xs font-bold text-white hover:bg-green-600">
                  <Check className="size-3.5" /> Ekle
                </button>
                <button onClick={() => { setAddingFeature(false); setNewFeature(""); }} className="h-9 rounded-xl px-2 text-gray-400 hover:text-gray-600">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingFeature(true)}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-colors hover:text-green-500"
              >
                <Plus className="size-3.5" />
                Özellik ekle
              </button>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-white/8" />

          {/* Garanti */}
          <div className="px-6 py-5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Garanti & İade</label>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              2 yıl resmi distribütör garantisi · Ücretsiz teknik servis · 14 gün iade
            </p>
          </div>

          <div className="border-t border-gray-100 dark:border-white/8" />

          {/* Rozetler */}
          <div className="px-6 py-5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Güven Rozetleri</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Orijinal Ürün", "Hızlı Kargo", "Kolay İade"].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400"
                >
                  ✓ {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-white/8" />

          {/* Fiyat & Stok — sağ kartın en altında */}
          <div className="px-6 py-5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fiyat & Stok</label>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Fiyat (₺)", val: price, set: (v: string) => { setPrice(v); setIsDraft(true); } },
                { label: "Stok Adedi", val: stock, set: (v: string) => { setStock(v); setIsDraft(true); } },
              ].map((f) => (
                <div key={f.label}>
                  <label className="mb-1.5 block text-xs text-gray-400">{f.label}</label>
                  <input
                    type="number"
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    className="h-10 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-400/10 dark:border-white/8 dark:bg-white/5 dark:text-white"
                  />
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] text-gray-400">
              Mevcut fiyat: <span className="font-semibold text-gray-600 dark:text-gray-300">{formatSellerPrice(product.price)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
