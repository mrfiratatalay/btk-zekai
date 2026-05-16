"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSellerProduct, updateProduct, type SellerProduct } from "@/lib/api/seller";
import { getCurrentUser } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { ShopHeader } from "@/components/shop/ShopHeader";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<SellerProduct | null>(null);
  const [form, setForm] = useState({ title: "", description: "", price: "", stock: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== "Seller") { window.location.href = "/login"; return; }
    if (!id) return;

    getSellerProduct(id)
      .then((p) => {
        setProduct(p);
        setForm({
          title: p.title,
          description: "",
          price: String(p.price),
          stock: String(p.stock),
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false);
    setSaving(true);
    try {
      await updateProduct(id, {
        title: form.title || undefined,
        description: form.description || undefined,
        price: form.price ? Number(form.price) : undefined,
        stock: form.stock ? Number(form.stock) : undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm outline-none focus:border-[#FF6000]";
  const labelClass = "mb-1.5 block text-sm font-semibold text-[#111827]";

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopHeader />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/seller"
          className="mb-6 flex cursor-pointer items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827]"
        >
          <ArrowLeft className="size-4" /> Panele Dön
        </Link>

        <h1 className="mb-6 text-2xl font-extrabold text-[#111827]">Ürünü Düzenle</h1>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white" />
            ))}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-semibold">
            ✓ Ürün başarıyla güncellendi.
          </div>
        )}

        {!loading && product && (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
            {/* Ürün özeti */}
            <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              {product.primaryImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.primaryImage} alt={product.title} className="size-16 rounded-lg object-cover" />
              )}
              <div>
                <p className="text-xs text-[#6B7280]">ID: {product.id}</p>
                <p className="text-xs text-[#6B7280]">Kategori: {product.category}</p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Ürün Adı</label>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Açıklama</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-[#D1D5DB] bg-white px-4 py-3 text-sm outline-none focus:border-[#FF6000]"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Güncellenmiş açıklama..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fiyat (₺)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Stok</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.stock}
                  onChange={(e) => update("stock", e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="h-11 flex-1 cursor-pointer rounded-xl bg-[#FF6000] text-white hover:bg-[#E65700] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
              <Link href={`/product/${product.id}`} target="_blank">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 cursor-pointer rounded-xl hover:border-[#FF6000] hover:text-[#FF6000]"
                >
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
