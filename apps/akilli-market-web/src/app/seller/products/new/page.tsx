"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "Seller") window.location.href = "/login";
  }, []);

  function update(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
          <div>
            <label className={labelClass}>Ürün Adı *</label>
            <input className={inputClass} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Bluetooth Kulaklık Pro X1" required />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Fiyat (₺) *</label>
              <input type="number" min="0" step="0.01" className={inputClass} value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="599.99" required />
            </div>
            <div>
              <label className={labelClass}>Orijinal Fiyat (₺)</label>
              <input type="number" min="0" step="0.01" className={inputClass} value={form.originalPrice} onChange={(e) => update("originalPrice", e.target.value)} placeholder="799.99" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Stok</label>
              <input type="number" min="0" className={inputClass} value={form.stock} onChange={(e) => update("stock", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Kargo</label>
              <input className={inputClass} value={form.cargoText} onChange={(e) => update("cargoText", e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Kısa Açıklama</label>
            <input className={inputClass} value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} placeholder="Ürünü kısaca tanımlayın" />
          </div>

          <div>
            <label className={labelClass}>Detaylı Açıklama</label>
            <textarea rows={4} className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm outline-none focus:border-[#FF6000]"
              value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Ürün hakkında detaylı bilgi..." />
          </div>

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
