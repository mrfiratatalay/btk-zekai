"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  Bot,
  Check,
  ChevronRight,
  Eye,
  Lock,
  Loader2,
  Pencil,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { SellerProductPerformance } from "@/types/seller";
import { cn } from "@/lib/utils";
import { formatSellerPrice } from "@/lib/mock-data/seller";

/* ─── AI mock content ─── */
const AI_TITLES: Record<string, string> = {
  "bluetooth-kulaklik-pro-x1": "Bluetooth 5.0 Kablosuz Kulaklık | 20 Saat Pil | Günlük Kullanım - Beyaz",
  "spor-ayakkabi-runflex": "RunFlex Hafif Tabanlı Spor Ayakkabı | Nefes Alan Taban | Günlük Koşu",
  "mutfak-robotu-compact": "CookMate 900W Kompakt Mutfak Robotu | 5 Hız | Paslanmaz Bıçak Seti",
};
const AI_DESCRIPTIONS: Record<string, string> = {
  "bluetooth-kulaklik-pro-x1":
    "Yüksek performanslı, düşük gecikmeli Bluetooth kulaklık. Gün boyu konforlu kullanım ve net ses deneyimi sunar. Hem iş hem de günlük kullanım için idealdir.",
  "spor-ayakkabi-runflex": "Günlük yürüyüş ve hafif koşu için tasarlanan spor ayakkabı.",
  "mutfak-robotu-compact": "Günlük mutfak kullanımı için 900W kompakt mutfak robotu.",
};
const AI_FEATURES: Record<string, string[]> = {
  "bluetooth-kulaklik-pro-x1": ["Bluetooth 5.3", "15 saat pil ömrü", "Dokunmatik kontrol", "Bas güçlendirici"],
  "spor-ayakkabi-runflex": ["Nefes alan taban", "Hafif tasarım", "Kaymaz taban"],
  "mutfak-robotu-compact": ["900W motor", "5 hız ayarı", "Paslanmaz bıçak"],
};

type Tab = "content" | "photos" | "store";

