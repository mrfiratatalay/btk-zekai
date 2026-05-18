"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { createProduct } from "@/lib/api/seller";
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
    primaryImageUrl: "",
  });

  const [features, setFeatures] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [addingFeature, setAddingFeature] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "Seller") window.location.href = "/login";
  }, []);

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
    setFeatures((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Ürün adı zorunludur."); return; }
    if (!form.price || Number(form.price) <= 0) { setError("Geçerli bir fiyat girin."); return; }

    setLoading(true);
    try {
      await createProduct({
        title: form.title,
        brand: form.brand || form.title,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        shortDescription: form.shortDescription,
        description: form.description,
        cargoText: form.cargoText,
        stock: Number(form.stock),
        primaryImageUrl: form.primaryImageUrl || undefined,
        features: Object.keys(features).length > 0 ? features : undefined,
      });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopHeader />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/seller" className="mb-6 flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827]">
          <ArrowLeft className="size-4" /> Panele Dön
        </Link>

        <h1 className="mb-6 text-2xl font-extrabold text-[#111827]">Yeni Ürün Ekle</h1>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">

          {/* Başlık */}
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
                <input
                  autoFocus
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Escape") { setAddingFeature(false); setNewKey(""); setNewVal(""); } }}
                  placeholder="Özellik (ör. RAM)"
                  className="h-9 w-32 rounded-xl border border-[#D1D5DB] bg-white px-3 text-sm outline-none focus:border-[#FF6000]"
                />
                <input
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
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

          {/* Görsel URL */}
          <div>
            <label className={labelClass}>Görsel URL (opsiyonel)</label>
            <input className={inputClass} value={form.primaryImageUrl} onChange={(e) => update("primaryImageUrl", e.target.value)} placeholder="https://images.unsplash.com/..." />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 h-11 bg-[#FF6000] text-white hover:bg-[#E65700] disabled:opacity-60">
              {loading ? "Ekleniyor..." : "Ürünü Ekle"}
            </Button>
            <Link href="/seller">
              <Button type="button" variant="outline" className="h-11">İptal</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
