"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Briefcase,
  Camera,
  Check,
  ChevronRight,
  Clapperboard,
  Copy,
  Edit3,
  FileText,
  Heart,
  Loader2,
  MessageCircle,
  Package,
  RefreshCw,
  ShieldCheck,
  Smile,
  Sparkles,
  Trash2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SellerProductPerformance } from "@/types/seller";
import { formatSellerPrice } from "@/lib/format";
import {
  generateSocialContent,
  type SocialInstagramContent,
  type SocialMediaContent,
  type SocialPlatform,
  type SocialPurpose,
  type SocialTiktokContent,
  type SocialTone,
  type SocialTwitterContent,
} from "@/lib/api/seller";

// ─── Draft types & helpers ────────────────────────────────────────────────────

interface SocialDraft {
  id: string;
  productId: string;
  content: SocialMediaContent;
  savedAt: string;
}

function loadDraftsFromStorage(productId: string): SocialDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("zekai_social_drafts");
    const all: SocialDraft[] = raw ? JSON.parse(raw) : [];
    return all
      .filter((d) => d.productId === productId)
      .map((draft) => ({ ...draft, content: stripMockFlag(draft.content) }))
      .slice(0, 10);
  } catch {
    return [];
  }
}

function persistDrafts(productDrafts: SocialDraft[], productId: string) {
  try {
    const raw = localStorage.getItem("zekai_social_drafts");
    const all: SocialDraft[] = raw ? JSON.parse(raw) : [];
    const other = all.filter((d) => d.productId !== productId);
    localStorage.setItem(
      "zekai_social_drafts",
      JSON.stringify([...productDrafts, ...other]),
    );
  } catch {
    // ignore
  }
}

function stripMockFlag(content: SocialMediaContent): SocialMediaContent {
  const { _mock, ...cleanContent } = content;
  void _mock;
  return cleanContent;
}

function socialCacheKey(
  productId: string,
  tone: SocialTone,
  purpose: SocialPurpose,
  platforms: SocialPlatform[],
) {
  const normalizedPlatforms = [...platforms].sort().join(",");
  return `zekai_social_content:${productId}:${tone}:${purpose}:${normalizedPlatforms}`;
}

function loadCachedContent(
  productId: string,
  tone: SocialTone,
  purpose: SocialPurpose,
  platforms: SocialPlatform[],
): SocialMediaContent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(socialCacheKey(productId, tone, purpose, platforms));
    if (!raw) return null;
    return stripMockFlag(JSON.parse(raw) as SocialMediaContent);
  } catch {
    return null;
  }
}

