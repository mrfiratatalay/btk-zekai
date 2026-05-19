"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
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
  saveSocialDraft,
  getProductSocialDrafts,
  deleteSocialDraft,
  activateSocialDraft,
  type SocialDraft,
  type SocialInstagramContent,
  type SocialMediaContent,
  type SocialPlatform,
  type SocialPurpose,
  type SocialTiktokContent,
  type SocialTone,
  type SocialTwitterContent,
} from "@/lib/api/seller";

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
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
          {product.image ? (
            <Image src={product.image} alt={product.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="size-5 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-foreground">{product.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{product.category}</span>
            <span className="font-semibold text-foreground">{formatSellerPrice(product.price)}</span>
            <span>Stok: <span className="font-semibold text-green-600">{product.stock}</span></span>
          </div>
        </div>
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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-bold text-foreground">İçerik Ayarları</h2>

      <div className="mt-5 grid gap-5">
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ton</p>
          <div className="flex flex-wrap gap-2">
            {TONES.map(({ key, label, Icon }) => (
              <OptionButton key={key} active={tone === key} onClick={() => onToneChange(key)} Icon={Icon} label={label} />
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amaç</p>
          <div className="flex flex-wrap gap-2">
            {PURPOSES.map(({ key, label, Icon }) => (
              <OptionButton key={key} active={purpose === key} onClick={() => onPurposeChange(key)} Icon={Icon} label={label} />
            ))}
          </div>
        </div>

        <div className="h-px bg-border" />

        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Platformlar</p>
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
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={generating || selectedPlatforms.length === 0}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-green-600 text-xs font-black text-white">ME</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">Mehmet Elektronik</p>
          </div>
          <span className="text-xl leading-none text-muted-foreground">...</span>
        </div>
        <div className="relative mt-4 aspect-square overflow-hidden rounded-xl bg-muted">
          {product.image ? (
            <Image src={product.image} alt={product.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="size-10 text-muted-foreground" />
            </div>
          )}
          {content.overlayText && (
            <div className="absolute inset-x-4 bottom-4 rounded-lg bg-black/55 px-3 py-2 text-center text-sm font-bold text-white">
              {content.overlayText}
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between text-foreground">
          <div className="flex gap-4">
            <Heart className="size-6" />
            <MessageCircle className="size-6" />
            <Camera className="size-6" />
          </div>
          <Bookmark className="size-6" />
        </div>
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-foreground">{content.caption}</p>
        <p className="mt-2 text-sm leading-6 text-green-700 dark:text-green-400">{formatTags(content.hashtags)}</p>
      </div>

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
      <div className="mx-auto w-full max-w-[330px] rounded-[2rem] border border-border bg-black p-3 shadow-sm">
        <div className="relative aspect-[9/16] overflow-hidden rounded-[1.55rem] bg-neutral-900">
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
      </div>

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
  generatedContent,
  onChange,
}: {
  content: SocialTwitterContent;
  generatedContent: SocialMediaContent;
  onChange: (content: SocialTwitterContent) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-black text-lg font-black text-white">X</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-foreground">Mehmet Elektronik</p>
              <p className="text-sm text-muted-foreground">@mehmetelektronik</p>
            </div>
            <p className="mt-3 whitespace-pre-line text-lg leading-8 text-foreground">{content.post}</p>
            <p className="mt-3 text-sm text-green-700 dark:text-green-400">{formatTags(content.hashtags)}</p>
            <div className="mt-5 flex items-center gap-8 text-sm text-muted-foreground">
              <span>128 yanıt</span>
              <span>2.4B görüntülenme</span>
              <span>486 beğeni</span>
            </div>
          </div>
        </div>
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

      <div className="rounded-2xl border border-border bg-background p-5">
        <h3 className="text-base font-bold text-foreground">İçerik Paketi Özeti</h3>
        <div className="mt-5 space-y-3">
          {PLATFORMS.map(({ key, label, Icon }) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-border px-3 py-3">
              <div className="flex items-center gap-3">
                <Icon className="size-5 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{label}</span>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-bold",
                  platformIsReady(generatedContent, key)
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {platformIsReady(generatedContent, key) ? "Hazır" : "Seçilmedi"}
              </span>
            </div>
          ))}
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
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
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

      <div className="p-5">
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
            generatedContent={content}
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

// ─── DraftsSection ────────────────────────────────────────────────────────────

function DraftsSection({
  drafts,
  onLoadDraft,
  onDeleteDraft,
  onActivateDraft,
}: {
  drafts: SocialDraft[];
  onLoadDraft: (draft: SocialDraft) => void;
  onDeleteDraft: (id: string) => void;
  onActivateDraft: (id: string) => void;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <FileText className="size-5 text-muted-foreground" />
        <div>
          <h2 className="text-base font-bold text-foreground">Taslaklar</h2>
          <p className="text-xs text-muted-foreground">DB&apos;de saklanan içerik varyasyonların — biri &ldquo;Aktif&rdquo;</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {drafts.map((draft) => {
          const platformNames = (draft.platforms ?? [])
            .map((p) => platformLabel(p as SocialPlatform))
            .join(", ");
          const date = new Date(draft.createdAt).toLocaleString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div
              key={draft.id}
              className={cn(
                "flex items-center justify-between gap-4 rounded-xl border px-4 py-3",
                draft.isActive ? "border-green-500 bg-green-500/5" : "border-border",
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{draft.label}</p>
                  {draft.isActive && (
                    <span className="shrink-0 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{platformNames || "—"} · {date}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!draft.isActive && (
                  <button
                    type="button"
                    onClick={() => onActivateDraft(draft.id)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-green-500 px-3 text-xs font-bold text-green-700 transition-colors hover:bg-green-500/10 dark:text-green-400"
                  >
                    Aktif Et
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onLoadDraft(draft)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-green-600 px-3 text-xs font-bold text-white transition-colors hover:bg-green-700"
                >
                  Yükle
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteDraft(draft.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
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
  const [drafts, setDrafts] = useState<SocialDraft[]>([]);

  useEffect(() => {
    getProductSocialDrafts(product.id)
      .then(setDrafts)
      .catch(() => setDrafts([]));
  }, [product.id]);

  function togglePlatform(platform: SocialPlatform) {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await generateSocialContent(product.id, { tone, purpose, platforms: selectedPlatforms });
      setContent(result);
      setActivePlatform(selectedPlatforms[0] ?? "instagram");
      getProductSocialDrafts(product.id).then(setDrafts).catch(() => undefined);
      toast.success(result._cached ? "Kayıtlı sosyal medya taslağı kullanıldı." : `${selectedPlatforms.length} platform için içerik üretildi ve otomatik kaydedildi.`);
    } catch {
      toast.error("İçerik üretilemedi, lütfen tekrar dene.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRegeneratePlatform(platform: SocialPlatform) {
    setRegeneratingPlatform(platform);
    try {
      const result = await generateSocialContent(product.id, { tone, purpose, platforms: [platform] });
      setContent((current) => {
        if (!current) return result;
        return {
          ...current,
          [platform]: result[platform],
          generatedAt: result.generatedAt,
          platforms: Array.from(new Set([...current.platforms, platform])) as SocialPlatform[],
          _mock: result._mock ?? current._mock,
        };
      });
      getProductSocialDrafts(product.id).then(setDrafts).catch(() => undefined);
      toast.success(result._cached ? `${platformLabel(platform)} kayıtlı taslaktan yüklendi.` : `${platformLabel(platform)} yeniden üretildi ve otomatik kaydedildi.`);
    } catch {
      toast.error("Platform içeriği yeniden üretilemedi.");
    } finally {
      setRegeneratingPlatform(null);
    }
  }

  async function handleSaveDraft() {
    if (!content) return;
    try {
      const saved = await saveSocialDraft(product.id, {
        tone,
        purpose,
        platforms: content.platforms,
        content,
      });
      setDrafts((current) => [saved, ...current]);
      toast.success("Taslak DB'ye kaydedildi — Taslaklarım'dan da görebilirsin");
    } catch {
      toast.error("Taslak kaydedilemedi.");
    }
  }

  function handleLoadDraft(draft: SocialDraft) {
    setContent(draft.content);
    setActivePlatform(draft.content.platforms?.[0] ?? "instagram");
    toast.success("Taslak yüklendi.");
  }

  async function handleDeleteDraft(draftId: string) {
    try {
      await deleteSocialDraft(draftId);
      setDrafts((current) => current.filter((d) => d.id !== draftId));
      toast.success("Taslak silindi.");
    } catch {
      toast.error("Silinemedi.");
    }
  }

  async function handleActivateDraft(draftId: string) {
    try {
      await activateSocialDraft(draftId);
      setDrafts((current) => current.map((d) => ({ ...d, isActive: d.id === draftId })));
      toast.success("Aktif içerik güncellendi.");
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  return (
    <div className="pb-16">
      {/* Mock alert */}
      {content?._mock && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-400">
          <AlertTriangle className="size-4 shrink-0" />
          Demo mod aktif. Bu içerik gerçek AI çıktısı olmayabilir.
        </div>
      )}

      {/* Breadcrumb + title (full width, sticky at top of scroll area) */}
      <div className="sticky top-0 z-20 -mx-4 -mt-4 bg-background/95 px-4 pt-4 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8 border-b border-border mb-6">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/seller/products" className="transition-colors hover:text-foreground">
            Ürünlerim
          </Link>
          <ChevronRight className="size-3.5" />
          <Link href={`/seller/product/${product.id}`} className="max-w-[220px] truncate transition-colors hover:text-foreground">
            {product.title}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">Sosyal Medya İçeriği</span>
        </div>
        <div className="mt-3">
          <h1 className="text-2xl font-black tracking-tight text-foreground">Sosyal Medya İçeriği</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ürünün için seçili platformlara uygun pazarlama içeriği oluştur.
          </p>
        </div>
      </div>

      {/* Two-column layout: sticky settings (left) + content (right) */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
        {/* Left sticky column */}
        <div className="space-y-4 lg:sticky lg:top-0 lg:self-start">
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

        {/* Right column */}
        <div>
          {content ? (
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
          ) : (
            <EmptyContentState />
          )}
        </div>
      </div>

      {/* Drafts section */}
      {drafts.length > 0 && (
        <DraftsSection
          drafts={drafts}
          onLoadDraft={handleLoadDraft}
          onDeleteDraft={handleDeleteDraft}
          onActivateDraft={handleActivateDraft}
        />
      )}
    </div>
  );
}
