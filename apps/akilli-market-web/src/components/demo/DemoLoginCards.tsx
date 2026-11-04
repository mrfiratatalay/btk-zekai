"use client";

import { useState } from "react";
import { ShoppingBag, Store } from "lucide-react";
import { login } from "@/lib/api/auth";

const ACCOUNTS = [
  {
    key: "buyer",
    icon: ShoppingBag,
    title: "Alıcı olarak gir",
    name: "Burak Yılmaz",
    detail: "Biri yolda iki siparişi ve favorileri hazır.",
    email: "burak@ornekstore.com",
    password: "Buyer123!",
  },
  {
    key: "seller",
    icon: Store,
    title: "Satıcı olarak gir",
    name: "Mehmet Kaya · Mehmet Elektronik",
    detail: "12 ürünlü mağazayı yönet, yeni ürün ekle.",
    email: "mehmet@ornekstore.com",
    password: "Seller123!",
  },
] as const;

/** One click per role: the demo signs in with the seeded account, no password typing. */
export function DemoLoginCards({ returnUrl }: { returnUrl: string | null }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function enter(account: (typeof ACCOUNTS)[number]) {
    setBusy(account.key);
    setError("");
    try {
      const res = await login(account.email, account.password);
      window.location.href = returnUrl ?? (res.user.role === "Seller" ? "/seller" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo girişi yapılamadı.");
      setBusy(null);
    }
  }

  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-bold text-[#111827]">Demoyu tek tıkla keşfet</p>
      <div className="grid gap-2">
        {ACCOUNTS.map((account) => (
          <button
            key={account.key}
            type="button"
            disabled={busy !== null}
            onClick={() => enter(account)}
            className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] p-3 text-left transition hover:border-[#FF6000] hover:bg-orange-50 disabled:opacity-60"
          >
            <account.icon className="mt-0.5 size-5 shrink-0 text-[#FF6000]" />
            <span className="min-w-0">
              <span className="block text-sm font-bold text-[#111827]">
                {busy === account.key ? "Giriş yapılıyor…" : account.title}
              </span>
              <span className="block text-xs font-semibold text-[#374151]">{account.name}</span>
              <span className="block text-xs text-[#6B7280]">{account.detail}</span>
            </span>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <p className="mt-3 text-center text-xs text-[#9CA3AF]">ya da kendi demo hesabınla giriş yap</p>
    </div>
  );
}
