"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
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
  Info,
} from "lucide-react";
import { toast } from "sonner";
import type { SellerProductPerformance } from "@/types/seller";
import { formatSellerPrice } from "@/lib/format";
import {
  updateProductContent,
  generateAiContent,
  generateProductImages,
  applyProductImage,
  getStoreConnections,
  type GeneratedProductImageItem,
  type SimulationInsight,
} from "@/lib/api/seller";
import type { SyntheticPersona } from "@/types/seller";
import { useSearchParams } from "next/navigation";

const COMMERCE_API = process.env.NEXT_PUBLIC_COMMERCE_API_URL ?? "http://localhost:5001";

function loadSimulationInsight(productId: string): SimulationInsight | null {
  try {
    const raw = sessionStorage.getItem(`zekai_sim_${productId}`);
    if (!raw) return null;
    const { personas } = JSON.parse(raw) as { personas: SyntheticPersona[] };
    if (!personas?.length) return null;

    const skippers  = personas.filter((p) => p.decision === "skip");
    const undecided = personas.filter((p) => p.decision === "undecided");

    return {
      buyCount:          personas.filter((p) => p.decision === "buy").length,
      skipCount:         skippers.length,
      undecidedCount:    undecided.length,
      skipperReasons:    skippers.map((p) => `${p.name} (${p.segment}): ${p.reason}`),
      undecidedConcerns: undecided.map((p) => `${p.name} (${p.segment}): ${p.reason}`),
      recommendations:   personas.map((p) => p.recommendation).filter(Boolean),
    };
  } catch { return null; }
}

