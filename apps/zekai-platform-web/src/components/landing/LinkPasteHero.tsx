"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const COMMERCE_WEB_URL = process.env.NEXT_PUBLIC_COMMERCE_WEB_URL ?? "http://localhost:3000";

const EXAMPLE_LINKS = [
  { url: `${COMMERCE_WEB_URL}/product/bluetooth-kulaklik-pro-x1`, label: "Bluetooth Kulaklık Pro X1" },
  { url: `${COMMERCE_WEB_URL}/product/akilli-saat-fit-neo`, label: "Akıllı Saat FitNeo S3" },
  { url: `${COMMERCE_WEB_URL}/product/ergonomik-calisma-sandalyesi`, label: "Ergonomik Sandalye" },
];

function resolveProductId(url: string): string | null {
  const slugMap: Record<string, string> = {
    "bluetooth-kulaklik-pro-x1": "bluetooth-kulaklik-pro-x1",
    "akilli-saat-fit-neo": "akilli-saat-fit-neo",
    "ergonomik-calisma-sandalyesi": "ergonomik-calisma-sandalyesi",
    "seramik-taki-seti-beyaz": "seramik-taki-seti-beyaz",
    "spor-ayakkabi-ultra-boost": "spor-ayakkabi-ultra-boost",
    "kamera-lensli-akilli-robot-supurge": "kamera-lensli-akilli-robot-supurge",
  };
  for (const [slug] of Object.entries(slugMap)) {
    if (url.includes(slug)) return slug;
  }
  const match = url.match(/\/product\/([^/?#]+)/);
  if (match) return match[1];
  return null;
}

export function LinkPasteHero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!url.trim()) {
      setError("Lütfen bir ürün linki gir.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const productId = resolveProductId(url.trim());
    if (!productId) {
      setError(
        "Ürün bulunamadı. ZekAI Market'ten bir ürün linki kopyalayıp yapıştır."
      );
      setLoading(false);
      return;
    }
    router.push(`/platform?productId=${productId}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 pl-5 backdrop-blur-sm focus-within:border-[#adff41]/40 focus-within:bg-[#adff41]/5 transition-all">
          <Link2 className="shrink-0 size-5 text-white/30" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Ürün linkini buraya yapıştır..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
          <Button
            type="submit"
            disabled={loading}
            className="shrink-0 h-10 px-5 bg-[#adff41] text-[#0a0a0f] font-bold hover:bg-[#9aef30] disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                Ürünü Getir
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-400 text-left px-2">{error}</p>
        )}
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-white/25">Hızlı dene:</span>
        {EXAMPLE_LINKS.map((item) => (
          <button
            key={item.url}
            type="button"
            onClick={() => setUrl(item.url)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/40 hover:border-white/20 hover:text-white/60 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
