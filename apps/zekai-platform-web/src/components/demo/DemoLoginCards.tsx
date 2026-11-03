"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Store } from "lucide-react";
import { login } from "@/lib/api/auth";

const ACCOUNTS = [
  {
    key: "seller",
    icon: Store,
    title: "Satıcı olarak gir",
    name: "Mehmet Kaya · Mehmet Elektronik",
    detail: "Mağazası bağlı; simülasyon, AI içerik, paket ve müşteri sesi hazır.",
    email: "seller@zekai.com",
    password: "Seller123!",
  },
  {
    key: "buyer",
    icon: ShieldCheck,
    title: "Alıcı olarak gir",
    name: "Burak Yılmaz",
    detail: "4 kayıtlı analiz, bir karar odası ve bir kombin hazır.",
    email: "buyer@zekai.com",
    password: "Buyer123!",
  },
] as const;

/** One click per role: the demo signs in with the seeded account, no password typing. */
export function DemoLoginCards({ returnUrl }: { returnUrl: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function enter(account: (typeof ACCOUNTS)[number]) {
    setBusy(account.key);
    setError("");
    try {
      const res = await login(account.email, account.password);
      router.push(returnUrl ?? (res.user.role === "Seller" ? "/seller" : "/platform"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo girişi yapılamadı.");
      setBusy(null);
    }
  }

  return (
    <div className="mb-6">
      <p className="mb-1 text-sm font-bold text-foreground">Demoyu tek tıkla keşfet</p>
      <p className="mb-3 text-xs text-muted-foreground">Kurulum ya da şifre gerekmez; her şey bu tarayıcıda çalışır.</p>
      <div className="grid gap-2">
        {ACCOUNTS.map((account) => (
          <button
            key={account.key}
            type="button"
            disabled={busy !== null}
            onClick={() => enter(account)}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-muted/40 p-3 text-left transition-colors hover:border-foreground/30 hover:bg-muted disabled:opacity-60"
          >
            <account.icon className="mt-0.5 size-5 shrink-0 text-[#86c820] dark:text-[#ADFF41]" />
            <span className="min-w-0">
              <span className="block text-sm font-bold text-foreground">{busy === account.key ? "Giriş yapılıyor…" : account.title}</span>
              <span className="block text-xs font-semibold text-foreground/70">{account.name}</span>
              <span className="block text-xs text-muted-foreground">{account.detail}</span>
            </span>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
