"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  ImageIcon,
  Loader2,
  Pencil,
  Sparkles,
  Star,
  Tag,
  Type,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SellerProductPerformance } from "@/types/seller";
import { formatSellerPrice } from "@/lib/format";
import { getSellerImprovements } from "@/lib/seller-improvements";

type Tab = "info" | "photos" | "store";

const AI_TITLES: Record<string, string> = {
  "bluetooth-kulaklik-pro-x1": "Bluetooth 5.0 Kablosuz Kulaklık | 20 Saat Pil | Günlük Kullanım - Beyaz",
  "spor-ayakkabi-runflex": "RunFlex Hafif Tabanlı Spor Ayakkabı | Nefes Alan Taban | Günlük Koşu",
  "mutfak-robotu-compact": "CookMate 900W Kompakt Mutfak Robotu | 5 Hız | Paslanmaz Bıçak Seti",
};
const AI_DESCRIPTIONS: Record<string, string> = {
  "bluetooth-kulaklik-pro-x1":
    "Günlük müzik dinleme, video izleme ve kısa telefon görüşmeleri için tasarlanan kablosuz kulaklık. 20 saate kadar pil ömrü, hafif gövde ve kolay Bluetooth eşleştirme ile pratik kullanım sunar.\n\nÖnemli: Profesyonel oyun, düşük gecikme ve yüksek kaliteli mikrofon beklentisi olan kullanıcılar için önerilmez.",
  "spor-ayakkabi-runflex": "Günlük yürüyüş ve hafif koşu için tasarlanan spor ayakkabı.",
  "mutfak-robotu-compact": "Günlük mutfak kullanımı için 900W kompakt mutfak robotu.",
};
const AI_FEATURES: Record<string, string[]> = {
  "bluetooth-kulaklik-pro-x1": ["Bluetooth 5.0 bağlantı teknolojisi", "20 saate kadar pil ömrü", "Hafif ve ergonomik tasarım", "Çoklu cihaz eşleştirme", "IPX5 su direnci"],
  "spor-ayakkabi-runflex": ["Nefes alan mesh taban", "Hafif EVA ara taban", "Kaymaz dış taban"],
  "mutfak-robotu-compact": ["900W güçlü motor", "5 hız ayarı", "Paslanmaz çelik bıçak seti", "1.5L kapasite"],
};

const MISSING_PHOTOS = [
  { label: "Ön yüz görseli", done: false },
  { label: "Arka yüz görseli", done: true },
  { label: "Kullanım halinde", done: false },
  { label: "Lifestyle görseli", done: false },
  { label: "Kutu içeriği", done: false },
];

async function delay(ms = 700) {
  return new Promise((r) => setTimeout(r, ms));
}

