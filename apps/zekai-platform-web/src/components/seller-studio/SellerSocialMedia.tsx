"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  Briefcase,
  Camera,
  Check,
  ChevronRight,
  Clapperboard,
  Copy,
  Heart,
  Info,
  Loader2,
  MessageCircle,
  Package,
  ShieldCheck,
  Smile,
  Sparkles,
  Tag,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatSellerPrice } from "@/lib/format";
import type { SellerProductPerformance } from "@/types/seller";
import {
  generateSocialContent,
  saveSocialDraft,
  type SocialInstagramContent,
  type SocialMediaContent,
  type SocialPlatform,
  type SocialPurpose,
  type SocialTiktokContent,
  type SocialTone,
  type SocialTwitterContent,
} from "@/lib/api/seller";

type Step = 1 | 2;

const TONES: { key: SocialTone; label: string; Icon: LucideIcon }[] = [
  { key: "samimi", label: "Samimi", Icon: Heart },
  { key: "profesyonel", label: "Profesyonel", Icon: Briefcase },
  { key: "mizahi", label: "Eğlenceli", Icon: Smile },
];

const PURPOSES: { key: SocialPurpose; label: string; Icon: LucideIcon }[] = [
  { key: "guven", label: "Güven oluştur", Icon: ShieldCheck },
  { key: "satis", label: "Satışı artır", Icon: TrendingUp },
  { key: "tanitim", label: "Ürün tanıtımı", Icon: Package },
];

const PLATFORMS: { key: SocialPlatform; label: string; Icon: LucideIcon }[] = [
  { key: "instagram", label: "Instagram", Icon: Camera },
  { key: "tiktok", label: "TikTok / Reels", Icon: Clapperboard },
  { key: "twitter", label: "X", Icon: MessageCircle },
];

function platformLabel(platform: SocialPlatform) {
  return PLATFORMS.find((item) => item.key === platform)?.label ?? platform;
}

function toneLabel(tone: string) {
  return TONES.find((item) => item.key === tone)?.label ?? tone;
}

function purposeLabel(purpose: string) {
  return PURPOSES.find((item) => item.key === purpose)?.label ?? purpose;
}

function formatTags(tags: string[] | null | undefined) {
  return (tags ?? []).join(" ");
}

function platformIsReady(content: SocialMediaContent | null, platform: SocialPlatform) {
  return Boolean(content?.[platform]);
}

function formatInstagram(content: SocialInstagramContent) {
  return [content.caption, formatTags(content.hashtags), content.cta, content.overlayText]
    .filter(Boolean)
    .join("\n\n");
}

function formatTiktok(content: SocialTiktokContent) {
  return [
    `Hook: ${content.hook}`,
    ...(content.scenes ?? []).map((scene) => `${scene.title}: ${scene.description}`),
    `Caption: ${content.caption}`,
    `Hashtagler: ${formatTags(content.hashtags)}`,
  ].join("\n");
}

function formatTwitter(content: SocialTwitterContent) {
  return [content.post, formatTags(content.hashtags), content.cta].filter(Boolean).join("\n\n");
}

function formatAll(content: SocialMediaContent) {
  const parts: string[] = [];
  if (content.instagram) parts.push(`Instagram\n${formatInstagram(content.instagram)}`);
  if (content.tiktok) parts.push(`TikTok / Reels\n${formatTiktok(content.tiktok)}`);
  if (content.twitter) parts.push(`X\n${formatTwitter(content.twitter)}`);
  return parts.join("\n\n---\n\n");
}

function CopyButton({ text, label = "Kopyala", className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Kopyalandı.");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
      {copied ? "Kopyalandı" : label}
    </button>
  );
}

