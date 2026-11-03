"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZekaiLogo } from "@/components/ui/ZekaiLogo";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Menu,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const COMMERCE_WEB_URL = process.env.NEXT_PUBLIC_COMMERCE_WEB_URL ?? "http://localhost:3000";

/* ── Data ────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: "3 adım", label: "Şeffaf Karar Akışı" },
  { value: "4", label: "Karar Skoru" },
  { value: "5", label: "Müşteri Profili" },
  { value: "1 tuş", label: "Mağazaya Uygula" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Pişmanlık Riski Analizi",
    description: "Yorum forensiği, fiyat geçmişi ve şikayet verileri birleştirilerek %0–100 risk skoru ve ALABİLİRSİN / DİKKATLİ İLERLE / ALTERNATİFE BAK kararı üretilir.",
    color: "#ADFF41",
    audience: "Alıcı",
  },
  {
    icon: Bot,
    title: "Şeffaf Karar Akışı",
    description: "Danışman → gerekirse piyasa kontrolü → karar motoru. Skorları yapay zekâ üretir, son kararı açık eşiklerle çalışan kod verir; her adım ekranda izlenir.",
    color: "#10B981",
    audience: "Alıcı",
  },
  {
    icon: BarChart3,
    title: "Karar Odası & Karşılaştırma",
    description: "Birden fazla ürünü aynı projeye bağla, bütçe ve amaç belirle. 2-3 ürünü yan yana karşılaştır, AI hangi ürünün daha iyi fit olduğunu gerekçesiyle açıklar.",
    color: "#8B5CF6",
    audience: "Alıcı",
  },
  {
    icon: Users,
    title: "Sentetik Müşteri Simülasyonu",
    description: "5 farklı alıcı profili ürününü test eder; kimin neden satın alıp almadığını, hangi ürün öğesine (başlık, fiyat, garanti…) odaklandığını animasyonlu olarak gösterir.",
    color: "#F59E0B",
    audience: "Satıcı",
  },
  {
    icon: TrendingUp,
    title: "AI İçerik & Görsel Editörü",
    description: "Simülasyon bulgularını kullanarak başlık, açıklama, teknik özellikler ve fiyatı AI ile yeniden yaz. 3 stil seçeneğiyle ürün görseli üret. Tek tuşla mağazana uygula.",
    color: "#3B82F6",
    audience: "Satıcı",
  },
  {
    icon: Sparkles,
    title: "Müşteri Sesi AI & Sosyal Medya",
    description: "Yorum yanıtlarını ve FAQ önerilerini AI ile hazırla, onaylayıp mağazaya yayınla. Instagram, TikTok ve X için 3 ton ve 3 amaç seçeneğiyle içerik üret.",
    color: "#EC4899",
    audience: "Satıcı",
  },
];

const SCENARIOS = [
  {
    tag: "Alıcı Senaryosu",
    tagColor: "#C1F25D",
    icon: ShieldCheck,
    title: "Kulaklık satın almadan önce",
    content: "Ürün linki yapıştırıldı, ihtiyaç metni yazıldı. Danışman yorumlarda tekrar eden mikrofon şikâyetlerini buldu, piyasa kontrolü fiyatı benzer ürünlerle karşılaştırdı. Karar motoru: Dikkatli İlerle.",
  },
  {
    tag: "Satıcı Senaryosu",
    tagColor: "#3B82F6",
    icon: Users,
    title: "Ürün sayfası simülasyonu",
    content: "5 sentetik müşteri profili ürünü test etti. 3 persona 'fiyat net değil' gerekçesiyle vazgeçti. AI, başlık ve açıklamayı optimize etti; güncellenmiş içerik tek tuşla mağazaya uygulandı.",
  },
  {
    tag: "Alıcı Senaryosu",
    tagColor: "#C1F25D",
    icon: Bot,
    title: "Şeffaf karar",
    content: "Danışman → Piyasa kontrolü → Karar motoru — her adım ekranda izlenebilir; kararın hangi kuraldan çıktığı gerekçesiyle görülür.",
  },
];

const SCORE_BARS = [
  { label: "Uygunluk", score: 54, color: "#F59E0B" },
  { label: "Güven",    score: 41, color: "#EF4444" },
  { label: "Fiyat",   score: 35, color: "#EF4444" },
];

const BUYER_STEPS = [
  { step: "01", icon: Store, title: "Ürüne bak", desc: "Akıllı Market'te beğendiğin ürünün sayfasına git, linkini kopyala." },
  { step: "02", icon: Bot, title: "Yapıştır ve yaz", desc: "Linki ZekAI'ye yapıştır, ihtiyacını doğal dille açıkla. Danışman ürünü, yorumları ve fiyatı birlikte değerlendirir." },
  { step: "03", icon: ShieldCheck, title: "Raporu al", desc: "Pişmanlık Riski Raporu ve kişisel alternatif önerileriyle doğru kararı ver." },
];

const SELLER_STEPS = [
  { step: "01", icon: Store, title: "Mağazanı bağla", desc: "Seller Studio'ya giriş yap, API key ile Akıllı Market mağazanı bağla ve ürünlerini platforma getir." },
  { step: "02", icon: Users, title: "Simüle et & analiz et", desc: "5 sentetik müşteri profili ürününü test eder. Kimin neden satın aldığı, hangi öğenin (başlık, fiyat, garanti…) kararı etkilediği görülür. Müşteri yorumlarına AI yanıt taslakları üretilir." },
  { step: "03", icon: TrendingUp, title: "Düzenle, yayınla, paylaş", desc: "AI ile başlık, açıklama ve görseli yenile; tek tuşla mağazana uygula. Instagram, TikTok ve X için içerik üret, müşteri sorularına FAQ oluştur." },
];

const BUYER_BENEFITS = [
  "Uyum, güven, fiyat ve iade riski skorlarıyla ürün analizi",
  "Pişmanlık riski skoru — ALABİLİRSİN / DİKKATLİ İLERLE / ALTERNATİFE BAK",
  "Gerektiğinde piyasa fiyatlarıyla karşılaştırma",
  "Kişisel ihtiyaca göre alternatif ürün önerisi",
  "Karar Odası — projeye göre ürün gruplayıp bütçe takibi",
  "2-3 ürün yan yana karşılaştırma, AI karar gerekçesi",
  "Analizleri kaydet, durum takibi yap (Düşünüyorum → Satın Aldım)",
];

const SELLER_BENEFITS = [
  "Sentetik müşteri simülasyonu — 5 profil, animasyonlu, canlı akış",
  "Müşteri bazlı karar gerekçesi; hangi ürün öğesi kaybettiriyor",
  "AI ile başlık, açıklama, teknik özellik ve fiyat düzenleme",
  "AI ürün görseli üreteci (studio, unboxing, lifestyle stilleri)",
  "Müşteri Sesi AI — yorum yanıtları ve FAQ'ları AI ile yayınla",
  "Sosyal medya içerik üreteci — Instagram, TikTok, X",
];

const NAV_LINKS = [
  { label: "Kim İçin?", href: "#kim-icin" },
  { label: "Özellikler", href: "#ozellikler" },
  { label: "Nasıl Çalışır?", href: "#nasil-calisir" },
  { label: "Market", href: COMMERCE_WEB_URL },
];

/* ── Component ───────────────────────────────────────────────────────────── */
export function ZekaiLanding() {
  const [activeFlow, setActiveFlow] = useState<"buyer" | "seller">("buyer");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link href="/" onClick={closeMobileMenu}>
            <ZekaiLogo size="lg" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle className="text-muted-foreground hover:text-foreground" />

            {/* Desktop auth buttons */}
            <Link
              href="/login"
              className="hidden md:block rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="hidden md:block rounded-full bg-[#C1F25D] px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-[#aadc2d]"
            >
              Ücretsiz Başla
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="md:hidden flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Menüyü aç/kapat"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden border-t border-border bg-background md:hidden"
            >
              <div className="flex flex-col px-4 py-4 gap-1">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="rounded-full border border-border px-5 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="rounded-full bg-[#C1F25D] px-5 py-2.5 text-center text-sm font-bold text-black transition-colors hover:bg-[#aadc2d]"
                  >
                    Ücretsiz Başla
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pb-16 pt-28 sm:pt-32 md:pb-24 md:pt-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-10 md:gap-12 md:grid-cols-2">

            {/* Left text */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <Zap className="size-3.5" />
                AI Commerce Platform · Alıcı & Satıcı
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Alıcıya güven.{" "}
                <span className="bg-gradient-to-r from-[#C1F25D] to-[#10B981] bg-clip-text text-transparent">
                  Satıcıya içgörü.
                </span>
              </h1>
              <p className="mb-8 mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
                Zekai, e-ticarette her iki tarafın da doğru kararı vermesini sağlayan bağımsız bir AI platformudur.
                Alıcılar için pişmanlık riski analizi, Karar Odası ve karşılaştırma motoru; satıcılar için müşteri simülasyonu, AI içerik editörü, Müşteri Sesi AI ve sosyal medya araçları — tek çatı altında.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/register" className="flex items-center gap-2 rounded-full bg-[#C1F25D] px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-[#aadc2d]">
                  Ücretsiz Başla
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="/seller" className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground" style={{ borderWidth: "1.5px" }}>
                  <Store className="size-4" />
                  Satıcı mısınız?
                </Link>
              </div>

              {/* Dual audience pill badges */}
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-[#C1F25D]/30 bg-[#C1F25D]/10 px-3 py-1.5 text-xs font-semibold text-[#5a8a00] dark:text-[#C1F25D]">
                  <ShieldCheck className="size-3.5" />
                  Alıcılar için pişmanlık önleme
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-blue-300/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <TrendingUp className="size-3.5" />
                  Satıcılar için büyüme araçları
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <Bot className="size-3.5" />
                  Danışman · Piyasa kontrolü · Karar motoru
                </span>
              </div>
            </motion.div>

            {/* Right — dashboard card */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative mx-auto w-full max-w-sm sm:max-w-md md:max-w-none"
            >
              <div className="relative overflow-hidden rounded-[32px] bg-card shadow-2xl border border-border">
                <div className="p-5 sm:p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="size-10 overflow-hidden rounded-xl border border-border bg-muted">
                      <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=80" className="h-full w-full object-cover" alt="" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Bluetooth Kulaklık Pro X1</p>
                      <p className="text-xs text-muted-foreground">₺1.015 · Mehmet Elektronik</p>
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
                      Yorumlarda tekrar eden mikrofon şikâyetleri bulundu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating: agents — gizli mobilde */}
              <div className="absolute -top-5 -right-5 hidden sm:block rounded-[20px] bg-card px-4 py-3 shadow-xl border border-border">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-semibold text-foreground">Analiz çalışıyor</p>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Yorumlar değerlendirildi</p>
              </div>

              {/* Floating: seller — gizli mobilde */}
              <div className="absolute -bottom-4 -left-5 hidden sm:flex items-center gap-3 rounded-[20px] bg-card px-4 py-3 shadow-xl border border-border">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10">
                  <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">AI içerik oluşturuldu</p>
                  <p className="text-[11px] text-muted-foreground">Başlık & açıklama · Seller Studio</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="bg-gradient-to-r from-[#C1F25D] to-[#10B981] bg-clip-text text-4xl sm:text-5xl font-bold text-transparent">
                  {s.value}
                </p>
                <p className="mt-1.5 text-sm sm:text-base font-medium text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Whom — dual audience ──────────────────────────────────────── */}
      <section id="kim-icin" className="py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 sm:mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#C1F25D]">KİM İÇİN?</p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">E-ticarette Her İki Taraf İçin</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-muted-foreground">
              Alıcı ya da satıcı olun, Zekai size özel araçlarla doğru kararı vermenizi sağlar.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Buyer card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-[28px] border border-[#C1F25D]/20 bg-card p-6 sm:p-8 hover:border-[#C1F25D]/50 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[#C1F25D]/5" />
              <div className="relative">
                <div className="mb-5 flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-[#C1F25D]/15">
                  <ShieldCheck className="size-6 sm:size-7 text-[#5a8a00] dark:text-[#C1F25D]" />
                </div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#5a8a00] dark:text-[#C1F25D]">Alıcılar İçin</p>
                <h3 className="mb-2 text-xl sm:text-2xl font-bold text-foreground">Pişmanlıksız Alışveriş</h3>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  Satın almadan önce ürünün gerçek değerini, risklerini ve size uygunluğunu öğrenin.
                </p>
                <ul className="mb-8 space-y-2.5">
                  {BUYER_BENEFITS.map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="size-4 shrink-0 text-[#5a8a00] dark:text-[#C1F25D]" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href={COMMERCE_WEB_URL}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#C1F25D] px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#aadc2d]"
                >
                  Ürünü Analiz Et
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </motion.div>

            {/* Seller card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative overflow-hidden rounded-[28px] border border-blue-500/20 bg-card p-6 sm:p-8 hover:border-blue-500/50 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-blue-500/5" />
              <div className="relative">
                <div className="mb-5 flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-blue-500/10">
                  <TrendingUp className="size-6 sm:size-7 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400">Satıcılar İçin</p>
                <h3 className="mb-2 text-xl sm:text-2xl font-bold text-foreground">Seller Studio ile Büyü</h3>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  AI destekli araçlarla ürün sayfalarını optimize edin, müşteri gözüyle görün, içeriğinizi güçlendirin.
                </p>
                <ul className="mb-8 space-y-2.5">
                  {SELLER_BENEFITS.map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="size-4 shrink-0 text-blue-500 dark:text-blue-400" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/seller"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
                >
                  Seller Studio&apos;ya Gir
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="ozellikler" className="border-y border-border bg-card py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 sm:mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#C1F25D]">ÖZELLİKLER</p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">AI ile Bilinçli Ticaret</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-muted-foreground">
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
                  className="group rounded-3xl border border-transparent bg-background p-5 sm:p-7 shadow-none transition-all hover:-translate-y-2 hover:shadow-xl"
                  style={{ borderRadius: "24px" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = f.color + "4D"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex size-12 sm:size-14 items-center justify-center rounded-2xl" style={{ backgroundColor: f.color + "1A", color: f.color }}>
                      <Icon className="size-6 sm:size-7" />
                    </div>
                    <span className={`mt-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      f.audience === "Alıcı"
                        ? "bg-[#C1F25D]/15 text-[#5a8a00] dark:text-[#C1F25D]"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}>
                      {f.audience}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base sm:text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works — tabbed ─────────────────────────────────────────── */}
      <section id="nasil-calisir" className="py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#C1F25D]">NASIL ÇALIŞIR?</p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">3 Adımda Başlayın</h2>
          </div>

          {/* Tab switcher */}
          <div className="mb-10 sm:mb-12 flex justify-center">
            <div className="flex w-full max-w-xs sm:max-w-none sm:w-auto rounded-full border border-border bg-card p-1">
              <button
                onClick={() => setActiveFlow("buyer")}
                className={`cursor-pointer flex-1 sm:flex-none rounded-full px-5 sm:px-6 py-2.5 text-sm font-semibold transition-all ${
                  activeFlow === "buyer"
                    ? "bg-[#C1F25D] text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Alıcı Akışı
              </button>
              <button
                onClick={() => setActiveFlow("seller")}
                className={`cursor-pointer flex-1 sm:flex-none rounded-full px-5 sm:px-6 py-2.5 text-sm font-semibold transition-all ${
                  activeFlow === "seller"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Satıcı Akışı
              </button>
            </div>
          </div>

          <motion.div
            key={activeFlow}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid gap-10 sm:gap-8 md:grid-cols-3"
          >
            {(activeFlow === "buyer" ? BUYER_STEPS : SELLER_STEPS).map((item, idx) => {
              const Icon = item.icon;
              const accentColor = activeFlow === "buyer" ? "#C1F25D" : "#3B82F6";
              const iconTextClass = activeFlow === "buyer"
                ? "text-[#5a8a00] dark:text-[#ADFF41]"
                : "text-blue-600 dark:text-blue-400";
              return (
                <div key={item.step} className="relative text-center">
                  <p className="mb-2 text-7xl sm:text-8xl font-bold leading-none" style={{ color: accentColor + "33" }}>{item.step}</p>
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl" style={{ backgroundColor: accentColor + "1A" }}>
                    <Icon className={`size-5 ${iconTextClass}`} />
                  </div>
                  <h3 className="mb-2 text-lg sm:text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{item.desc}</p>
                  {idx < 2 && (
                    <ArrowRight className="absolute right-0 top-12 hidden size-5 text-muted-foreground/40 md:block" />
                  )}
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Scenarios ────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 sm:mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#C1F25D]">ÖRNEK SENARYOLAR</p>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Gerçekte Ne Oluyor?</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-muted-foreground">
              Zekai&apos;nin alıcı ve satıcı akışlarının gerçek çıktıları.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {SCENARIOS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="rounded-3xl border border-border bg-background p-5 sm:p-7" style={{ borderRadius: "24px" }}>
                  <span
                    className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                    style={{ backgroundColor: s.tagColor + "1A", color: s.tagColor === "#C1F25D" ? "#5a8a00" : s.tagColor }}
                  >
                    <Icon className="size-3.5" />
                    {s.tag}
                  </span>
                  <h3 className="mb-3 text-base font-bold text-foreground">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-20 md:pb-28 pt-16 sm:pt-20 md:pt-28">
        <div className="mx-auto max-w-4xl">
          <div
            className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] px-6 py-14 sm:px-12 sm:py-20 text-center text-white"
            style={{ background: "linear-gradient(135deg, #1a1e04 0%, #0d3018 100%)" }}
          >
            {/* Dekoratif arka plan daireleri */}
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[#C1F25D]/6" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-52 rounded-full bg-[#C1F25D]/4" />

            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C1F25D]/20 bg-[#C1F25D]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#C1F25D]">
                <Sparkles className="size-3" />
                Ücretsiz · Kredi kartı gerekmez
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                Alıcı da kazan,{" "}
                <span className="text-[#C1F25D]">satıcı da kazan.</span>
              </h2>

              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/55">
                Risk almadan karar ver, ürünlerini AI ile büyüt.
              </p>

              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/register"
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#C1F25D] px-8 py-3.5 text-sm font-bold text-black transition-colors hover:bg-[#aadc2d] sm:w-auto"
                >
                  Ücretsiz Başla
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/seller"
                  className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:border-white/40 hover:bg-white/8 sm:w-auto"
                >
                  <Store className="size-4" />
                  Seller Studio
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <p className="mt-6 text-xs text-white/30">
                Alıcılar için pişmanlık analizi · Satıcılar için büyüme araçları
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 sm:px-6 md:flex-row md:justify-between">
          <ZekaiLogo size="md" />
          <p className="text-center text-sm text-muted-foreground">© 2026 ZekAI · HackAthon'26 için geliştirilmiş bir proje</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href={COMMERCE_WEB_URL} className="transition-colors hover:text-foreground">Akıllı Market</a>
            <a href="https://github.com/mrfiratatalay/btk-zekai" className="transition-colors hover:text-foreground">GitHub</a>
            <a href="https://github.com/mrfiratatalay/btk-zekai/tree/main/docs" className="transition-colors hover:text-foreground">Dokümanlar</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
