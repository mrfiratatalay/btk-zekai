"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, ImagePlus, Loader2, Plus, Upload, X } from "lucide-react";
import { getSellerProduct, updateProduct, updateProductImage } from "@/lib/api/seller";
import { getProduct } from "@/lib/api/products";
import { getCurrentUser } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { ShopHeader } from "@/components/shop/ShopHeader";

const API_BASE =
  process.env.NEXT_PUBLIC_COMMERCE_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5001";

function resolveImage(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return url;
}

const CATEGORIES = [
  { id: 1, name: "Elektronik" },
  { id: 2, name: "Spor & Outdoor" },
  { id: 3, name: "Mutfak" },
  { id: 4, name: "Ev & Yaşam" },
  { id: 5, name: "Aksesuar" },
  { id: 6, name: "Anne & Bebek" },
];

const CATEGORIES_BY_NAME: Record<string, number> = {
  "Elektronik": 1, "Spor & Outdoor": 2, "Mutfak": 3,
  "Ev & Yaşam": 4, "Aksesuar": 5, "Anne & Bebek": 6,
};

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Görsel state
  const [currentImage, setCurrentImage] = useState("");
  const [imageMode, setImageMode] = useState<"url" | "file">("url");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    brand: "",
    categoryId: 1,
    price: "",
    originalPrice: "",
    shortDescription: "",
    description: "",
    cargoText: "Ücretsiz Kargo",
    stock: "",
  });

  // Özellikler state
  const [features, setFeatures] = useState<Record<string, string>>({});
  const [addingFeature, setAddingFeature] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "Seller") { window.location.href = "/login"; return; }
    if (!id) return;

    Promise.all([getSellerProduct(id), getProduct(id)])
      .then(([sp, pd]) => {
        const img = resolveImage(pd.images?.[0] ?? sp.primaryImage);
        setCurrentImage(img);
        setImageUrl(pd.images?.[0] ?? sp.primaryImage ?? "");
        setFeatures(pd.features ?? {});
        setForm({
          title: pd.title,
          brand: pd.brand ?? "",
          categoryId: CATEGORIES_BY_NAME[pd.category] ?? 1,
          price: String(pd.price),
          originalPrice: pd.originalPrice ? String(pd.originalPrice) : "",
          shortDescription: pd.shortDescription ?? "",
          description: pd.description ?? "",
          cargoText: pd.cargoText ?? "Ücretsiz Kargo",
          stock: String(sp.stock),
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function setField(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setSuccess(false);
  }

  async function handleUploadFile() {
    if (!imageFile) return;
    setUploadingImage(true);
    setError("");
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
      const result = await updateProductImage(id, base64, imageFile.type);
      const resolved = resolveImage(result.imageUrl);
      setCurrentImage(resolved);
      setImagePreview("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Görsel yüklenemedi.");
    } finally {
      setUploadingImage(false);
    }
  }

  function addFeature() {
    const k = newKey.trim();
    const v = newVal.trim();
    if (!k || !v) return;
    setFeatures((prev) => ({ ...prev, [k]: v }));
    setNewKey("");
    setNewVal("");
    setAddingFeature(false);
    setSuccess(false);
  }

  function removeFeature(key: string) {
    setFeatures((prev) => { const n = { ...prev }; delete n[key]; return n; });
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!form.price || Number(form.price) <= 0) { setError("Geçerli bir fiyat girin."); return; }

    setSaving(true);
    try {
      const originalPriceNum = form.originalPrice ? Number(form.originalPrice) : null;
      await updateProduct(id, {
        title: form.title,
        brand: form.brand,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        originalPrice: originalPriceNum ?? undefined,
        clearOriginalPrice: !form.originalPrice,
        stock: Number(form.stock),
        shortDescription: form.shortDescription,
        description: form.description,
        cargoText: form.cargoText,
        features,
        primaryImageUrl: imageMode === "url" && imageUrl ? imageUrl : undefined,
      });
      if (imageMode === "url" && imageUrl) {
        setCurrentImage(resolveImage(imageUrl));
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm outline-none focus:border-[#FF6000]";
  const labelClass = "mb-1.5 block text-sm font-semibold text-[#111827]";
  const featureEntries = Object.entries(features);
  const displayImage = imagePreview || currentImage;

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopHeader />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/seller" className="mb-6 flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827]">
          <ArrowLeft className="size-4" /> Panele Dön
        </Link>

        <h1 className="mb-6 text-2xl font-extrabold text-[#111827]">Ürünü Düzenle</h1>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white" />
            ))}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            <Check className="size-4" /> Ürün başarıyla güncellendi.
          </div>
        )}

        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">

            {/* ── Görsel ── */}
            <div>
              <label className={labelClass}>Ürün Görseli</label>
              <div className="flex gap-4">
                {/* Önizleme */}
                <div className="relative size-28 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-gray-50">
                  {displayImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayImage}
                      alt="Ürün görseli"
                      className="size-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#D1D5DB]">
                      <ImagePlus className="size-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  {/* Tab seçici */}
                  <div className="flex gap-1 rounded-xl border border-[#E5E7EB] p-1">
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`flex-1 cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition-colors ${imageMode === "url" ? "bg-[#FF6000] text-white" : "text-[#6B7280] hover:text-[#111827]"}`}
                    >
                      URL Gir
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("file")}
                      className={`flex-1 cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition-colors ${imageMode === "file" ? "bg-[#FF6000] text-white" : "text-[#6B7280] hover:text-[#111827]"}`}
                    >
                      Dosya Yükle
                    </button>
                  </div>

                  {imageMode === "url" && (
                    <input
                      value={imageUrl}
                      onChange={(e) => { setImageUrl(e.target.value); setSuccess(false); }}
                      placeholder="https://..."
                      className="h-9 w-full rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm outline-none focus:border-[#FF6000]"
                    />
                  )}

                  {imageMode === "file" && (
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#D1D5DB] text-xs font-semibold text-[#6B7280] hover:border-[#FF6000] hover:text-[#FF6000]"
                      >
                        <Upload className="size-3.5" />
                        {imageFile ? imageFile.name : "Dosya Seç"}
                      </button>
                      {imageFile && (
                        <button
                          type="button"
                          onClick={handleUploadFile}
                          disabled={uploadingImage}
                          className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF6000] text-xs font-bold text-white hover:bg-[#E65700] disabled:opacity-60"
                        >
                          {uploadingImage ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                          {uploadingImage ? "Yükleniyor..." : "Görseli Kaydet"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-[#F3F4F6]" />

            {/* ── Temel Bilgiler ── */}
            <div>
              <label className={labelClass}>Ürün Adı</label>
              <input className={inputClass} value={form.title} onChange={(e) => setField("title", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Marka</label>
                <input className={inputClass} value={form.brand} onChange={(e) => setField("brand", e.target.value)} placeholder="Marka adı" />
              </div>
              <div>
                <label className={labelClass}>Kategori</label>
                <select className={inputClass} value={form.categoryId} onChange={(e) => setField("categoryId", Number(e.target.value))}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Kısa Açıklama</label>
              <input className={inputClass} value={form.shortDescription} onChange={(e) => setField("shortDescription", e.target.value)} placeholder="Tek satırda ürün özeti" />
            </div>

            <div>
              <label className={labelClass}>Detaylı Açıklama</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm outline-none focus:border-[#FF6000]"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Ürün hakkında detaylı bilgi..."
              />
            </div>

            <hr className="border-[#F3F4F6]" />

            {/* ── Fiyat & Stok ── */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Satış Fiyatı (₺)</label>
                <input type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={(e) => setField("price", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>İndirim Öncesi Fiyat (₺)</label>
                <input type="number" min="0" step="0.01" className={inputClass} value={form.originalPrice} onChange={(e) => setField("originalPrice", e.target.value)} placeholder="Boş bırakırsan indirim kaldırılır" />
              </div>
            </div>

            {form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
              <p className="text-xs font-semibold text-green-600">
                %{Math.round(((Number(form.originalPrice) - Number(form.price)) / Number(form.originalPrice)) * 100)} indirim uygulanacak
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Stok</label>
                <input type="number" min="0" className={inputClass} value={form.stock} onChange={(e) => setField("stock", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Kargo Bilgisi</label>
                <input className={inputClass} value={form.cargoText} onChange={(e) => setField("cargoText", e.target.value)} />
              </div>
            </div>

            <hr className="border-[#F3F4F6]" />

            {/* ── Teknik Özellikler ── */}
            <div>
              <label className={labelClass}>Teknik Özellikler</label>
              <p className="mb-2 text-xs text-[#6B7280]">Alıcıya özellik tablosu olarak gösterilir — ör. <em>RAM → 16 GB</em></p>

              {featureEntries.length > 0 && (
                <div className="mb-3 overflow-hidden rounded-xl border border-[#E5E7EB]">
                  {featureEntries.map(([key, val]) => (
                    <div key={key} className="grid grid-cols-[1fr_1.5fr_auto] items-center divide-x divide-[#E5E7EB] border-b border-[#E5E7EB] last:border-b-0">
                      <span className="bg-gray-50 px-3 py-2.5 text-xs font-semibold text-[#6B7280]">{key}</span>
                      <span className="px-3 py-2.5 text-xs text-[#111827]">{val}</span>
                      <button type="button" onClick={() => removeFeature(key)} className="cursor-pointer px-3 py-2.5 text-[#D1D5DB] hover:text-red-400">
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {addingFeature ? (
                <div className="flex gap-2">
                  <input autoFocus value={newKey} onChange={(e) => setNewKey(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Escape") { setAddingFeature(false); setNewKey(""); setNewVal(""); } }}
                    placeholder="Özellik (ör. RAM)"
                    className="h-9 w-32 rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm outline-none focus:border-[#FF6000]"
                  />
                  <input value={newVal} onChange={(e) => setNewVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } if (e.key === "Escape") { setAddingFeature(false); setNewKey(""); setNewVal(""); } }}
                    placeholder="Değer (ör. 16 GB)"
                    className="h-9 flex-1 rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm outline-none focus:border-[#FF6000]"
                  />
                  <button type="button" onClick={addFeature} className="flex h-9 cursor-pointer items-center gap-1 rounded-xl bg-[#FF6000] px-3 text-xs font-bold text-white hover:bg-[#E65700]">Ekle</button>
                  <button type="button" onClick={() => { setAddingFeature(false); setNewKey(""); setNewVal(""); }} className="h-9 cursor-pointer rounded-xl px-2 text-[#9CA3AF] hover:text-[#374151]"><X className="size-4" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => setAddingFeature(true)} className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#FF6000]">
                  <Plus className="size-3.5" /> Özellik ekle
                </button>
              )}
            </div>

            <hr className="border-[#F3F4F6]" />

            {/* ── Kaydet ── */}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="h-11 flex-1 cursor-pointer rounded-xl bg-[#FF6000] text-white hover:bg-[#E65700] disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? <><Loader2 className="mr-1.5 size-4 animate-spin" /> Kaydediliyor...</> : "Değişiklikleri Kaydet"}
              </Button>
              <Link href={`/product/${id}`} target="_blank">
                <Button type="button" variant="outline" className="h-11 cursor-pointer rounded-xl hover:border-[#FF6000] hover:text-[#FF6000]">
                  Ürünü Gör
                </Button>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