function saveCachedContent(
  productId: string,
  tone: SocialTone,
  purpose: SocialPurpose,
  platforms: SocialPlatform[],
  content: SocialMediaContent,
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      socialCacheKey(productId, tone, purpose, platforms),
      JSON.stringify(stripMockFlag(content)),
    );
  } catch {
    // ignore
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TONES: { key: SocialTone; label: string; Icon: LucideIcon }[] = [
  { key: "profesyonel", label: "Profesyonel", Icon: Briefcase },
  { key: "samimi", label: "Samimi", Icon: Heart },
  { key: "mizahi", label: "Mizahi", Icon: Smile },
];

const PURPOSES: { key: SocialPurpose; label: string; Icon: LucideIcon }[] = [
  { key: "satis", label: "Satışı artır", Icon: TrendingUp },
  { key: "guven", label: "Güven oluştur", Icon: ShieldCheck },
  { key: "tanitim", label: "Ürün tanıtımı", Icon: Package },
];

const PLATFORMS: {
  key: SocialPlatform;
  label: string;
  shortLabel: string;
  Icon: LucideIcon;
}[] = [
  { key: "instagram", label: "Instagram", shortLabel: "Instagram", Icon: Camera },
  { key: "tiktok", label: "TikTok / Reels", shortLabel: "TikTok / Reels", Icon: Clapperboard },
  { key: "twitter", label: "X", shortLabel: "X", Icon: MessageCircle },
];

function platformLabel(platform: SocialPlatform) {
  return PLATFORMS.find((item) => item.key === platform)?.label ?? platform;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function splitTags(tags: string) {
  return tags
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatTags(tags: string[] | null | undefined) {
  return (tags ?? []).join(" ");
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
  return [content.post, formatTags(content.hashtags), content.cta].filter(Boolean).join("\n");
}

function formatAll(content: SocialMediaContent) {
  const parts: string[] = [];
  if (content.instagram) parts.push(`Instagram\n${formatInstagram(content.instagram)}`);
  if (content.tiktok) parts.push(`TikTok / Reels\n${formatTiktok(content.tiktok)}`);
  if (content.twitter) parts.push(`X\n${formatTwitter(content.twitter)}`);
  return parts.join("\n\n---\n\n");
}

function platformIsReady(content: SocialMediaContent | null, platform: SocialPlatform) {
  return Boolean(content?.[platform]);
}

// ─── Small reusable components ────────────────────────────────────────────────

function CopyButton({ text, label = "Kopyala", className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Kopyalandı.");
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {copied ? <Check className="size-4 text-green-600" /> : <Copy className="size-4" />}
      {copied ? "Kopyalandı" : label}
    </button>
  );
}

function OptionButton({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  Icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-all",
        active
          ? "border-green-500 bg-green-500/10 text-green-700 shadow-[0_0_0_1px_rgba(34,197,94,0.18)] dark:text-green-400"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function LabeledInput({ label, value, onChange }: { label: string; value: string | null | undefined; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-lg border border-border bg-card px-3 text-sm outline-none transition-colors focus:border-green-500"
      />
    </label>
  );
}

function LabeledTextarea({ label, value, onChange }: { label: string; value: string | null | undefined; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-20 resize-none rounded-lg border border-border bg-card px-3 py-3 text-sm leading-6 outline-none transition-colors focus:border-green-500"
      />
    </label>
  );
}

function ContentRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid gap-3 border-b border-border px-4 py-3 last:border-b-0 md:grid-cols-[220px_1fr]">
      <div className="flex items-center gap-3 text-sm font-bold text-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}

// ─── ProductSummary ───────────────────────────────────────────────────────────

function ProductSummary({ product }: { product: SellerProductPerformance }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border/80 px-6 py-5 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted">
          {product.image ? (
            <Image src={product.image} alt={product.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="size-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-foreground">{product.title}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{product.category}</span>
            <span className="font-semibold text-foreground">{formatSellerPrice(product.price)}</span>
            <span>Stok: <span className="font-semibold text-green-600">{product.stock}</span></span>
          </div>
        </div>
      </div>
      <div className="w-fit rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-700 dark:text-green-400">
        Tek istekle seçili platformlar için üretim
      </div>
    </div>
  );
}

// ─── SettingsPanel ────────────────────────────────────────────────────────────

function SettingsPanel({
  tone,
  purpose,
  selectedPlatforms,
  generating,
  onToneChange,
  onPurposeChange,
  onTogglePlatform,
  onGenerate,
}: {
  tone: SocialTone;
  purpose: SocialPurpose;
  selectedPlatforms: SocialPlatform[];
  generating: boolean;
  onToneChange: (tone: SocialTone) => void;
  onPurposeChange: (purpose: SocialPurpose) => void;
  onTogglePlatform: (platform: SocialPlatform) => void;
  onGenerate: () => void;
}) {
  return (
    <div className="px-6 py-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-foreground">İçerik Üretimi</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ton, amaç ve platformları seç; içerik paketi tek üretim isteğiyle hazırlansın.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1fr_1.35fr]">
        <section className="rounded-2xl border border-border/80 bg-background/60 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ton</p>
          <div className="flex flex-wrap gap-2">
            {TONES.map(({ key, label, Icon }) => (
              <OptionButton key={key} active={tone === key} onClick={() => onToneChange(key)} Icon={Icon} label={label} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border/80 bg-background/60 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amaç</p>
          <div className="flex flex-wrap gap-2">
            {PURPOSES.map(({ key, label, Icon }) => (
              <OptionButton key={key} active={purpose === key} onClick={() => onPurposeChange(key)} Icon={Icon} label={label} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border/80 bg-background/60 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Platformlar</p>
          <div className="flex flex-wrap gap-4">
            {PLATFORMS.map(({ key, label, Icon }) => {
              const checked = selectedPlatforms.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onTogglePlatform(key)}
                  className="inline-flex items-center gap-2.5 text-sm font-bold text-foreground"
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-md border transition-colors",
                      checked ? "border-green-500 bg-green-500 text-white" : "border-border bg-background text-transparent",
                    )}
                  >
                    <Check className="size-3.5" />
                  </span>
                  <Icon className={cn("size-5", checked ? "text-foreground" : "text-muted-foreground")} />
                  {label}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating || selectedPlatforms.length === 0}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:min-w-[260px]"
        >
          {generating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Üretiliyor...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              {selectedPlatforms.length === 0
                ? "Platform Seç"
                : `${selectedPlatforms.length} Platform İçin Üret`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── EmptyContentState ────────────────────────────────────────────────────────

function EmptyContentState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 py-20 text-center">
      <Sparkles className="size-10 text-muted-foreground" />
      <h3 className="mt-4 text-base font-bold text-foreground">İçerik henüz üretilmedi</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Sol panelden ton, amaç ve platformları seçip "Üret" butonuna bas.
      </p>
    </div>
  );
}

// ─── EditableFields ───────────────────────────────────────────────────────────

function EditableFields({
  fields,
}: {
  fields: {
    label: string;
    value: string | null | undefined;
    max: number;
    multiline?: boolean;
    onChange: (value: string) => void;
  }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="grid gap-4">
        {fields.map((field) => {
          const safeValue = field.value ?? "";
          return (
            <div key={field.label} className="grid gap-2 md:grid-cols-[130px_1fr]">
              <label className="pt-3 text-sm font-semibold text-foreground">{field.label}</label>
              <div>
                {field.multiline ? (
                  <textarea
                    value={safeValue}
                    onChange={(event) => field.onChange(event.target.value)}
                    className="min-h-36 w-full resize-none rounded-lg border border-border bg-card px-3 py-3 text-sm leading-6 outline-none transition-colors focus:border-green-500"
                  />
                ) : (
                  <input
                    value={safeValue}
                    onChange={(event) => field.onChange(event.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition-colors focus:border-green-500"
                  />
                )}
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {safeValue.length} / {field.max}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhoneFrame({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[340px] rounded-[2.25rem] border border-border bg-zinc-950 p-3 shadow-sm">
      <div
        className={cn(
          "relative aspect-[9/19.5] overflow-hidden rounded-[1.65rem]",
          dark ? "bg-neutral-950 text-white" : "bg-white text-slate-950",
        )}
      >
        <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
        <div className="relative z-10 flex h-full flex-col">{children}</div>
      </div>
    </div>
  );
}

// ─── InstagramPreview ─────────────────────────────────────────────────────────

function InstagramPreview({
  product,
  content,
  onChange,
}: {
  product: SellerProductPerformance;
  content: SocialInstagramContent;
  onChange: (content: SocialInstagramContent) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <PhoneFrame>
        <div className="flex h-10 items-center justify-between border-b border-slate-200 px-4 pt-2 text-[11px] font-bold">
          <span>9:41</span>
          <span>Instagram</span>
          <Camera className="size-4" />
        </div>
        <div className="flex-1 overflow-hidden bg-white">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-green-600 text-[11px] font-black text-white">ME</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">Mehmet Elektronik</p>
            </div>
            <span className="text-xl leading-none text-slate-500">...</span>
          </div>
          <div className="relative aspect-square bg-slate-100">
            {product.image ? (
              <Image src={product.image} alt={product.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="size-10 text-slate-400" />
              </div>
            )}
            {content.overlayText && (
              <div className="absolute inset-x-4 bottom-4 rounded-lg bg-black/60 px-3 py-2 text-center text-sm font-bold text-white">
                {content.overlayText}
              </div>
            )}
          </div>
          <div className="px-4 pb-4 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <Heart className="size-6" />
                <MessageCircle className="size-6" />
                <Camera className="size-6" />
              </div>
              <Bookmark className="size-6" />
            </div>
            <p className="mt-3 line-clamp-5 whitespace-pre-line text-xs leading-5">{content.caption}</p>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-green-700">{formatTags(content.hashtags)}</p>
          </div>
        </div>
      </PhoneFrame>

      <EditableFields
        fields={[
          {
            label: "Caption",
            value: content.caption,
            max: 2200,
            multiline: true,
            onChange: (value) => onChange({ ...content, caption: value }),
          },
          {
            label: "Hashtagler",
            value: formatTags(content.hashtags),
            max: 500,
            onChange: (value) => onChange({ ...content, hashtags: splitTags(value) }),
          },
          {
            label: "CTA",
            value: content.cta,
            max: 150,
            onChange: (value) => onChange({ ...content, cta: value }),
          },
          {
            label: "Görsel Üstü Yazı",
            value: content.overlayText,
            max: 80,
            onChange: (value) => onChange({ ...content, overlayText: value }),
          },
        ]}
      />
    </div>
  );
}

// ─── TiktokPreview ────────────────────────────────────────────────────────────

function TiktokPreview({
  product,
  content,
  onChange,
}: {
  product: SellerProductPerformance;
  content: SocialTiktokContent;
  onChange: (content: SocialTiktokContent) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <PhoneFrame dark>
        <div className="relative h-full overflow-hidden bg-neutral-900">
          {product.image ? (
            <Image src={product.image} alt={product.title} fill className="object-cover opacity-70" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/70" />
          <div className="absolute left-5 top-6 text-sm font-bold text-white">9:41</div>
          <div className="absolute left-6 right-14 top-24 text-2xl font-black leading-tight text-white">{content.hook}</div>
          <div className="absolute bottom-7 left-6 right-16">
            <p className="text-sm font-bold text-white">zekai.urunleri</p>
            <p className="mt-2 line-clamp-2 text-sm text-white">{content.caption}</p>
          </div>
          <div className="absolute bottom-20 right-4 grid gap-5 text-center text-xs font-bold text-white">
            <Heart className="size-7 fill-white" />
            <MessageCircle className="size-7" />
            <Bookmark className="size-7" />
          </div>
        </div>
      </PhoneFrame>

      <div className="rounded-2xl border border-border bg-background p-5">
        <h3 className="text-base font-bold text-foreground">Reels Video Fikri</h3>
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <ContentRow icon={<Sparkles className="size-4 text-green-600" />} label="Hook" value={content.hook} />
          {(content.scenes ?? []).map((scene, index) => (
            <ContentRow
              key={`${scene.title}-${index}`}
              icon={<Clapperboard className="size-4 text-green-600" />}
              label={scene.title}
              value={scene.description}
            />
          ))}
          <ContentRow icon={<Edit3 className="size-4 text-green-600" />} label="Caption" value={content.caption} />
          <ContentRow icon={<MessageCircle className="size-4 text-green-600" />} label="Hashtagler" value={formatTags(content.hashtags)} />
        </div>
        <div className="mt-5 grid gap-4">
          <LabeledTextarea label="Hook" value={content.hook} onChange={(value) => onChange({ ...content, hook: value })} />
          {(content.scenes ?? []).map((scene, index) => (
            <LabeledTextarea
              key={index}
              label={scene.title || `Sahne ${index + 1}`}
              value={scene.description}
              onChange={(value) => {
                const scenes = [...(content.scenes ?? [])];
                scenes[index] = { ...scene, description: value };
                onChange({ ...content, scenes });
              }}
            />
          ))}
          <LabeledTextarea label="Caption" value={content.caption} onChange={(value) => onChange({ ...content, caption: value })} />
          <LabeledInput
            label="Hashtagler"
            value={formatTags(content.hashtags)}
            onChange={(value) => onChange({ ...content, hashtags: splitTags(value) })}
          />
        </div>
      </div>
    </div>
  );
}

// ─── TwitterPreview ───────────────────────────────────────────────────────────

function TwitterPreview({
  content,
  onChange,
}: {
  content: SocialTwitterContent;
  onChange: (content: SocialTwitterContent) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <PhoneFrame>
        <div className="flex h-10 items-center justify-between border-b border-slate-200 px-4 pt-2 text-[11px] font-bold">
          <span>9:41</span>
          <span>X</span>
          <MessageCircle className="size-4" />
        </div>
        <div className="flex-1 overflow-hidden bg-white px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-black text-lg font-black text-white">X</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2">
                <p className="font-bold">Mehmet Elektronik</p>
                <p className="text-sm text-slate-500">@mehmetelektronik</p>
              </div>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-7">{content.post}</p>
              <p className="mt-3 text-sm leading-6 text-green-700">{formatTags(content.hashtags)}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                <span>128 yanıt</span>
                <span>2.4B görüntülenme</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-slate-500">
                <MessageCircle className="size-5" />
                <RefreshCw className="size-5" />
                <Heart className="size-5" />
                <Bookmark className="size-5" />
              </div>
            </div>
          </div>
        </div>
      </PhoneFrame>

      <div className="rounded-2xl border border-border bg-background p-5">
        <h3 className="text-base font-bold text-foreground">X Post İçeriği</h3>
        <div className="mt-6 grid gap-4">
          <LabeledTextarea label="Post" value={content.post} onChange={(value) => onChange({ ...content, post: value })} />
          <LabeledInput
            label="Hashtagler"
            value={formatTags(content.hashtags)}
            onChange={(value) => onChange({ ...content, hashtags: splitTags(value) })}
          />
          <LabeledInput label="CTA" value={content.cta} onChange={(value) => onChange({ ...content, cta: value })} />
        </div>
      </div>
    </div>
  );
}

// ─── GeneratedPanel ───────────────────────────────────────────────────────────

function GeneratedPanel({
  product,
  content,
  activePlatform,
  regeneratingPlatform,
  onActivePlatformChange,
  onUpdateContent,
  onRegeneratePlatform,
  onSaveDraft,
}: {
  product: SellerProductPerformance;
  content: SocialMediaContent;
  activePlatform: SocialPlatform;
  regeneratingPlatform: SocialPlatform | null;
  onActivePlatformChange: (platform: SocialPlatform) => void;
  onUpdateContent: (content: SocialMediaContent) => void;
  onRegeneratePlatform: (platform: SocialPlatform) => void;
  onSaveDraft: () => void;
}) {
  const readyPlatforms = PLATFORMS.filter(({ key }) => platformIsReady(content, key));
  const activeText = useMemo(() => {
    if (activePlatform === "instagram" && content.instagram) return formatInstagram(content.instagram);
    if (activePlatform === "tiktok" && content.tiktok) return formatTiktok(content.tiktok);
    if (activePlatform === "twitter" && content.twitter) return formatTwitter(content.twitter);
    return "";
  }, [activePlatform, content]);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border/70 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-foreground">Üretilen İçerikler</h2>
          <div className="mt-4 flex flex-wrap gap-1 border-b border-border">
            {readyPlatforms.map(({ key, label, Icon }) => (
              <button
                type="button"
                key={key}
                onClick={() => onActivePlatformChange(key)}
                className={cn(
                  "inline-flex h-10 items-center gap-2 border-b-2 px-4 text-sm font-bold transition-colors",
                  activePlatform === key
                    ? "border-green-500 text-green-700 dark:text-green-400"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <CopyButton text={formatAll(content)} label="Tümünü Kopyala" />
          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-green-500 bg-background px-4 text-sm font-semibold text-green-700 transition-colors hover:bg-green-500/10 dark:text-green-400"
          >
            <Bookmark className="size-4" />
            Taslak Olarak Kaydet
          </button>
        </div>
      </div>

      <div className="p-6">
        {activePlatform === "instagram" && content.instagram && (
          <InstagramPreview
            product={product}
            content={content.instagram}
            onChange={(instagram) => onUpdateContent({ ...content, instagram })}
          />
        )}
        {activePlatform === "tiktok" && content.tiktok && (
          <TiktokPreview product={product} content={content.tiktok} onChange={(tiktok) => onUpdateContent({ ...content, tiktok })} />
        )}
        {activePlatform === "twitter" && content.twitter && (
          <TwitterPreview
            content={content.twitter}
            onChange={(twitter) => onUpdateContent({ ...content, twitter })}
          />
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_260px]">
          <CopyButton text={activeText} />
          <button
            type="button"
            onClick={() => toast.info("Alanları doğrudan düzenleyebilirsin.")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Edit3 className="size-4" />
            Düzenle
          </button>
          <button
            type="button"
            onClick={() => onRegeneratePlatform(activePlatform)}
            disabled={regeneratingPlatform === activePlatform}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-bold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {regeneratingPlatform === activePlatform ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            {platformLabel(activePlatform)}&apos;ı Yeniden Üret
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DraftsMenu ───────────────────────────────────────────────────────────────

function DraftsMenu({
  drafts,
  open,
  onOpenChange,
}: {
  drafts: SocialDraft[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenChange(!open)}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-muted",
        open && "border-green-300 bg-green-500/10 text-green-700 dark:text-green-400",
      )}
    >
      <FileText className="size-4" />
      Taslaklar
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1.5 text-[11px] font-black text-white">
        {drafts.length}
      </span>
    </button>
  );
}

function DraftsView({
  drafts,
  onLoadDraft,
  onDeleteDraft,
}: {
  drafts: SocialDraft[];
  onLoadDraft: (draft: SocialDraft) => void;
  onDeleteDraft: (id: string) => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 border-b border-border pb-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/10 text-green-700 dark:text-green-400">
          <FileText className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground">Kaydedilen Taslaklar</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Kaydettiğin içerik paketlerini buradan yükle.</p>
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="py-16 text-center">
          <FileText className="mx-auto size-9 text-muted-foreground/60" />
          <p className="mt-4 text-sm font-semibold text-foreground">Henüz taslak yok</p>
          <p className="mt-1 text-sm text-muted-foreground">İçeriği kaydedince burada görünecek.</p>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-border">
          {drafts.map((draft) => {
            const platformNames = (draft.content.platforms ?? [])
              .map((p) => platformLabel(p as SocialPlatform))
              .join(", ");
            const date = new Date(draft.savedAt).toLocaleString("tr-TR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div key={draft.id} className="flex items-center justify-between gap-4 py-4">
                <button
                  type="button"
                  onClick={() => onLoadDraft(draft)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-base font-bold text-foreground">{platformNames || "Taslak"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{date}</p>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteDraft(draft.id)}
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  aria-label="Taslağı sil"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function SellerSocialMedia({ product }: { product: SellerProductPerformance }) {
  const [tone, setTone] = useState<SocialTone>("samimi");
  const [purpose, setPurpose] = useState<SocialPurpose>("guven");
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>("instagram");
  const [generating, setGenerating] = useState(false);
  const [regeneratingPlatform, setRegeneratingPlatform] = useState<SocialPlatform | null>(null);
  const [content, setContent] = useState<SocialMediaContent | null>(null);
  const [contentSource, setContentSource] = useState<"generated" | "draft" | null>(null);
  const [drafts, setDrafts] = useState<SocialDraft[]>(() => loadDraftsFromStorage(product.id));
  const [draftsOpen, setDraftsOpen] = useState(false);

  useEffect(() => {
    function handlePopState() {
      setDraftsOpen(false);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleDraftsOpenChange(open: boolean) {
    if (open && !draftsOpen) {
      window.history.pushState({ ...(window.history.state ?? {}), zekaiSocialDraftsOpen: true }, "", window.location.href);
      setDraftsOpen(true);
      return;
    }
    if (!open && draftsOpen && window.history.state?.zekaiSocialDraftsOpen) {
      setDraftsOpen(false);
      window.history.back();
      return;
    }
    setDraftsOpen(open);
  }

  function togglePlatform(platform: SocialPlatform) {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  }

  async function handleGenerate() {
    const cached = loadCachedContent(product.id, tone, purpose, selectedPlatforms);
    if (cached) {
      setContent(cached);
      setContentSource("generated");
      setDraftsOpen(false);
      setActivePlatform(selectedPlatforms[0] ?? "instagram");
      toast.success("Kaydedilen içerik kullanıldı. Gemini'ye yeni istek atılmadı.");
      return;
    }

    setGenerating(true);
    try {
      const result = await generateSocialContent(product.id, { tone, purpose, platforms: selectedPlatforms });
      const cleanResult = stripMockFlag(result);
      saveCachedContent(product.id, tone, purpose, selectedPlatforms, cleanResult);
      setContent(cleanResult);
      setContentSource("generated");
      setDraftsOpen(false);
      setActivePlatform(selectedPlatforms[0] ?? "instagram");
      toast.success(`${selectedPlatforms.length} platform için içerik üretildi.`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "";
      toast.error("Gemini API key/limit sorunu nedeniyle içerik üretilemedi.", {
        description: detail || "Mock içerik gösterilmedi. Daha önce kaydettiğin taslakları kullanabilirsin.",
      });
    } finally {
      setGenerating(false);
    }
  }

  async function handleRegeneratePlatform(platform: SocialPlatform) {
    const cached = loadCachedContent(product.id, tone, purpose, [platform]);
    if (cached?.[platform]) {
      setContent((current) => {
        if (!current) return cached;
        return {
          ...current,
          [platform]: cached[platform],
          generatedAt: cached.generatedAt,
          platforms: Array.from(new Set([...current.platforms, platform])) as SocialPlatform[],
        };
      });
      toast.success(`${platformLabel(platform)} için kaydedilen içerik kullanıldı.`);
      return;
    }

    setRegeneratingPlatform(platform);
    try {
      const result = await generateSocialContent(product.id, { tone, purpose, platforms: [platform] });
      const cleanResult = stripMockFlag(result);
      saveCachedContent(product.id, tone, purpose, [platform], cleanResult);
      setContent((current) => {
        if (!current) return cleanResult;
        return {
          ...current,
          [platform]: cleanResult[platform],
          generatedAt: cleanResult.generatedAt,
          platforms: Array.from(new Set([...current.platforms, platform])) as SocialPlatform[],
        };
      });
      toast.success(`${platformLabel(platform)} yeniden üretildi.`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "";
      toast.error("Gemini API key/limit sorunu nedeniyle yeniden üretilemedi.", {
        description: detail || "Mock içerik gösterilmedi.",
      });
    } finally {
      setRegeneratingPlatform(null);
    }
  }

  function handleSaveDraft() {
    if (!content) return;
    const newDraft: SocialDraft = {
      id: Date.now().toString(),
      productId: product.id,
      content: stripMockFlag(content),
      savedAt: new Date().toISOString(),
    };
    setDrafts((current) => {
      const updated = [newDraft, ...current].slice(0, 10);
      persistDrafts(updated, product.id);
      return updated;
    });
    toast.success("Taslak kaydedildi.");
  }

  function handleLoadDraft(draft: SocialDraft) {
    setContent(stripMockFlag(draft.content));
    setContentSource("draft");
    setActivePlatform(draft.content.platforms[0] ?? "instagram");
    setDraftsOpen(false);
    if (window.history.state?.zekaiSocialDraftsOpen) {
      window.history.back();
    }
    toast.success("Taslak yüklendi.");
  }

  function handleDeleteDraft(draftId: string) {
    setDrafts((current) => {
      const updated = current.filter((d) => d.id !== draftId);
      persistDrafts(updated, product.id);
      return updated;
    });
  }

  return (
    <div className="pb-16">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/seller/products" className="transition-colors hover:text-foreground">
              Ürünlerim
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href={`/seller/product/${product.id}`} className="max-w-[220px] truncate transition-colors hover:text-foreground">
              {product.title}
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="font-semibold text-foreground">Sosyal Medya İçeriği</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Seçili platformlar için tek istekle pazarlama içeriği oluştur.
          </p>
        </div>
        <DraftsMenu
          drafts={drafts}
          open={draftsOpen}
          onOpenChange={handleDraftsOpenChange}
        />
      </div>

      {draftsOpen ? (
        <DraftsView
          drafts={drafts}
          onLoadDraft={handleLoadDraft}
          onDeleteDraft={handleDeleteDraft}
        />
      ) : !content ? (
        <div className="w-full">
          <div className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-card shadow-sm">
            <ProductSummary product={product} />
            <SettingsPanel
              tone={tone}
              purpose={purpose}
              selectedPlatforms={selectedPlatforms}
              generating={generating}
              onToneChange={setTone}
              onPurposeChange={setPurpose}
              onTogglePlatform={togglePlatform}
              onGenerate={handleGenerate}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {contentSource === "draft" && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
              Taslak içerik yüklendi. Düzenleyebilir, kopyalayabilir veya platform bazlı yeniden üretebilirsin.
            </div>
          )}
          <GeneratedPanel
            product={product}
            content={content}
            activePlatform={activePlatform}
            regeneratingPlatform={regeneratingPlatform}
            onActivePlatformChange={setActivePlatform}
            onUpdateContent={(nextContent) => setContent(nextContent)}
            onRegeneratePlatform={handleRegeneratePlatform}
            onSaveDraft={handleSaveDraft}
          />
        </div>
      )}
    </div>
  );
}
