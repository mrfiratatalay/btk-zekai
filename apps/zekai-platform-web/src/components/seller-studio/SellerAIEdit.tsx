"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  ImagePlus,
  Info,
  Loader2,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useMockStore } from "@/lib/store/mock-store";
import type { SellerProductPerformance } from "@/types/seller";
import { formatSellerPrice } from "@/lib/format";
import {
  updateProductContent,
  generateAiContent,
  generateProductImage,
  applyProductImage,
  getStoreConnections,
  aiFeaturesToRecord,
  IMAGE_STYLE_LABELS,
  type ProductImageStyle,
  type GeneratedProductImageItem,
  type SimulationInsight,
} from "@/lib/api/seller";
import type { SyntheticPersona } from "@/types/seller";
import { useSearchParams } from "next/navigation";

const COMMERCE_API = process.env.NEXT_PUBLIC_COMMERCE_API_URL ?? "http://localhost:5001";

const CATEGORIES = [
  { id: 1, name: "Elektronik" },
  { id: 2, name: "Spor & Outdoor" },
  { id: 3, name: "Mutfak" },
  { id: 4, name: "Ev & Yaşam" },
  { id: 5, name: "Aksesuar" },
  { id: 6, name: "Anne & Bebek" },
];

function loadSimulationInsight(productId: string): SimulationInsight | null {
  // Önce sessionStorage (tab-içi en güncel), yoksa localStorage (önceki sekmeden kalan)
  const sources = [
    `zekai_sim_${productId}`,         // sessionStorage key — son simülasyon
    `zekai_sim_last_${productId}`,    // localStorage key — kalıcı son simülasyon
  ];
  try {
    let raw: string | null = null;
    for (const key of sources) {
      raw = sessionStorage.getItem(key) ?? localStorage.getItem(key);
      if (raw) break;
    }
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {children}
    </label>
  );
}