export function SellerAIEdit({ product }: { product: SellerProductPerformance }) {
  const [tab, setTab] = useState<Tab>("info");
  const [title, setTitle] = useState(AI_TITLES[product.id] ?? product.title);
  const [description, setDescription] = useState(AI_DESCRIPTIONS[product.id] ?? "Ürün açıklaması burada.");
  const [features] = useState<string[]>(AI_FEATURES[product.id] ?? []);
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));

  /* editing state per field */
  const [editingField, setEditingField] = useState<string | null>(null);
  const [savedFields, setSavedFields] = useState<Set<string>>(new Set(["title", "description"]));

  /* suggestion apply state */
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);

  /* global save */
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [successField, setSuccessField] = useState<string | null>(null);

  async function applyField(id: string) {
    setEditingField(null);
    setSavedFields((s) => new Set(s).add(id));
    setSuccessField(id);
    toast.success("İyileştirilen başlık güncellendi");
    setTimeout(() => setSuccessField(null), 3000);
  }

  async function applySuggestion(id: string) {
    setApplyingId(id);
    await delay(700);
    setAppliedSuggestions((s) => new Set(s).add(id));
    setApplyingId(null);
    toast.success("Öneri uygulandı");
  }

  async function handleSave() {
    setSaving(true);
    await delay(1200);
    setSaving(false);
    setSaved(true);
  }

  const rating = (5 - product.returnRate / 20).toFixed(1);
  const sellerImprovements = getSellerImprovements(product);

  if (saved) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-500/10">
          <Check className="size-7 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">Kaydedildi!</h1>
        <p className="mt-2 text-sm text-gray-500">
          {appliedSuggestions.size + savedFields.size} iyileştirme uygulandı ve mağazaya gönderildi.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href={`/seller/product/${product.id}/simulation`}
            className="flex h-11 items-center gap-2 rounded-xl bg-green-500 px-6 text-sm font-bold text-white hover:bg-green-600"
          >
            Simülasyonu Yeniden Çalıştır
          </Link>
          <Link href="/seller/products" className="text-sm text-gray-400 hover:text-gray-700">← Ürünlere Dön</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-400">
        <Link href="/seller/products" className="hover:text-gray-600">Ürünlerim</Link>
        <ChevronRight className="size-3.5" />
        <Link href={`/seller/product/${product.id}`} className="hover:text-gray-600">Bluetooth Kulaklık</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-gray-600 dark:text-gray-300">AI ile Düzenle</span>
      </div>

      {/* Page header */}
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI ile Düzenle</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Önerilerinize göre ürün içeriğini güncelleyin.
        </p>
      </div>

      {/* Success toast banner */}
      {successField && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-500/20 dark:bg-green-500/8">
          <Check className="size-5 text-green-600 dark:text-green-400" />
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">İyileştirilen başlık güncellendi</p>
          <button onClick={() => setSuccessField(null)} className="ml-auto text-green-500 hover:text-green-700">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Product header */}
      <div className="mt-5 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm dark:border-white/8 dark:bg-white/4">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
          <Image src={product.image} alt={product.title} fill className="object-contain p-1.5" />
        </div>
        <p className="min-w-0 flex-1 truncate font-bold text-gray-900 dark:text-white">{product.title}</p>
        <div className="hidden items-center gap-6 text-center sm:flex">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{formatSellerPrice(product.price)}</p>
            <p className="text-[10px] text-gray-400">Fiyat</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{product.sales30d}</p>
            <p className="text-[10px] text-gray-400">Satış</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{rating}</p>
            <p className="text-[10px] text-gray-400">Puan</p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="mt-6 flex gap-6">
        {/* ── LEFT: tabbed editor ── */}
        <div className="min-w-0 flex-1">
          {/* Tab bar (underline style) */}
          <div className="flex border-b border-gray-100 dark:border-white/8">
            {([
              { key: "info" as Tab, label: "Ürün Bilgisi", icon: <Type className="size-3.5" /> },
              { key: "photos" as Tab, label: "Görseller", icon: <ImageIcon className="size-3.5" /> },
              { key: "store" as Tab, label: "Mağaza Bilgileri", icon: <Tag className="size-3.5" /> },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-1.5 px-4 pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px",
                  tab === t.key
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Ürün Bilgisi ── */}
          {tab === "info" && (
            <div className="mt-5 space-y-3 pb-6">
              {/* Ürün Başlığı */}
              <EditableField
                label="Ürün Başlığı"
                fieldId="title"
                isEditing={editingField === "title"}
                isSaved={savedFields.has("title")}
                onEdit={() => setEditingField("title")}
                onSave={() => applyField("title")}
                onCancel={() => setEditingField(null)}
              >
                {editingField === "title" ? (
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none focus:border-green-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    autoFocus
                  />
                ) : (
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{title}</p>
                )}
              </EditableField>

              {/* Ürün Açıklaması */}
              <EditableField
                label="Ürün Açıklaması"
                fieldId="description"
                isEditing={editingField === "description"}
                isSaved={savedFields.has("description")}
                onEdit={() => setEditingField("description")}
                onSave={() => applyField("description")}
                onCancel={() => setEditingField(null)}
              >
                {editingField === "description" ? (
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 leading-relaxed outline-none focus:border-green-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    autoFocus
                  />
                ) : (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {description}
                  </p>
                )}
              </EditableField>

              {/* Ana Başlık */}
              <EditableField
                label="Ana Başlık"
                fieldId="heading"
                isEditing={editingField === "heading"}
                isSaved={savedFields.has("heading")}
                onEdit={() => setEditingField("heading")}
                onSave={() => applyField("heading")}
                onCancel={() => setEditingField(null)}
              >
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  Günlük Kullanım İçin Tasarlanmış Premium Kablosuz Deneyim
                </p>
              </EditableField>

              {/* Ürün Özellikleri */}
              <EditableField
                label="Ürün Özellikleri"
                fieldId="features"
                isEditing={editingField === "features"}
                isSaved={savedFields.has("features")}
                onEdit={() => setEditingField("features")}
                onSave={() => applyField("features")}
                onCancel={() => setEditingField(null)}
              >
                <ul className="mt-2 space-y-1.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="size-1.5 rounded-full bg-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </EditableField>

              {/* Garanti */}
              <EditableField
                label="Garanti / İade Bilgisi"
                fieldId="warranty"
                isEditing={editingField === "warranty"}
                isSaved={savedFields.has("warranty")}
                onEdit={() => setEditingField("warranty")}
                onSave={() => applyField("warranty")}
                onCancel={() => setEditingField(null)}
              >
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  2 yıl resmi distribütör garantisi. Arıza durumunda ücretsiz teknik servis. 14 gün içinde sorunsuz iade.
                </p>
              </EditableField>

              {/* Güvenli Satın Al */}
              <EditableField
                label="Güvenli Satın Al"
                fieldId="trust"
                isEditing={false}
                isSaved={savedFields.has("trust")}
                onEdit={() => {}}
                onSave={() => {}}
                onCancel={() => {}}
                hiddenEdit
              >
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Orijinal Ürün", "Hızlı Kargo", "Kolay İade"].map((badge) => (
                    <span key={badge} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              </EditableField>
            </div>
          )}

          {/* ── Tab: Görseller ── */}
          {tab === "photos" && (
            <div className="mt-5 space-y-5 pb-6">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Mevcut Görseller</p>
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {[product.image, product.image, product.image].map((src, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-white/8 dark:bg-white/4">
                      <Image src={src} alt="" fill className="object-contain p-2" />
                    </div>
                  ))}
                  <div className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-300 dark:border-white/10">
                    <Camera className="size-6" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Eksik Fotoğraf Türleri</p>
                <p className="mt-0.5 text-xs text-gray-400">Bu fotoğrafları ekleyerek ürününüzün dönüşüm oranını artırın</p>
                <div className="mt-3 space-y-2.5">
                  {MISSING_PHOTOS.filter((p) => !p.done).map((photo) => (
                    <div key={photo.label} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm dark:border-white/8 dark:bg-white/4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                          <ImageIcon className="size-4 text-amber-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{photo.label}</p>
                      </div>
                      <button className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900">
                        Ekle <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Mağaza Bilgileri ── */}
          {tab === "store" && (
            <div className="mt-5 space-y-4 pb-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-white/4">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Fiyat & Stok</p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {[{ label: "Fiyat (₺)", val: price, set: setPrice }, { label: "Stok Adedi", val: stock, set: setStock }].map((f) => (
                    <div key={f.label}>
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">{f.label}</label>
                      <input
                        type="number"
                        value={f.val}
                        onChange={(e) => f.set(e.target.value)}
                        className="h-10 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 text-sm text-gray-900 outline-none focus:border-green-400 dark:border-white/8 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-white/4">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Arama Etiketleri</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["bluetooth kulaklık", "kablosuz", "20 saat pil", "günlük kullanım"].map((tag) => (
                    <span key={tag} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom save bar */}
          <div className="sticky bottom-0 flex items-center gap-3 border-t border-gray-100 bg-white py-4 dark:border-white/8 dark:bg-gray-950">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {saving ? "Kaydediliyor..." : "Teknik Olarak Kaydet"}
            </button>
            <Link
              href={`/seller/product/${product.id}`}
              className="flex h-11 items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:border-white/10 dark:text-gray-400"
            >
              İptal
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Zekti Önerileri ── */}
        <div className="hidden w-[260px] shrink-0 xl:block">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/8 dark:bg-white/4">
              <div className="px-5 pt-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-green-500" />
                  <p className="font-bold text-gray-900 dark:text-white">Zekti Önerileri</p>
                </div>
              </div>
              <div className="mt-4 space-y-px">
                {sellerImprovements.map((imp) => {
                  const applied = appliedSuggestions.has(imp.id);
                  const applying = applyingId === imp.id;
                  return (
                    <div
                      key={imp.id}
                      className={cn(
                        "flex items-start gap-3 px-5 py-4 transition-colors",
                        applied && "bg-green-50 dark:bg-green-500/5",
                      )}
                    >
                      {/* Circle check */}
                      <div className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                        applied
                          ? "border-green-500 bg-green-500"
                          : "border-gray-200 bg-white dark:border-white/15 dark:bg-transparent",
                      )}>
                        {applied && <Check className="size-3 text-white" />}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{imp.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400 line-clamp-2">{imp.rationale}</p>
                        <span className={cn(
                          "mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          imp.priority === "urgent"
                            ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                        )}>
                          {imp.expectedImpact}
                        </span>
                      </div>
                      {/* Apply arrow */}
                      {!applied && (
                        <button
                          onClick={() => applySuggestion(imp.id)}
                          disabled={applying}
                          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 dark:bg-green-500/10 dark:text-green-400"
                        >
                          {applying ? <Loader2 className="size-3 animate-spin" /> : <ArrowRight className="size-3" />}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Product thumbnails at bottom */}
              <div className="border-t border-gray-50 p-4 dark:border-white/5">
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">Ürün Görselleri</p>
                <div className="grid grid-cols-3 gap-2">
                  {[product.image, product.image, product.image].map((src, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-white/5">
                      <Image src={src} alt="" fill className="object-contain p-1.5" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {[1, 2, 3, 4].map((s) => <Star key={s} className="size-3 fill-amber-400 text-amber-400" />)}
                  <Star className="size-3 text-gray-200" />
                  <span className="ml-1 text-[10px] text-gray-400">128 yorum</span>
                </div>
                <p className="mt-1 text-xs font-bold text-gray-900 dark:text-white line-clamp-2">{product.title}</p>
                <p className="text-xs font-bold text-green-600 dark:text-green-400">{formatSellerPrice(product.price)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Editable field block ── */
function EditableField({
  label,
  fieldId,
  isEditing,
  isSaved,
  onEdit,
  onSave,
  onCancel,
  children,
  hiddenEdit = false,
}: {
  label: string;
  fieldId: string;
  isEditing: boolean;
  isSaved: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
  hiddenEdit?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-2xl border bg-white p-4 transition-colors dark:bg-white/4",
      isEditing ? "border-green-300 shadow-sm dark:border-green-500/40" : "border-gray-100 dark:border-white/8",
    )}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</p>
        <div className="flex items-center gap-2">
          {isSaved && !isEditing && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600 dark:text-green-400">
              <Check className="size-3" /> AI ile güncellendi
            </span>
          )}
          {!hiddenEdit && (
            <>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <button onClick={onSave} className="flex h-7 items-center gap-1 rounded-lg bg-green-500 px-2.5 text-[11px] font-bold text-white hover:bg-green-600">
                    <Check className="size-3" /> Kaydet
                  </button>
                  <button onClick={onCancel} className="h-7 rounded-lg px-2 text-[11px] text-gray-400 hover:text-gray-600">
                    İptal
                  </button>
                </div>
              ) : (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:text-gray-400"
                >
                  <Pencil className="size-3" /> Düzenle
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
