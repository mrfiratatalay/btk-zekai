"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const COMMERCE_WEB_URL = process.env.NEXT_PUBLIC_COMMERCE_WEB_URL ?? "http://localhost:3000";

/* ── Data ────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: "8", label: "AI Ajan" },
  { value: "30s", label: "Ortalama Analiz" },
  { value: "%94", label: "Doğruluk Oranı" },
  { value: "12", label: "Risk Ekseni" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Pişmanlık Riski Analizi",
    description: "Yorum forensiği, fiyat geçmişi ve iade verileriyle satın alma riskinizi 30 saniyede hesaplıyoruz.",
    color: "#ADFF41",
  },
  {
    icon: Bot,
    title: "8 Ajan, 1 Karar",
    description: "İhtiyaç Anlama'dan Doğrulama'ya uzanan çok adımlı agent akışı kanıtlanabilir sonuç üretir.",
    color: "#10B981",
  },
  {
    icon: TrendingUp,
    title: "Seller Copilot",
    description: "Ürün sayfalarını AI ile optimize et, güncellenmiş içeriği tek tuşla mağazana uygula.",
    color: "#3B82F6",
  },
  {
    icon: Users,
    title: "Sentetik Müşteri Paneli",
    description: "12 farklı alıcı profili simüle edilerek ürünün gerçek müşteri gözüyle nasıl göründüğü analiz edilir.",
    color: "#F59E0B",
  },
  {
    icon: BarChart3,
    title: "Fiyat & Pazar Analizi",
    description: "Fiyat geçmişi, pazar medyanı ve sahte indirim sinyallerini gerçek verilerle karşılaştırıyoruz.",
    color: "#8B5CF6",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli & KVKK Uyumlu",
    description: "Tüm veriler uçtan uca şifrelenir. KVKK ve GDPR uyumlu altyapı.",
    color: "#EC4899",
  },
];

const TESTIMONIALS = [
  {
    name: "Ayşe Kaya",
    role: "Ev Hanımı",
    avatar: "https://i.pravatar.cc/150?img=5",
    content: "Bir kulaklık almadan önce Zekai'yi kullandım. %62 pişmanlık riski göstermişti — satın almadım. Ay sonunda farklı ürünü aldım, hiç pişman olmadım.",
  },
  {
    name: "Emre Demir",
    role: "E-Ticaret Satıcısı",
    avatar: "https://i.pravatar.cc/150?img=8",
    content: "Seller Studio ile ürün açıklamalarımı güncelledim. İlk haftada iade oranım %23'ten %11'e düştü. Gerçekten işe yarıyor.",
  },
  {
    name: "Selin Arslan",
    role: "Yazılım Geliştirici",
    avatar: "https://i.pravatar.cc/150?img=9",
    content: "Agentic workflow ekranını ilk gördüğümde çok etkilendim. 8 ajanın sırayla çalıştığını izlemek harika.",
  },
];

const SCORE_BARS = [
  { label: "Uygunluk", score: 54, color: "#F59E0B" },
  { label: "Güven",    score: 41, color: "#EF4444" },
  { label: "Fiyat",   score: 35, color: "#EF4444" },
];

/* ── Component ───────────────────────────────────────────────────────────── */
export function ZekaiLanding() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#C1F25D]">
              <Sparkles className="size-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">ZekAI</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {["Özellikler", "Nasıl Çalışır", "Market", "Fiyatlandırma"].map((item) => (
              <Link
                key={item}
                href={item === "Market" ? COMMERCE_WEB_URL : "#"}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle className="text-muted-foreground hover:text-foreground" />
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              Giriş Yap
            </Link>
            <Link href="/register" className="rounded-full bg-[#C1F25D] px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-[#aadc2d]">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pb-16 pt-32 md:pb-24 md:pt-40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Left text */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <Zap className="size-3.5" />
                AI Commerce Platform
              </p>
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
                Satın almadan önce{" "}
                <span className="bg-gradient-to-r from-[#C1F25D] to-[#10B981] bg-clip-text text-transparent">
                  gerçeği öğren.
                </span>
              </h1>
              <p className="mb-8 mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Zekai, e-commerce ürünlerini alıcı ve satıcı perspektifinden analiz eden bağımsız
                bir AI SaaS platformudur. Pişmanlık riskini anında öğren.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/register" className="flex items-center gap-2 rounded-full bg-[#C1F25D] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#aadc2d]">
                  Hemen Başla
                  <ArrowRight className="size-4" />
                </Link>
                <Link href={COMMERCE_WEB_URL} className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground" style={{ borderWidth: "1.5px" }}>
                  <Store className="size-4" />
                  Market&apos;e Bak
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex">
                  {[5, 8, 9, 11, 13].map((i) => (
                    <img key={i} src={`https://i.pravatar.cc/150?img=${i}`}
                      className="-ml-2 first:ml-0 size-9 rounded-full border-2 border-background object-cover" alt="" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">10.000+ kullanıcı</p>
                  <p className="text-xs text-muted-foreground">⭐ 4.9 puan · 1.200+ yorum</p>
                </div>
              </div>
            </motion.div>

            {/* Right — dashboard card */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[32px] bg-card shadow-2xl border border-border">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="size-10 overflow-hidden rounded-xl border border-border bg-muted">
                      <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=80" className="h-full w-full object-cover" alt="" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Bluetooth Kulaklık Pro X1</p>
                      <p className="text-xs text-muted-foreground">₺1.015 · TeknoPazar Plus</p>
                    </div>
                  </div>

                  {/* Risk score */}
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-500/20 dark:bg-red-500/10">
                    <p className="text-4xl font-bold text-red-600 dark:text-red-400">%62</p>
                    <p className="mt-1 text-sm font-semibold text-red-500 dark:text-red-400">Pişmanlık Riski — Dikkatli Ol</p>
                  </div>

                  {/* Score bars */}
                  <div className="space-y-3">
                    {SCORE_BARS.map((s) => (
                      <div key={s.label}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-muted-foreground">{s.label}</span>
                          <span className="font-semibold text-foreground">{s.score}/100</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI message */}
                  <div className="mt-4 flex items-start gap-3 rounded-2xl bg-muted p-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#C1F25D]">
                      <Bot className="size-4 text-black" />
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      18 mikrofon şikayeti bulundu. Fiyat geçmişi sahte indirim paterni gösteriyor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating: agents */}
              <div className="absolute -top-5 -right-5 rounded-[20px] bg-card px-4 py-3 shadow-xl border border-border">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-semibold text-foreground">8 Ajan çalışıyor</p>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Yorum forensiği tamamlandı</p>
              </div>

              {/* Floating: seller */}
              <div className="absolute -bottom-4 -left-5 flex items-center gap-3 rounded-[20px] bg-card px-4 py-3 shadow-xl border border-border">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10">
                  <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">İade oranı düştü</p>
                  <p className="text-[11px] text-muted-foreground">%23 → %11 · Seller Studio</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats — bg-card ───────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="bg-gradient-to-r from-[#C1F25D] to-[#10B981] bg-clip-text text-5xl font-bold text-transparent">
                  {s.value}
                </p>
                <p className="mt-1.5 font-medium text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — bg-background ─────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#C1F25D]">ÖZELLİKLER</p>
            <h2 className="text-4xl font-bold text-foreground">AI ile Bilinçli Ticaret</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Alıcı ve satıcı için tasarlanmış, kanıta dayalı AI araçları.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group rounded-3xl border border-transparent bg-card p-7 shadow-none transition-all hover:-translate-y-2 hover:shadow-xl"
                  style={{ borderRadius: "24px" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = f.color + "4D"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                >
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl" style={{ backgroundColor: f.color + "1A", color: f.color }}>
                    <Icon className="size-7" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works — bg-card ───────────────────────────────────────── */}
      <section className="border-y border-border bg-card py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#C1F25D]">NASIL ÇALIŞIR?</p>
            <h2 className="text-4xl font-bold text-foreground">3 Adımda Analiz</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", icon: Store, title: "Ürüne bak", desc: "ZekAI Market'ten beğendiğin ürünün sayfasına git, linkini kopyala." },
              { step: "02", icon: Bot, title: "Yapıştır ve yaz", desc: "Linki Zekai'ye yapıştır, ihtiyacını doğal dille açıkla. 8 ajan devreye girer." },
              { step: "03", icon: ShieldCheck, title: "Raporu al", desc: "Pişmanlık Riski Raporu ve kişisel alternatif önerileriyle doğru kararı ver." },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center">
                  <p className="mb-2 text-8xl font-bold leading-none text-[#C1F25D]/20">{item.step}</p>
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[#C1F25D]/10">
                    <Icon className="size-5 text-[#5a8a00] dark:text-[#ADFF41]" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                  {idx < 2 && (
                    <ArrowRight className="absolute right-0 top-12 hidden size-5 text-muted-foreground/40 md:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials — bg-background ─────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#C1F25D]">KULLANICI YORUMLARI</p>
            <h2 className="text-4xl font-bold text-foreground">Ne Diyorlar?</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-3xl border border-border bg-card p-7" style={{ borderRadius: "24px" }}>
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} className="size-11 rounded-full object-cover" alt={t.name} />
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA dark (intentionally always dark) ─────────────────────────── */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="mx-auto max-w-4xl">
          <div
            className="relative overflow-hidden rounded-[32px] px-8 py-16 text-center text-white"
            style={{ background: "linear-gradient(135deg, #1f2203 0%, #103B1D 100%)" }}
          >
            <div className="pointer-events-none absolute -right-14 -top-14 size-52 rounded-full bg-[#C1F25D]/8" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full bg-[#C1F25D]/5" />
            <div className="relative">
              <h2 className="text-4xl font-bold md:text-5xl">
                Satın almadan önce <br />
                <span className="text-[#C1F25D]">güvende ol.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/65">
                Zekai&apos;yi ücretsiz dene. Alıcı veya satıcı olarak hemen başla — kredi kartı gerekmiyor.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/register" className="flex items-center gap-2 rounded-full bg-[#C1F25D] px-7 py-3 text-sm font-bold text-black transition-colors hover:bg-[#aadc2d]">
                  Ücretsiz Başla
                  <ArrowRight className="size-4" />
                </Link>
                <Link href={COMMERCE_WEB_URL} className="flex items-center gap-2 rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-white/60" style={{ borderWidth: "1.5px" }}>
                  Market&apos;i Gez
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#C1F25D]">
              <Sparkles className="size-4 text-black" />
            </div>
            <span className="font-bold text-foreground">ZekAI</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 ZekAI — AI Commerce Platform. Tüm hakları saklıdır.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            {["Gizlilik", "Kullanım Şartları", "İletişim"].map((l) => (
              <Link key={l} href="#" className="transition-colors hover:text-foreground">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