export function SellerAIEdit({ product }: { product: SellerProductPerformance }) {
  const [title, setTitle]                   = useState(product.title);
  const [brand, setBrand]                   = useState(product.brand);
  const [categoryId, setCategoryId]         = useState(product.categoryId);
  const [shortDescription, setShortDesc]    = useState(product.shortDescription);
  const [description, setDescription]       = useState(product.description);
  const [features, setFeatures]             = useState<Record<string, string>>(product.features);
  const [price, setPrice]                   = useState(String(product.price));
  const [originalPrice, setOriginalPrice]   = useState(product.originalPrice != null ? String(product.originalPrice) : "");
  const [cargoText, setCargoText]           = useState(product.cargoText);
  const [stock, setStock]                   = useState(String(product.stock));

  const [aiGenerating, setAiGenerating]           = useState(false);
  const [aiImprovementNote, setAiImprovementNote] = useState<string | null>(null);
  const [imageGenerating, setImageGenerating]     = useState(false);
  const [generatingStyle, setGeneratingStyle]     = useState<ProductImageStyle | null>(null);
  const [lightboxSrc, setLightboxSrc]             = useState<string | null>(null);
  const [publishing, setPublishing]               = useState(false);
  const [aiApplied, setAiApplied]                 = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [generatedImages, setGeneratedImages]       = useState<GeneratedProductImageItem[]>([]);
  const [selectedImageType, setSelectedImageType]   = useState<string | null>(null);
  const [applyingImage, setApplyingImage]           = useState(false);
  const [appliedImageUrl, setAppliedImageUrl]       = useState<string | null>(null);

  // Özellik ekleme
  const [addingFeature, setAddingFeature] = useState(false);
  const [newFeatureKey, setNewFeatureKey] = useState("");
  const [newFeatureVal, setNewFeatureVal] = useState("");
  // Satır düzenleme
  const [editingKey, setEditingKey]       = useState<string | null>(null);
  const [editingVal, setEditingVal]       = useState("");

  const [hasStoreConnection, setHasStoreConnection] = useState(false);
  const [simulationInsight, setSimulationInsight]   = useState<SimulationInsight | null>(null);

  const isMockMode = useMockStore((s) => s.isMockMode);
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
  const previewSrc = selectedImage
    ? `data:${selectedImage.mimeType};base64,${selectedImage.imageBase64}`
    : appliedImageUrl
      ? `${COMMERCE_API}${appliedImageUrl}`
      : product.image || null;
  const primarySimulationObjection = simulationInsight
    ? [...simulationInsight.skipperReasons, ...simulationInsight.undecidedConcerns]
        .map((item) => item.split(": ").slice(1).join(": ") || item)
        .filter(Boolean)[0] ?? null
    : null;
  const primarySimulationRecommendation = simulationInsight?.recommendations.filter(Boolean)[0] ?? null;

  function markUnsaved() { setHasUnsavedChanges(true); }

  function buildPayload() {
    const originalPriceNum = originalPrice ? Number(originalPrice) : null;
    return {
      title,
      shortDescription,
      description,
      features,
      price: Number(price),
      stock: Number(stock),
      brand,
      originalPrice: originalPriceNum ?? undefined,
      clearOriginalPrice: !originalPrice,
      cargoText,
      categoryId,
    };
  }

  async function handleGenerateContent() {
    setAiGenerating(true);
    setAiImprovementNote(null);
    try {
      const result = await generateAiContent(product.id, simulationInsight ?? undefined);
      setTitle(result.title);
      setShortDesc(result.shortDescription);
      setDescription(result.description);
      if (result.features.length > 0) setFeatures(aiFeaturesToRecord(result.features));
      if (result.whatIImproved) setAiImprovementNote(result.whatIImproved);
      setAiApplied(true);
      setHasUnsavedChanges(true);
      window.dispatchEvent(new Event("seller-records-updated"));
      toast.success(
        simulationInsight
          ? result._cached
            ? "Simülasyon bazlı kayıtlı AI içerik kullanıldı"
            : "Simülasyon sonucuna göre AI içerik üretildi"
          : result._cached
            ? "Kayıtlı AI içerik kullanıldı"
            : "AI içerik üretildi ve kaydedildi",
      );
    } catch {
      toast.error("İçerik üretilemedi. Lütfen tekrar dene.");
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleGenerateImage(style: ProductImageStyle) {
    setImageGenerating(true);
    setGeneratingStyle(style);
    try {
      const img = await generateProductImage(product.id, style);
      setGeneratedImages((prev) => [...prev.filter((p) => p.type !== style), img]);
      setSelectedImageType(style);
      window.dispatchEvent(new Event("seller-records-updated"));
      toast.success(img._cached ? `${IMAGE_STYLE_LABELS[style]} kayıtlı görseli kullanıldı` : `${IMAGE_STYLE_LABELS[style]} görseli üretildi ve kaydedildi`);
    } catch {
      toast.error("Görsel üretilemedi. Lütfen tekrar dene.");
    } finally {
      setImageGenerating(false);
      setGeneratingStyle(null);
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

  async function handlePublish() {
    setPublishing(true);
    try {
      await updateProductContent(product.id, buildPayload(), { publish: true });
      setHasUnsavedChanges(false);
      toast.success("Değişiklikler Akıllı Market'e yayınlandı");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Yayınlama başarısız.");
    } finally {
      setPublishing(false);
    }
  }

  function addFeature() {
    const k = newFeatureKey.trim();
    const v = newFeatureVal.trim();
    if (!k || !v) return;
    setFeatures((prev) => ({ ...prev, [k]: v }));
    setNewFeatureKey("");
    setNewFeatureVal("");
    setAddingFeature(false);
    markUnsaved();
  }

  function removeFeature(key: string) {
    setFeatures((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    markUnsaved();
  }

  function startEdit(key: string) {
    setEditingKey(key);
    setEditingVal(features[key] ?? "");
  }

  function commitEdit() {
    if (!editingKey) return;
    setFeatures((prev) => ({ ...prev, [editingKey]: editingVal }));
    setEditingKey(null);
    markUnsaved();
  }

  const featureEntries = Object.entries(features);

  return (
    <div className="pb-12">
      {/* Demo mod uyarısı — Gemini API limiti aşıldığında mock içerik üretilir */}
      {isMockMode && (aiApplied || generatedImages.length > 0) && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-400">
          <AlertTriangle className="size-4 shrink-0" />
          Demo mod — Gemini API kapasitesi geçici olarak doldu. Bu içerik gerçek AI çıktısı değil, örnek veridir. Daha sonra tekrar deneyin.
        </div>
      )}
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
        {hasUnsavedChanges && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            Yayınlanmadı
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:items-start">

        {/* ── SOL: Görsel paneli ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div
              onClick={() => { if (previewSrc && !imageGenerating) setLightboxSrc(previewSrc); }}
              className={`relative aspect-square bg-[#f8f8f8] dark:bg-white/5 ${previewSrc && !imageGenerating ? "cursor-zoom-in" : ""}`}
            >
              {imageGenerating ? (
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="relative flex size-12 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-green-400/20" />
                    <div className="relative flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/15">
                      <Wand2 className="size-5 text-green-500" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Görsel üretiliyor...</p>
                  <p className="text-[10px] text-gray-300">{generatingStyle ? IMAGE_STYLE_LABELS[generatingStyle] : ""}</p>
                </div>
              ) : selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`data:${selectedImage.mimeType};base64,${selectedImage.imageBase64}`} alt={selectedImage.label} className="size-full object-contain p-6" />
              ) : appliedImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`${COMMERCE_API}${appliedImageUrl}`} alt={product.title} className="size-full object-contain p-6" />
              ) : product.image ? (
                <Image src={product.image} alt={product.title} fill className="object-contain p-6" sizes="(min-width:1024px) 50vw, 100vw" />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-200 dark:text-white/10">
                  <ImagePlus className="size-12" />
                </div>
              )}
              {selectedImage && (
                <span className="absolute bottom-3 left-3 rounded-full bg-green-600/90 px-2.5 py-0.5 text-[10px] font-bold text-white">
                  {selectedImage.label}
                </span>
              )}
            </div>

            <div className="border-t border-gray-100 px-4 py-3 dark:border-white/8">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-gray-400">İçerik Durumu</p>
                <span className={`text-[11px] font-bold ${aiApplied ? "text-green-500" : description ? "text-amber-500" : "text-red-400"}`}>
                  {optimizationScore}
                </span>
              </div>
            </div>

            <div className="flex gap-2 px-4 pb-3">
              <button onClick={() => setSelectedImageType(null)} className={`relative size-14 cursor-pointer overflow-hidden rounded-xl border bg-gray-50 transition-opacity hover:opacity-70 dark:bg-white/5 ${!selectedImage ? "border-gray-300 dark:border-white/30" : "border-gray-100 dark:border-white/8"}`}>
                {appliedImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${COMMERCE_API}${appliedImageUrl}`} alt="" className="size-full object-contain p-1" />
                ) : product.image ? (
                  <Image src={product.image} alt="" fill className="object-contain p-1" sizes="56px" />
                ) : null}
              </button>
              {generatedImages.map((img) => (
                <button key={img.type} onClick={() => setSelectedImageType(img.type)} className={`relative size-14 cursor-pointer overflow-hidden rounded-xl border bg-gray-50 transition-opacity hover:opacity-80 dark:bg-white/5 ${selectedImageType === img.type ? "border-2 border-green-400" : "border-gray-100 dark:border-white/8"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`data:${img.mimeType};base64,${img.imageBase64}`} alt={img.label} className="size-full object-contain p-1" />
                  <span className="absolute bottom-0 left-0 right-0 bg-green-600/80 py-0.5 text-center text-[7px] font-bold text-white leading-tight">{img.label}</span>
                </button>
              ))}
              {generatedImages.length === 0 && !imageGenerating && (
                <button className="flex size-14 cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-200 text-gray-300 transition-colors hover:border-gray-300 hover:text-gray-400 dark:border-white/12">
                  <ImagePlus className="size-4" />
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-white/8">
              <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-white/8">
                {(["studio", "unboxing", "lifestyle"] as ProductImageStyle[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleGenerateImage(st)}
                    disabled={imageGenerating || applyingImage}
                    className="flex cursor-pointer flex-col items-center justify-center gap-1 py-3 text-xs font-semibold text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-500/8"
                  >
                    {generatingStyle === st ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                    {IMAGE_STYLE_LABELS[st]}
                  </button>
                ))}
              </div>
              {selectedImage && (
                <button onClick={handleApplyImage} disabled={applyingImage} className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-t border-gray-100 px-4 py-3 text-sm font-bold text-green-600 transition-colors hover:bg-green-50 disabled:opacity-60 dark:border-white/8 dark:text-green-400 dark:hover:bg-green-500/8">
                  {applyingImage ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  Uygula
                </button>
              )}
            </div>
          </div>

          {/* Aksiyon butonları */}
          <div className="flex flex-col gap-2">
            <button onClick={handlePublish} disabled={publishing || !hasStoreConnection} title={!hasStoreConnection ? "Önce bir mağaza bağlamalısın" : undefined} className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60">
              {publishing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {publishing ? "Yayınlanıyor..." : hasStoreConnection ? "Akıllı Market'e Yayınla" : "Mağaza Bağlı Değil"}
            </button>
            <Link href={`/seller/product/${product.id}`} className="flex h-9 w-full cursor-pointer items-center justify-center rounded-xl text-sm font-medium text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200">
              İptal
            </Link>
          </div>
        </div>

        {/* ── SAĞ: İçerik editörü ── */}
        <div className="space-y-px overflow-hidden rounded-2xl border border-border bg-card">

          {/* Simülasyon banner */}
          {simulationInsight && (
            <div className="flex items-start gap-3 border-b border-amber-100 bg-amber-50 px-5 py-3.5 dark:border-amber-500/15 dark:bg-amber-500/8">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-1">Simülasyona Göre AI Düzenleme Aktif</p>
                <p className="text-[11px] text-amber-600/80 dark:text-amber-400/70 leading-relaxed">
                  {simulationInsight.buyCount} satın aldı · {simulationInsight.skipCount} vazgeçti · {simulationInsight.undecidedCount} kararsız
                  {primarySimulationObjection && <> · Öncelikli itiraz: &ldquo;{primarySimulationObjection}&rdquo;</>}
                  {primarySimulationRecommendation && <> · AI ipucu: &ldquo;{primarySimulationRecommendation}&rdquo;</>}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  İçerik üretirken bu itirazlar ve öneriler AI prompt'una gönderilecek.
                </p>
              </div>
              <button onClick={() => setSimulationInsight(null)} className="cursor-pointer ml-auto shrink-0 text-amber-400 hover:text-amber-600"><X className="size-3.5" /></button>
            </div>
          )}

          {/* AI improvement notu */}
          {aiImprovementNote && (
            <div className="flex items-start gap-3 border-b border-green-100 bg-green-50 px-5 py-3.5 dark:border-green-500/15 dark:bg-green-500/8">
              <Info className="mt-0.5 size-3.5 shrink-0 text-green-600 dark:text-green-400" />
              <p className="text-xs leading-relaxed text-green-700 dark:text-green-300">{aiImprovementNote}</p>
              <button onClick={() => setAiImprovementNote(null)} className="cursor-pointer ml-auto shrink-0 text-green-400 hover:text-green-600"><X className="size-3.5" /></button>
            </div>
          )}

          {/* ── Temel Bilgiler ── */}
          <div className="px-6 pt-6 pb-5 space-y-4">
            <div>
              <SectionLabel>Ürün Başlığı</SectionLabel>
              <input value={title} onChange={(e) => { setTitle(e.target.value); markUnsaved(); }} className="mt-2 block w-full bg-transparent text-lg font-semibold leading-snug text-gray-900 outline-none placeholder-gray-300 dark:text-white" placeholder="Ürün başlığı..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SectionLabel>Marka</SectionLabel>
                <input value={brand} onChange={(e) => { setBrand(e.target.value); markUnsaved(); }} className="mt-2 block w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-400 dark:border-white/8 dark:bg-white/5 dark:text-white" placeholder="Marka adı" />
              </div>
              <div>
                <SectionLabel>Kategori</SectionLabel>
                <select value={categoryId} onChange={(e) => { setCategoryId(Number(e.target.value)); markUnsaved(); }} className="mt-2 block w-full cursor-pointer rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-green-400 dark:border-white/8 dark:bg-white/5 dark:text-white">
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/8" />

          {/* ── Kısa Açıklama ── */}
          <div className="px-6 py-5">
            <SectionLabel>Kısa Açıklama</SectionLabel>
            <input value={shortDescription} onChange={(e) => { setShortDesc(e.target.value); markUnsaved(); }} className="mt-2 block w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-400 dark:border-white/8 dark:bg-white/5 dark:text-gray-300" placeholder="Ürünü tek satırda özetle..." />
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/8" />

          {/* ── Detaylı Açıklama ── */}
          <div className="px-6 pt-5">
            <SectionLabel>Detaylı Açıklama</SectionLabel>
            <textarea value={description} onChange={(e) => { setDescription(e.target.value); markUnsaved(); }} rows={6} className="mt-2 block w-full resize-none bg-transparent text-sm leading-relaxed text-gray-700 outline-none placeholder-gray-300 dark:text-gray-300" placeholder="Açıklama yazın ya da AI ile otomatik üretin..." />
          </div>
          <button disabled={aiGenerating} onClick={handleGenerateContent} className="flex w-full cursor-pointer items-center justify-center gap-2 border-t border-gray-100 py-3 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/8 dark:text-green-400 dark:hover:bg-green-500/8">
            {aiGenerating ? (
              <><Loader2 className="size-4 animate-spin" /> Üretiliyor...</>
            ) : simulationInsight ? (
              <><Sparkles className="size-4" /> Simülasyona Göre AI ile Düzenle</>
            ) : (
              <><Sparkles className="size-4" /> AI ile İçerik Üret</>
            )}
          </button>

          <div className="h-px bg-gray-100 dark:bg-white/8" />

          {/* ── Teknik Özellikler (key-value) ── */}
          <div className="px-6 py-5">
            <SectionLabel>Teknik Özellikler</SectionLabel>
            <p className="mt-1 text-[11px] text-gray-400">Her satır alıcıya özellik tablosu olarak gösterilir (ör. RAM → 16 GB)</p>

            {featureEntries.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-xl border border-gray-100 dark:border-white/8">
                {featureEntries.map(([key, val]) => (
                  <div key={key} className="group grid grid-cols-[1fr_1.5fr_auto] items-center divide-x divide-gray-100 border-b border-gray-100 last:border-b-0 dark:divide-white/8 dark:border-white/8">
                    <span className="bg-gray-50 px-3 py-2.5 text-xs font-semibold text-gray-500 dark:bg-white/5">{key}</span>
                    {editingKey === key ? (
                      <input
                        autoFocus
                        value={editingVal}
                        onChange={(e) => setEditingVal(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingKey(null); }}
                        className="px-3 py-2 text-xs text-gray-700 outline-none dark:bg-transparent dark:text-gray-300"
                      />
                    ) : (
                      <span className="px-3 py-2.5 text-xs text-gray-700 dark:text-gray-300">{val}</span>
                    )}
                    <div className="flex gap-1 px-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => startEdit(key)} className="cursor-pointer rounded p-1 text-gray-300 hover:text-blue-400 dark:text-white/20"><Pencil className="size-3" /></button>
                      <button onClick={() => removeFeature(key)} className="cursor-pointer rounded p-1 text-gray-300 hover:text-red-400 dark:text-white/20"><X className="size-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {featureEntries.length === 0 && !addingFeature && (
              <p className="mt-3 text-sm text-gray-300 dark:text-gray-600">Henüz özellik eklenmemiş.</p>
            )}

            {addingFeature ? (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  autoFocus
                  value={newFeatureKey}
                  onChange={(e) => setNewFeatureKey(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Tab") { e.preventDefault(); } if (e.key === "Escape") { setAddingFeature(false); setNewFeatureKey(""); setNewFeatureVal(""); } }}
                  placeholder="Özellik adı (ör. RAM)"
                  className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none focus:border-green-400 dark:border-white/10 dark:bg-white/5 dark:text-white sm:w-32"
                />
                <div className="flex gap-2">
                  <input
                    value={newFeatureVal}
                    onChange={(e) => setNewFeatureVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addFeature(); if (e.key === "Escape") { setAddingFeature(false); setNewFeatureKey(""); setNewFeatureVal(""); } }}
                    placeholder="Değer (ör. 16 GB)"
                    className="h-9 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none focus:border-green-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                  <button onClick={addFeature} className="flex h-9 cursor-pointer items-center gap-1 rounded-xl bg-green-500 px-3 text-xs font-bold text-white hover:bg-green-600"><Check className="size-3.5" /> Ekle</button>
                  <button onClick={() => { setAddingFeature(false); setNewFeatureKey(""); setNewFeatureVal(""); }} className="h-9 cursor-pointer rounded-xl px-2 text-gray-400 hover:text-gray-600"><X className="size-4" /></button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingFeature(true)} className="mt-3 flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-gray-400 transition-colors hover:text-green-500">
                <Plus className="size-3.5" /> Özellik ekle
              </button>
            )}
          </div>

          <div className="h-px bg-gray-100 dark:bg-white/8" />

          {/* ── Fiyat, İndirim, Stok, Kargo ── */}
          <div className="px-6 py-5">
            <SectionLabel>Fiyat & Stok</SectionLabel>
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Satış Fiyatı (₺)", val: price, set: (v: string) => { setPrice(v); markUnsaved(); }, type: "number" },
                { label: "İndirim Öncesi (₺)", val: originalPrice, set: (v: string) => { setOriginalPrice(v); markUnsaved(); }, type: "number" },
                { label: "Stok Adedi", val: stock, set: (v: string) => { setStock(v); markUnsaved(); }, type: "number" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="mb-1.5 block text-xs text-gray-400">{f.label}</label>
                  <input
                    type={f.type}
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    className="h-10 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-400/10 dark:border-white/8 dark:bg-white/5 dark:text-white"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1.5 block text-xs text-gray-400">Kargo Bilgisi</label>
                <input
                  type="text"
                  value={cargoText}
                  onChange={(e) => { setCargoText(e.target.value); markUnsaved(); }}
                  className="h-10 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-400/10 dark:border-white/8 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>
            {originalPrice && Number(originalPrice) > Number(price) && (
              <p className="mt-2 text-[11px] font-semibold text-green-500">
                %{Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)} indirim uygulanacak
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-gray-400">
              Mevcut fiyat: <span className="font-semibold text-gray-600 dark:text-gray-300">{formatSellerPrice(product.price)}</span>
            </p>
          </div>
        </div>
      </div>

      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
        >
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute right-5 top-5 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Kapat"
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt={product.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full cursor-default rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