/* ─── Modal ─── */
function SimulationModal({
  productId,
  product,
  onClose,
}: {
  productId: string;
  product: SellerProductPerformance;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push(`/seller/product/${productId}/simulation`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl dark:bg-gray-900">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <X className="size-4" />
        </button>

        <div className="flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-green-50">
            <Sparkles className="size-7 text-green-500" />
          </div>
        </div>

        <h2 className="mt-5 text-center text-xl font-bold text-gray-900 dark:text-white">
          Müşteri Simülasyonu Başlatılsın mı?
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          ZekAI, bu ürünü 12 farklı sentetik müşteri profiline göstererek başlık, fotoğraflar, açıklama, fiyat ve yorumları nasıl değerlendirdiklerini analiz edecek.
        </p>

        {/* Product mini-card */}
        <div className="mt-5 flex items-center gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-white">
            <Image src={product.image} alt={product.title} fill className="object-contain p-2" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-gray-900 dark:text-white">{product.title}</p>
            <p className="mt-0.5 text-sm text-gray-400">OrnekStore</p>
            <p className="mt-0.5 text-sm font-bold text-green-600 dark:text-green-400">
              {formatSellerPrice(product.price)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="h-12 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-white/15 dark:text-gray-300"
          >
            İptal
          </button>
          <button
            onClick={start}
            disabled={loading}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-green-500 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Başlatılıyor..." : "Simülasyonu Başlat"}
          </button>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <Lock className="size-3" />
          Simülasyon verileri gizlidir ve yalnızca sizinle paylaşılır.
        </p>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export function SellerProductDetail({ product }: { product: SellerProductPerformance }) {
  const [tab, setTab] = useState<Tab>("content");
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(
    AI_DESCRIPTIONS[product.id] ?? "Ürün açıklaması buraya gelecek.",
  );
  const [features] = useState<string[]>(AI_FEATURES[product.id] ?? []);
  const [titleGenerating, setTitleGenerating] = useState(false);
  const [descGenerating, setDescGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function generateTitle() {
    setTitleGenerating(true);
    await new Promise((r) => setTimeout(r, 900));
    setTitle(AI_TITLES[product.id] ?? product.title);
    setTitleGenerating(false);
    toast.success("Başlık güncellendi");
  }

  async function generateDesc() {
    setDescGenerating(true);
    await new Promise((r) => setTimeout(r, 1000));
    setDescription(AI_DESCRIPTIONS[product.id] ?? "");
    setDescGenerating(false);
    toast.success("Açıklama güncellendi");
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    toast.success("Ürün kaydedildi!");
  }

  if (saved) {
    return (
      <div className="mx-auto max-w-sm py-20 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-green-50">
          <Check className="size-7 text-green-500" />
        </div>
        <h2 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Kaydedildi!</h2>
        <p className="mt-2 text-sm text-gray-500">Değişiklikler mağazana gönderildi.</p>
        <Link
          href="/seller/products"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-green-500 px-6 text-sm font-bold text-white hover:bg-green-600"
        >
          Ürünlere Dön
        </Link>
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <SimulationModal productId={product.id} product={product} onClose={() => setShowModal(false)} />
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-400">
        <Link href="/seller/products" className="hover:text-gray-700 dark:hover:text-gray-200">
          Ürünlerim
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-gray-700 dark:text-gray-200">{product.title}</span>
      </nav>

      {/* Page title */}
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Product Studio</h1>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          Bu ürünü geliştir, test et ve performansını artır.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="mt-6 flex gap-6">

        {/* ══════ LEFT (main content) ══════ */}
        <div className="min-w-0 flex-1">

          {/* ── Product header card ── */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111]">

            {/* Product info row */}
            <div className="flex gap-6 p-6 pb-5">
              {/* Image */}
              <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/5">
                <Image src={product.image} alt={product.title} fill className="object-contain p-4" />
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.title}</h2>

                <div className="mt-2 flex items-center gap-3 text-sm text-gray-400">
                  <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    Aktif
                  </span>
                  <span>·</span>
                  <span>Oluşturulma: 21 May 2024</span>
                  <span>·</span>
                  <span>Güncelleme: 26 May 2024</span>
                </div>

                <div className="mt-4 flex items-center gap-8">
                  <div>
                    <p className="text-xs text-gray-400">Fiyat</p>
                    <p className="mt-1 text-xl font-black text-gray-900 dark:text-white">
                      {formatSellerPrice(product.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Stok</p>
                    <p className="mt-1 text-xl font-black text-gray-900 dark:text-white">{product.stock}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Durum</p>
                    <p className="mt-1 text-xl font-black text-green-600 dark:text-green-400">Aktif</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab bar — inside same card */}
            <div className="flex border-t border-gray-100 dark:border-white/8">
              {(
                [
                  { key: "content" as Tab, label: "Ürün İçeriği" },
                  { key: "photos" as Tab, label: "Görseller" },
                  { key: "store" as Tab, label: "Mağaza Bilgileri" },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex-1 py-3.5 text-sm font-semibold transition-colors",
                    tab === t.key
                      ? "border-b-2 border-green-500 text-green-600 dark:text-green-400"
                      : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab content — ONE white card, no separate boxes ── */}
          {tab === "content" && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white pb-6 dark:border-white/10 dark:bg-[#111]">
              {/* Ürün Başlığı */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Ürün Başlığı</label>
                  <button
                    onClick={generateTitle}
                    disabled={titleGenerating}
                    className="flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 disabled:opacity-50 dark:text-green-400"
                  >
                    {titleGenerating ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                    {titleGenerating ? "Üretiliyor..." : "AI ile Üret"}
                  </button>
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-3 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-green-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 dark:bg-white/8" />

              {/* Ürün Açıklaması */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Ürün Açıklaması</label>
                  <button
                    onClick={generateDesc}
                    disabled={descGenerating}
                    className="flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 disabled:opacity-50 dark:text-green-400"
                  >
                    {descGenerating ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                    {descGenerating ? "Üretiliyor..." : "AI ile Üret"}
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="mt-3 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-900 outline-none transition focus:border-green-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <p className="mt-1.5 text-right text-[11px] text-gray-300">
                  {description.length} / 5000
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 dark:bg-white/8" />

              {/* Öne Çıkan Özellikler */}
              <div className="p-6">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Öne Çıkan Özellikler
                </label>
                <ul className="mt-4 space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-500">
                        <Check className="size-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === "photos" && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#111]">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Ürün Görselleri</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
              <div className="mt-4 grid grid-cols-4 gap-3">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50">
                  <Image src={product.image} alt="" fill className="object-contain p-2" />
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 text-2xl text-gray-300 hover:border-green-400 hover:text-green-400"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {tab === "store" && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#111]">
              <p className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Mağaza Bilgileri</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Fiyat (₺)", val: String(product.price), type: "number" },
                  { label: "Stok", val: String(product.stock), type: "number" },
                  { label: "Kategori", val: product.category, type: "text" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">{f.label}</label>
                    <input
                      type={f.type}
                      defaultValue={f.val}
                      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 outline-none focus:border-green-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-green-500 py-4 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-60"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>

        {/* ══════ RIGHT (sidebar) ══════ */}
        <div className="hidden w-[280px] shrink-0 space-y-4 xl:block">

          {/* Bu ürün için aksiyonlar */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111]">
            <p className="px-5 pt-5 pb-3 text-sm font-bold text-gray-900 dark:text-white">
              Bu ürün için aksiyonlar
            </p>

            {/* AI ile Düzenle */}
            <Link
              href={`/seller/product/${product.id}/ai-edit`}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10">
                <Pencil className="size-4 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">AI ile Düzenle</p>
                <p className="text-xs text-gray-400">Başlık, açıklama, fiyat ve görselleri iyileştir.</p>
              </div>
              <ChevronRight className="size-4 text-gray-300 shrink-0" />
            </Link>

            {/* Müşteri Simülasyonu — yeşil highlight */}
            <div className="px-4 pb-2">
              <button
                onClick={() => setShowModal(true)}
                className="flex w-full items-center gap-3 rounded-2xl bg-green-500 p-4 text-left hover:bg-green-600"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Sparkles className="size-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">Müşteri Simülasyonuyla Test Et</p>
                  <p className="mt-0.5 text-xs text-green-100">12 farklı müşteri profiliyle test et ve analiz al.</p>
                </div>
                <ChevronRight className="size-4 text-white/60 shrink-0" />
              </button>
            </div>

            {/* Mağazada Gör */}
            <Link
              href={`/mock-shop/product/${product.id}`}
              className="flex items-center gap-3 border-t border-gray-100 px-5 py-3.5 hover:bg-gray-50 dark:border-white/8 dark:hover:bg-white/5"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10">
                <Eye className="size-4 text-gray-500 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Mağazada Gör</p>
                <p className="text-xs text-gray-400">Ürünün mağaza sayfasını görüntüle.</p>
              </div>
              <ChevronRight className="size-4 text-gray-300 shrink-0" />
            </Link>
          </div>

          {/* Mağaza Bilgileri */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111]">
            <p className="px-5 pt-5 pb-3 text-sm font-bold text-gray-900 dark:text-white">
              Mağaza Bilgileri
            </p>
            {[
              { label: "Mağaza Adı", value: "OrnekStore", green: false },
              { label: "Mağaza Puanı", value: "★ 4.6 (1.642)", green: false },
              { label: "Toplam Ürün", value: "128", green: false },
              { label: "Hızlı Kargo", value: "✓ Evet", green: true },
              { label: "İade Süresi", value: "14 gün", green: false },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className={cn(
                  "flex items-center justify-between px-5 py-2.5",
                  i < arr.length - 1 && "border-b border-gray-50 dark:border-white/5",
                )}
              >
                <span className="text-xs text-gray-400">{row.label}</span>
                <span className={cn("text-xs font-bold", row.green ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-gray-200")}>
                  {row.value}
                </span>
              </div>
            ))}
            <div className="p-1" />
          </div>

          {/* Varyantlar */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#111]">
            <p className="text-sm font-bold text-gray-900 dark:text-white">Varyantlar</p>
            <p className="mt-0.5 text-xs text-gray-400">Renk ve beden seçeneklerini yönet.</p>
            <button className="mt-3 flex h-9 w-full items-center justify-center rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-400">
              + Varyant Ekle
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
