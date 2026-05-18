"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Plus, Upload, X } from "lucide-react";
import { createProduct, updateProductImage } from "@/lib/api/seller";
import { getCurrentUser } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { ShopHeader } from "@/components/shop/ShopHeader";

const CATEGORIES = [
  { id: 1, name: "Elektronik" },
  { id: 2, name: "Spor & Outdoor" },
  { id: 3, name: "Mutfak" },
  { id: 4, name: "Ev & Yaşam" },
  { id: 5, name: "Aksesuar" },
  { id: 6, name: "Anne & Bebek" },
];

export default function NewProductPage() {
  const [form, setForm] = useState({
    title: "",
    brand: "",
    categoryId: 1,
    price: "",
    originalPrice: "",
    shortDescription: "",
    description: "",
    cargoText: "Ücretsiz Kargo",
    stock: "1",
  });

  // Görsel
  const [imageMode, setImageMode] = useState<"url" | "file">("url");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Özellikler
  const [features, setFeatures] = useState<Record<string, string>>({});
  const [addingFeature, setAddingFeature] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "Seller") window.location.href = "/login";
  }, []);

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function addFeature() {
    const k = newKey.trim();
    const v = newVal.trim();
    if (!k || !v) return;
    setFeatures((prev) => ({ ...prev, [k]: v }));
    setNewKey("");
    setNewVal("");
    setAddingFeature(false);
  }

  function removeFeature(key: string) {
    setFeatures((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Ürün adı zorunludur."); return; }
    if (!form.price || Number(form.price) <= 0) { setError("Geçerli bir fiyat girin."); return; }

    setLoading(true);
    try {
      const product = await createProduct({
        title: form.title,
        brand: form.brand || form.title,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        shortDescription: form.shortDescription,
        description: form.description,
        cargoText: form.cargoText,
        stock: Number(form.stock),
        primaryImageUrl: imageMode === "url" && imageUrl ? imageUrl : undefined,
        features: Object.keys(features).length > 0 ? features : undefined,
      });

      // Dosya seçildiyse ürün oluştuktan sonra yükle
      if (imageMode === "file" && imageFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        await updateProductImage(product.id, base64, imageFile.type);
      }

      window.location.href = "/seller";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ürün eklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm outline-none focus:border-[#FF6000]";
  const labelClass = "mb-1.5 block text-sm font-semibold text-[#111827]";
  const featureEntries = Object.entries(features);
  const displayPreview = imageMode === "url" ? imageUrl : imagePreview;

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopHeader />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/seller" className="mb-6 flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827]">
          <ArrowLeft className="size-4" /> Panele Dön
        </Link>

        <h1 className="mb-6 text-2xl font-extrabold text-[#111827]">Yeni Ürün Ekle</h1>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">

          {/* ── Görsel ── */}
          <div>
            <label className={labelClass}>Ürün Görseli</label>
            <div className="flex gap-4">
              {/* Önizleme */}
              <div className="relative size-28 shrink-0 overflow-hidden rounded-xl border border-[#E5E7EB] bg-gray-50">
                {displayPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={displayPreview} alt="Önizleme" className="size-full object-contain p-2" />
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
                    onClick={() => { setImageMode("url"); setImageFile(null); setImagePreview(""); }}
                    className={`flex-1 cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition-colors ${imageMode === "url" ? "bg-[#FF6000] text-white" : "text-[#6B7280] hover:text-[#111827]"}`}
                  >
                    URL Gir
                  </button>
                  <button
                    type="button"
                    onClick={() => { setImageMode("file"); setImageUrl(""); }}
                    className={`flex-1 cursor-pointer rounded-lg py-1.5 text-xs font-semibold transition-colors ${imageMode === "file" ? "bg-[#FF6000] text-white" : "text-[#6B7280] hover:text-[#111827]"}`}
                  >
                    Dosya Yükle
                  </button>
                </div>

                {imageMode === "url" && (
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="h-9 w-full rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm outline-none focus:border-[#FF6000]"
                  />
                )}

                {imageMode === "file" && (
                  <>
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
                      <p className="text-[11px] text-[#9CA3AF]">
                        Ürün kaydedilince görsel otomatik yüklenecek.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <hr className="border-[#F3F4F6]" />

          {/* Ürün Adı */}
          <div>
            <label className={labelClass}>Ürün Adı *</label>
            <input className={inputClass} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Bluetooth Kulaklık Pro X1" required />
          </div>

          {/* Marka & Kategori */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Marka</label>
              <input className={inputClass} value={form.brand} onChange={(e) => update("brand", e.target.value)} placeholder="TechSound" />
            </div>
            <div>
              <label className={labelClass}>Kategori</label>
              <select className={inputClass} value={form.categoryId} onChange={(e) => update("categoryId", Number(e.target.value))}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Fiyat */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Satış Fiyatı (₺) *</label>
              <input type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="599.99" required />
            </div>
            <div>
              <label className={labelClass}>İndirim Öncesi Fiyat (₺)</label>
              <input type="number" min="0" step="0.01" className={inputClass} value={form.originalPrice} onChange={(e) => update("originalPrice", e.target.value)} placeholder="799.99" />
            </div>
          </div>

          {form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
            <p className="text-xs font-semibold text-green-600">
              %{Math.round(((Number(form.originalPrice) - Number(form.price)) / Number(form.originalPrice)) * 100)} indirim uygulanacak
            </p>
          )}

          {/* Stok & Kargo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Stok</label>
              <input type="number" min="0" className={inputClass} value={form.stock} onChange={(e) => update("stock", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Kargo Bilgisi</label>
              <input className={inputClass} value={form.cargoText} onChange={(e) => update("cargoText", e.target.value)} />
            </div>
          </div>

          {/* Kısa Açıklama */}
          <div>
            <label className={labelClass}>Kısa Açıklama</label>
            <input className={inputClass} value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} placeholder="Ürünü kısaca tanımlayın" />
          </div>

          {/* Detaylı Açıklama */}
          <div>
            <label className={labelClass}>Detaylı Açıklama</label>
            <textarea rows={4} className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm outline-none focus:border-[#FF6000]"
              value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Ürün hakkında detaylı bilgi..." />
          </div>

          <hr className="border-[#F3F4F6]" />

          {/* Teknik Özellikler */}
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

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 h-11 cursor-pointer bg-[#FF6000] text-white hover:bg-[#E65700] disabled:opacity-60">
              {loading ? "Ekleniyor..." : "Ürünü Ekle"}
            </Button>
            <Link href="/seller">
              <Button type="button" variant="outline" className="h-11 cursor-pointer">İptal</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