export function SellerAIEdit({ product }: { product: SellerProductPerformance }) {
  const [title, setTitle] = useState(product.title);
  const [shortDescription, setShortDescription] = useState(product.shortDescription);
  const [description, setDescription] = useState(product.description);
  const [features, setFeatures] = useState<string[]>(product.features);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiImprovementNote, setAiImprovementNote] = useState<string | null>(null);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [aiApplied, setAiApplied] = useState(false);
  const [addingFeature, setAddingFeature] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [isDraft, setIsDraft] = useState(false);

  // 3-shot generated images
  const [generatedImages, setGeneratedImages] = useState<GeneratedProductImageItem[]>([]);
  const [selectedImageType, setSelectedImageType] = useState<string | null>(null);
  const [applyingImage, setApplyingImage] = useState(false);
  const [appliedImageUrl, setAppliedImageUrl] = useState<string | null>(null);

  const [hasStoreConnection, setHasStoreConnection] = useState(false);
  const [simulationInsight, setSimulationInsight] = useState<SimulationInsight | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    getStoreConnections()
      .then((conns) => setHasStoreConnection(conns.some((c) => c.hasApiKey && c.status === "Connected")))
      .catch(() => setHasStoreConnection(false));
  }, []);

  useEffect(() => {
    if (searchParams.get("from") === "simulation") {
      const insight = loadSimulationInsight(product.id);
      if (insight) setSimulationInsight(insight);
    }
  }, [product.id, searchParams]);

  const optimizationScore = aiApplied ? "AI İçerik Uygulandı" : description ? "Temel İçerik Var" : "İçerik Eksik";

  const selectedImage = generatedImages.find((img) => img.type === selectedImageType) ?? null;

  async function handleGenerateCEO() {
    setAiGenerating(true);
    setAiImprovementNote(null);
    try {
      const result = await generateAiContent(product.id, simulationInsight ?? undefined);
      setTitle(result.title);
      setShortDescription(result.shortDescription);
      setDescription(result.description);
      if (result.features.length > 0) setFeatures(result.features);
      if (result.whatIImproved) setAiImprovementNote(result.whatIImproved);
      setAiApplied(true);
      setIsDraft(true);
      toast.success(simulationInsight ? "Simülasyon itirazları baz alınarak AI içerik üretildi" : "AI içerik üretildi — taslak olarak kaydedebilirsin");
    } catch {
      toast.error("İçerik üretilemedi. Lütfen tekrar dene.");
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleGenerateImages() {
    setImageGenerating(true);
    setGeneratedImages([]);
    setSelectedImageType(null);
    try {
      const result = await generateProductImages(product.id);
      if (result.images.length === 0) throw new Error("Görsel üretilemedi.");
      setGeneratedImages(result.images);
      setSelectedImageType(result.images[0]?.type ?? null);
      toast.success(`${result.images.length} görsel üretildi — birini seçip uygula`);
    } catch {
      toast.error("Görsel üretilemedi. Lütfen tekrar dene.");
    } finally {
      setImageGenerating(false);
    }
  }

  async function handleApplyImage() {
    if (!selectedImage) return;
    setApplyingImage(true);
    try {
      const result = await applyProductImage(product.id, selectedImage.imageBase64, selectedImage.mimeType);
      setAppliedImageUrl(result.imageUrl);
      setGeneratedImages([]);
      setSelectedImageType(null);
      toast.success("Görsel ürüne uygulandı");
    } catch {
      toast.error("Görsel kaydedilemedi.");
    } finally {
      setApplyingImage(false);
    }
  }

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

      <div className="mt-6 grid gap-5 lg:grid-cols-[300px_1fr]">

        {/* ── LEFT: Image panel ── */}
        <div className="flex flex-col gap-4">

          <div className="overflow-hidden rounded-2xl border border-border bg-card">

            {/* Main image display */}
            <div className="relative aspect-square bg-[#f8f8f8] dark:bg-white/5">
              {imageGenerating ? (
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="relative flex size-12 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-violet-400/20" />
                    <div className="relative flex size-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/15">
                      <Wand2 className="size-5 text-violet-500" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">3 görsel üretiliyor...</p>
                  <p className="text-[10px] text-gray-300">Stüdyo · Kutu Açma · Kullanım</p>
                </div>
              ) : selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`data:${selectedImage.mimeType};base64,${selectedImage.imageBase64}`}
                  alt={selectedImage.label}
                  className="size-full object-contain p-6"
                />
              ) : appliedImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${COMMERCE_API}${appliedImageUrl}`}
                  alt={product.title}
                  className="size-full object-contain p-6"
                />
              ) : (
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-contain p-6"
                  sizes="300px"
                />
              )}

              {/* Shot type badge */}
              {selectedImage && (
                <span className="absolute bottom-3 left-3 rounded-full bg-violet-600/90 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  {selectedImage.label}
                </span>
              )}
            </div>

            {/* Content status */}
            <div className="border-t border-gray-100 px-4 py-3 dark:border-white/8">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-gray-400">İçerik Durumu</p>
                <span className={`text-[11px] font-bold ${aiApplied ? "text-green-500" : description ? "text-amber-500" : "text-red-400"}`}>
                  {optimizationScore}
                </span>
              </div>
            </div>

            {/* Thumbnail strip — original + 3 generated shots */}
            <div className="flex gap-2 px-4 pb-3">
              {/* Current/applied product image */}
              <button
                onClick={() => setSelectedImageType(null)}
                className={`relative size-14 cursor-pointer overflow-hidden rounded-xl border bg-gray-50 transition-opacity hover:opacity-70 dark:bg-white/5 ${
                  !selectedImage ? "border-gray-300 dark:border-white/30" : "border-gray-100 dark:border-white/8"
                }`}
              >
                {appliedImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${COMMERCE_API}${appliedImageUrl}`} alt="" className="size-full object-contain p-1" />
                ) : (
                  <Image src={product.image} alt="" fill className="object-contain p-1" sizes="56px" />
                )}
              </button>

              {/* 3 generated shots */}
              {generatedImages.map((img) => (
                <button
                  key={img.type}
                  onClick={() => setSelectedImageType(img.type)}
                  className={`relative size-14 cursor-pointer overflow-hidden rounded-xl border bg-gray-50 transition-opacity hover:opacity-80 dark:bg-white/5 ${
                    selectedImageType === img.type
                      ? "border-2 border-violet-400"
                      : "border-gray-100 dark:border-white/8"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:${img.mimeType};base64,${img.imageBase64}`}
                    alt={img.label}
                    className="size-full object-contain p-1"
                  />
                  <span className="absolute bottom-0 left-0 right-0 bg-violet-600/80 py-0.5 text-center text-[7px] font-bold text-white leading-tight">
                    {img.label}
                  </span>
                </button>
              ))}

              {/* Placeholder slot when no generated images */}
              {generatedImages.length === 0 && !imageGenerating && (
                <button className="flex size-14 cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-200 text-gray-300 transition-colors hover:border-gray-300 hover:text-gray-400 dark:border-white/12">
                  <ImagePlus className="size-4" />
                </button>
              )}
            </div>

            {/* Image action row */}
            <div className="flex border-t border-gray-100 dark:border-white/8">
              <button
                onClick={handleGenerateImages}
                disabled={imageGenerating || applyingImage}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 py-3 text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-violet-400 dark:hover:bg-violet-500/8"
              >
                <Wand2 className="size-4" />
                {imageGenerating ? "Üretiliyor..." : "Görsel Üret (3 çekim)"}
              </button>
              {selectedImage && (
                <button
                  onClick={handleApplyImage}
                  disabled={applyingImage}
                  className="flex cursor-pointer items-center gap-1.5 border-l border-gray-100 px-4 py-3 text-sm font-bold text-green-600 transition-colors hover:bg-green-50 disabled:opacity-60 dark:border-white/8 dark:text-green-400 dark:hover:bg-green-500/8"
                >
                  {applyingImage ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  Uygula
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSaveDraft}
              disabled={saving || publishing}
              className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/8"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {saving ? "Kaydediliyor..." : "Taslak Kaydet"}
            </button>

            <button
              onClick={handlePublish}
              disabled={saving || publishing || !hasStoreConnection}
              title={!hasStoreConnection ? "Önce bir mağaza bağlamalısın" : undefined}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {publishing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {publishing ? "Yayınlanıyor..." : hasStoreConnection ? "Akıllı Market'e Yayınla" : "Mağaza Bağlı Değil"}
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
        <div className="overflow-hidden rounded-2xl border border-border bg-card">

          {/* Simulation context banner */}
          {simulationInsight && (
            <div className="flex items-start gap-3 border-b border-amber-100 bg-amber-50 px-5 py-3.5 dark:border-amber-500/15 dark:bg-amber-500/8">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-1">
                  Simülasyon Modu — AI müşteri itirazlarını baz alacak
                </p>
                <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70 leading-relaxed">
                  {simulationInsight.buyCount} satın aldı · {simulationInsight.skipCount} vazgeçti · {simulationInsight.undecidedCount} kararsız
                  {simulationInsight.skipperReasons.length > 0 && (
                    <> · İtiraz: &ldquo;{simulationInsight.skipperReasons[0].split(": ")[1]}&rdquo;</>
                  )}
                </p>
              </div>
              <button onClick={() => setSimulationInsight(null)} className="ml-auto shrink-0 text-amber-400 hover:text-amber-600">
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {/* AI improvement note */}
          {aiImprovementNote && (
            <div className="flex items-start gap-3 border-b border-green-100 bg-green-50 px-5 py-3.5 dark:border-green-500/15 dark:bg-green-500/8">
              <Info className="mt-0.5 size-3.5 shrink-0 text-green-600 dark:text-green-400" />
              <p className="text-xs leading-relaxed text-green-700 dark:text-green-300">{aiImprovementNote}</p>
              <button onClick={() => setAiImprovementNote(null)} className="ml-auto shrink-0 text-green-400 hover:text-green-600">
                <X className="size-3.5" />
              </button>
            </div>
          )}

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
          <button
            disabled={aiGenerating}
            onClick={handleGenerateCEO}
            className="flex w-full cursor-pointer items-center justify-center gap-2 border-t border-gray-100 py-3 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/8 dark:text-green-400 dark:hover:bg-green-500/8"
          >
            {aiGenerating
              ? <><Loader2 className="size-4 animate-spin" /> Üretiliyor (Vision + AI)...</>
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

          {/* Fiyat & Stok */}
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