function ProductSummary({ product, compact = false }: { product: SellerProductPerformance; compact?: boolean }) {
  return (
    <section className={cn("border-y border-slate-200 bg-white", compact ? "rounded-2xl border p-3" : "py-4")}>
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {product.image ? (
            <Image src={product.image} alt={product.title} fill className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Package className="size-7 text-slate-400" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-black text-slate-950">{product.title}</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">{product.category || "Kategori yok"}</p>
        </div>
        <div className="hidden min-w-24 items-center gap-3 sm:flex">
          <Tag className="size-5 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">Fiyat</p>
            <p className="font-black text-slate-950">{formatSellerPrice(product.price)}</p>
          </div>
        </div>
        <div className="hidden min-w-20 items-center gap-3 sm:flex">
          <Package className="size-5 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">Stok</p>
            <p className="font-black text-slate-950">{product.stock}</p>
          </div>
        </div>
        <span className="hidden rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700 sm:inline-flex">Aktif</span>
      </div>
    </section>
  );
}

function ChoiceButton({
  active,
  label,
  Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  Icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-14 min-w-40 items-center justify-between gap-3 rounded-2xl border px-5 text-sm font-black transition",
        active
          ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-[0_0_0_1px_rgba(16,185,129,0.16)]"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      <span className="flex items-center gap-3">
        <Icon className="size-5" />
        {label}
      </span>
      {active && <Check className="size-5 rounded-full bg-emerald-600 p-1 text-white" />}
    </button>
  );
}

function SettingsStep({
  tone,
  purpose,
  selectedPlatforms,
  note,
  generating,
  onToneChange,
  onPurposeChange,
  onTogglePlatform,
  onNoteChange,
  onNext,
}: {
  tone: SocialTone;
  purpose: SocialPurpose;
  selectedPlatforms: SocialPlatform[];
  note: string;
  generating: boolean;
  onToneChange: (tone: SocialTone) => void;
  onPurposeChange: (purpose: SocialPurpose) => void;
  onTogglePlatform: (platform: SocialPlatform) => void;
  onNoteChange: (note: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="grid min-h-[560px] gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-black text-slate-950">1. Ton</h3>
          <div className="mt-4 flex flex-wrap gap-4">
            {TONES.map(({ key, label, Icon }) => (
              <ChoiceButton key={key} active={tone === key} label={label} Icon={Icon} onClick={() => onToneChange(key)} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-black text-slate-950">2. Amaç</h3>
          <div className="mt-4 flex flex-wrap gap-4">
            {PURPOSES.map(({ key, label, Icon }) => (
              <ChoiceButton key={key} active={purpose === key} label={label} Icon={Icon} onClick={() => onPurposeChange(key)} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-black text-slate-950">3. Platform</h3>
          <div className="mt-4 flex flex-wrap gap-4">
            {PLATFORMS.map(({ key, label, Icon }) => (
              <ChoiceButton
                key={key}
                active={selectedPlatforms.includes(key)}
                label={label}
                Icon={Icon}
                onClick={() => onTogglePlatform(key)}
              />
            ))}
          </div>
        </section>

        <label className="block">
          <span className="text-sm font-bold text-slate-600">Ek not (isteğe bağlı)</span>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value.slice(0, 500))}
            placeholder="Kampanya, hedef kitle, vurgulanacak özellikler veya özel isteklerinizi yazabilirsiniz..."
            className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500"
          />
          <span className="mt-1 block text-right text-xs font-semibold text-slate-400">{note.length} / 500</span>
        </label>
      </div>

      <aside className="hidden border-l border-slate-200 pl-10 xl:flex xl:flex-col xl:items-center xl:justify-center">
        <div className="flex size-64 items-center justify-center rounded-full bg-emerald-50">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <Sparkles className="mb-4 ml-auto size-7 text-emerald-600" />
            <div className="h-20 w-36 rounded-xl bg-slate-100" />
            <div className="mt-4 h-2 w-32 rounded-full bg-slate-200" />
            <div className="mt-3 h-2 w-24 rounded-full bg-emerald-500" />
            <div className="mt-3 h-2 w-16 rounded-full bg-emerald-200" />
          </div>
        </div>
        <h3 className="mt-8 text-center text-xl font-black text-slate-950">Sonraki adımda ne olacak?</h3>
        <p className="mt-3 max-w-xs text-center text-sm leading-6 text-slate-500">
          AI seçtiğiniz ton, amaç ve platformlara göre içerik üretir. Sonraki ekranda önizleyip son dokunuşu yapabilirsiniz.
        </p>
        <div className="mt-10 flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
          <Info className="size-9 shrink-0 rounded-full bg-emerald-50 p-2 text-emerald-700" />
          <p className="text-sm leading-6 text-slate-500">
            Net bir ton ve amaç seçmek, daha isabetli caption ve hashtag üretir.
          </p>
        </div>
      </aside>

      <div className="xl:hidden">
        <button
          type="button"
          onClick={onNext}
          disabled={generating || selectedPlatforms.length === 0}
          className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-6 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
          İçerik Oluştur
        </button>
      </div>
    </div>
  );
}

function PlatformTabs({
  content,
  activePlatform,
  onActivePlatformChange,
}: {
  content: SocialMediaContent | null;
  activePlatform: SocialPlatform;
  onActivePlatformChange: (platform: SocialPlatform) => void;
}) {
  const readyPlatforms = PLATFORMS.filter(({ key }) => content?.platforms?.includes(key) && platformIsReady(content, key));

  if (readyPlatforms.length <= 1) return null;

  return (
    <div className="flex justify-center border-b border-slate-200">
      {readyPlatforms.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onActivePlatformChange(key)}
          className={cn(
            "flex h-12 min-w-40 items-center justify-center gap-2 border-b-2 px-4 text-sm font-black transition",
            activePlatform === key ? "border-emerald-500 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-900",
          )}
        >
          <Icon className="size-5" />
          {label}
        </button>
      ))}
    </div>
  );
}

function SocialPreview({
  product,
  content,
  activePlatform,
}: {
  product: SellerProductPerformance;
  content: SocialMediaContent;
  activePlatform: SocialPlatform;
}) {
  if (activePlatform === "instagram" && content.instagram) {
    return <InstagramPreview product={product} content={content.instagram} />;
  }
  if (activePlatform === "tiktok" && content.tiktok) {
    return <TiktokPreview product={product} content={content.tiktok} />;
  }
  if (activePlatform === "twitter" && content.twitter) {
    return <TwitterPreview content={content.twitter} />;
  }
  return null;
}

function InstagramPreview({ product, content }: { product: SellerProductPerformance; content: SocialInstagramContent }) {
  return (
    <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">ZK</div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-slate-950">zekai.store</p>
          <p className="text-xs font-semibold text-slate-400">Sponsorlu içerik</p>
        </div>
        <span className="text-xl font-black text-slate-400">...</span>
      </div>
      <div className="relative aspect-square bg-slate-100">
        {product.image ? (
          <Image src={product.image} alt={product.title} fill className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Package className="size-12 text-slate-400" />
          </div>
        )}
        {content.overlayText && (
          <div className="absolute left-8 top-8 max-w-[70%] rounded-2xl bg-white/78 px-5 py-4 backdrop-blur">
            <p className="text-3xl font-black leading-tight text-slate-900">{content.overlayText}</p>
          </div>
        )}
      </div>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <Heart className="size-6 fill-red-500 text-red-500" />
            <MessageCircle className="size-6 text-slate-950" />
            <Camera className="size-6 text-slate-950" />
          </div>
          <Bookmark className="size-6 text-slate-950" />
        </div>
        <p className="mt-4 text-sm font-black text-slate-950">1.284 beğenme</p>
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-800">
          <span className="font-black">zekai.store </span>
          {content.caption}
        </p>
        <p className="mt-2 text-sm leading-6 text-emerald-700">{formatTags(content.hashtags)}</p>
        <p className="mt-2 text-sm text-slate-400">20 yorumun tümünü gör</p>
      </div>
    </div>
  );
}

function TiktokPreview({ product, content }: { product: SellerProductPerformance; content: SocialTiktokContent }) {
  return (
    <div className="mx-auto grid w-full max-w-[860px] gap-6 lg:grid-cols-[330px_1fr]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-[28px] bg-slate-950 shadow-sm">
        {product.image ? <Image src={product.image} alt={product.title} fill className="object-cover opacity-80" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        <div className="absolute inset-x-5 bottom-6">
          <p className="text-2xl font-black leading-tight text-white">{content.hook}</p>
          <p className="mt-3 text-sm leading-6 text-white/80">{content.caption}</p>
        </div>
      </div>
      <div className="space-y-4">
        {(content.scenes ?? []).map((scene, index) => (
          <div key={`${scene.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase text-emerald-700">Sahne {index + 1}</p>
            <h4 className="mt-1 font-black text-slate-950">{scene.title}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-500">{scene.description}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-slate-200 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-800">
          {formatTags(content.hashtags)}
        </div>
      </div>
    </div>
  );
}

function TwitterPreview({ content }: { content: SocialTwitterContent }) {
  return (
    <div className="mx-auto w-full max-w-[620px] rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-lg font-black text-white">X</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-black text-slate-950">ZekAI Store</p>
            <BadgeCheck className="size-4 fill-emerald-600 text-white" />
            <p className="text-sm text-slate-500">@zekaistore</p>
          </div>
          <p className="mt-4 whitespace-pre-line text-xl leading-8 text-slate-950">{content.post}</p>
          <p className="mt-4 text-sm font-bold leading-6 text-emerald-700">{formatTags(content.hashtags)}</p>
          {content.cta && <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-800">{content.cta}</p>}
        </div>
      </div>
    </div>
  );
}

function FocusedPreviewStep({
  product,
  content,
  activePlatform,
  onActivePlatformChange,
}: {
  product: SellerProductPerformance;
  content: SocialMediaContent;
  activePlatform: SocialPlatform;
  onActivePlatformChange: (platform: SocialPlatform) => void;
}) {
  return (
    <div className="min-h-[560px]">
      <main className="mx-auto max-w-[940px]">
        <PlatformTabs content={content} activePlatform={activePlatform} onActivePlatformChange={onActivePlatformChange} />
        <div className="pt-6">
          <SocialPreview product={product} content={content} activePlatform={activePlatform} />
        </div>
      </main>
    </div>
  );
}

export function SellerSocialMedia({ product }: { product: SellerProductPerformance }) {
  const [step, setStep] = useState<Step>(1);
  const [tone, setTone] = useState<SocialTone>("samimi");
  const [purpose, setPurpose] = useState<SocialPurpose>("guven");
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(["instagram"]);
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>("instagram");
  const [note, setNote] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SocialMediaContent | null>(null);

  const readyPlatforms = useMemo(
    () => selectedPlatforms.filter((key) => platformIsReady(content, key)),
    [content, selectedPlatforms],
  );

  function togglePlatform(platform: SocialPlatform) {
    setSelectedPlatforms((current) => {
      if (current.includes(platform)) return current.filter((item) => item !== platform);
      return [...current, platform];
    });
  }

  async function handleGenerate(targetStep: Step = 2) {
    if (selectedPlatforms.length === 0) {
      toast.error("En az bir platform seçin.");
      return;
    }
    setGenerating(true);
    try {
      const result = await generateSocialContent(product.id, { tone, purpose, platforms: selectedPlatforms, note: note.trim() || undefined });
      setContent(result);
      setActivePlatform(selectedPlatforms[0] ?? "instagram");
      setStep(targetStep);
      toast.success(result._cached ? "Sosyal medya içeriği hazır." : "Sosyal medya içeriği üretildi.");
    } catch {
      toast.error("İçerik üretilemedi, lütfen tekrar deneyin.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!content) return;
    setSaving(true);
    try {
      const platforms = readyPlatforms.length > 0 ? readyPlatforms : selectedPlatforms;
      await saveSocialDraft(product.id, {
        label: `Onaylı sosyal içerik · ${new Date().toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`,
        tone,
        purpose,
        platforms,
        content: { ...content, tone, purpose, platforms },
        activate: true,
      });
      toast.success("İçerik kaydedildi.");
    } catch {
      toast.error("İçerik kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  const selectedSummary = [
    toneLabel(tone),
    purposeLabel(purpose),
    selectedPlatforms.map(platformLabel).join(", "),
  ].filter(Boolean);

  return (
    <div className="-m-4 min-h-[calc(100vh-56px)] bg-white text-slate-950 sm:-m-6 lg:-m-8">
      <div className="mx-auto max-w-[1600px] px-6 pb-28 pt-8 sm:px-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
              <Link href="/seller/products" className="hover:text-slate-950">Ürünlerim</Link>
              <ChevronRight className="size-4" />
              <Link href={`/seller/product/${product.id}`} className="max-w-[280px] truncate hover:text-slate-950">{product.title}</Link>
              <ChevronRight className="size-4" />
              <span className="text-slate-800">Sosyal Medya İçeriği</span>
            </div>
            <div className="mt-8">
              <h1 className="text-4xl font-black text-slate-950">Sosyal Medya İçeriği</h1>
              <p className="mt-2 text-base font-medium text-slate-500">
                Seller için hızlı, sade ve kayıtlı yönetilebilir içerik akışı.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 max-w-[1120px]">
          <ProductSummary product={product} />
        </div>

        {content?._mock && (
          <div className="mt-5 max-w-[1120px] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
            Demo mod aktif. Bu içerik gerçek AI çıktısı olmayabilir.
          </div>
        )}

        <div className="mt-8">
          {step === 1 && (
            <SettingsStep
              tone={tone}
              purpose={purpose}
              selectedPlatforms={selectedPlatforms}
              note={note}
              generating={generating}
              onToneChange={setTone}
              onPurposeChange={setPurpose}
              onTogglePlatform={togglePlatform}
              onNoteChange={setNote}
              onNext={() => handleGenerate(2)}
            />
          )}

          {step === 2 && content && (
            <FocusedPreviewStep
              product={product}
              content={content}
              activePlatform={activePlatform}
              onActivePlatformChange={setActivePlatform}
            />
          )}
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/92 px-6 py-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 text-sm text-slate-600">
            <Check className="size-5 shrink-0 rounded-full border border-emerald-500 p-0.5 text-emerald-600" />
            <span className="font-black">Seçimleriniz:</span>
            <span className="truncate">{selectedSummary.join(" · ")}</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep((current) => (current > 1 ? ((current - 1) as Step) : current))}
              disabled={step === 1 || generating || saving}
              className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-8 text-sm font-black text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Geri
            </button>

            {step === 1 && (
              <button
                type="button"
                onClick={() => handleGenerate(2)}
                disabled={generating || selectedPlatforms.length === 0}
                className="inline-flex h-12 min-w-48 items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? <Loader2 className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
                İleri
              </button>
            )}
            {step === 2 && content && (
              <>
                <CopyButton text={formatAll(content)} label="Kopyala" />
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex h-12 min-w-40 items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="size-5 animate-spin" /> : <Check className="size-5" />}
                  Kaydet
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
