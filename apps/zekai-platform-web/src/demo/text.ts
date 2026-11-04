/**
 * Small Turkish text helpers for the demo's rule-based "advisor". It cannot understand
 * language like Gemini; it only matches a fixed list of product aspects in the buyer's
 * need and in real review text, and every claim it makes quotes the review it came from.
 */
export interface Aspect {
  key: string;
  label: string;
  terms: string[];
}

export const ASPECTS: Aspect[] = [
  { key: "mic", label: "Mikrofon ve görüşme kalitesi", terms: ["mikrofon", "toplantı", "görüşme", "zoom", "konuşma"] },
  { key: "battery", label: "Pil ömrü", terms: ["pil", "batarya", "şarj"] },
  { key: "sound", label: "Ses kalitesi", terms: ["ses kalitesi", "müzik", "bas", "ses dengesi", "anc", "gürültü engelleme"] },
  { key: "latency", label: "Gecikme ve oyun", terms: ["gecikme", "oyun", "latency", "fps", "valorant"] },
  { key: "fit", label: "Beden ve kalıp", terms: ["beden", "kalıp", "numara", "dar geldi", "bol geldi", "küçük geldi", "büyük geldi"] },
  { key: "comfort", label: "Konfor", terms: ["rahat", "konfor", "ağrı", "bel desteği", "yastıklama", "terlemeden"] },
  { key: "durability", label: "Dayanıklılık", terms: ["dayan", "taban ayrıldı", "kırıl", "bozul", "yıprand", "sağlam"] },
  { key: "setup", label: "Kurulum ve montaj", terms: ["montaj", "kurulum", "talimat", "vida"] },
  { key: "heat", label: "Isınma", terms: ["ısınma", "ısınıyor", "fan sesi", "fan "] },
  { key: "noise", label: "Çalışma sesi", terms: ["sessiz", "ses biraz yüksek", "gürültülü", "sesi yüksek"] },
  { key: "compat", label: "Uyumluluk", terms: ["uyumlu", "uyumluluk", "windows", "macbook", "iphone", "model"] },
  { key: "app", label: "Uygulama", terms: ["uygulama", "türkçe değil", "menü"] },
  { key: "box", label: "Paket içeriği", terms: ["kutu", "eksik", "aparat", "paket"] },
  { key: "value", label: "Fiyat/performans", terms: ["fiyatına", "fiyat/performans", "fiyat performans", "pahalı", "ucuz"] },
  { key: "gift", label: "Hediye uygunluğu", terms: ["hediye"] },
  { key: "sport", label: "Spor kullanımı", terms: ["koşu", "spor", "antrenman", "yürüyüş", "nabız"] },
  { key: "sleep", label: "Uyku takibi", terms: ["uyku"] },
  { key: "office", label: "Uzun süreli çalışma", terms: ["8 saat", "uzun süre", "ofis", "uzaktan çalış", "iş günü", "ders"] },
];

export function lower(text: string): string {
  return text.toLocaleLowerCase("tr-TR");
}

const NEGATIVE_CUES = ["zayıf", "kötü", "yetersiz", "eksik", "zor", "karmaşık", "dayanmadı", "ayrıldı", "tanınmıyor", "kaşındır",
  "hayal kırıklığı", "gecikme var", "gecikmeli", "rahatsız", "gitmiyor", "değildi", "uygun değil", "türkçe değil", "tereddüt",
  "sinir bozucu", "daha net", "eklenmeli", "yazmadığı", "sorulur", "ısınma", "gürültülü", "sesi yüksek", "lazım", "sorunlu", "soru işareti"];
const POSITIVE_CUES = ["harika", "mükemmel", "çok iyi", "memnun", "güçlü", "rahat", "sorunsuz", "sorun yok", "doğru", "ideal",
  "tavsiye", "iyi", "yeterli", "fena değil", "dengeli", "tatmin", "çözdü", "geçti", "uzun"];

/** Review text split into clauses: "harika, ama mikrofon zayıf" carries two opposite verdicts. */
export function clausesOf(text: string): string[] {
  return text.split(/[.!?;]+|,?\s+(?:ama|ancak|fakat)\s+/i).map((c) => c.trim()).filter((c) => c.length > 2);
}

export function polarity(clause: string): "negative" | "positive" | null {
  const value = lower(clause);
  if (NEGATIVE_CUES.some((cue) => value.includes(cue))) return "negative";
  return POSITIVE_CUES.some((cue) => value.includes(cue)) ? "positive" : null;
}

export function aspectsIn(text: string): Aspect[] {
  const value = lower(text);
  return ASPECTS.filter((aspect) => aspect.terms.some((term) => value.includes(term)));
}

/** Reads a budget such as "1.200 TL", "1500 lira" or "bütçem 2 bin" from the need text. */
export function budgetFrom(text: string): number | null {
  const value = lower(text);
  const thousands = value.match(/(\d+(?:[.,]\d+)?)\s*bin/);
  if (thousands) return Math.round(parseFloat(thousands[1].replace(",", ".")) * 1000);
  const plain = value.match(/(\d{1,3}(?:\.\d{3})+|\d{3,6})\s*(?:tl|₺|lira)/);
  if (plain) return Number(plain[1].replace(/\./g, ""));
  const prefixed = value.match(/₺\s*(\d{1,3}(?:\.\d{3})+|\d{3,6})/);
  return prefixed ? Number(prefixed[1].replace(/\./g, "")) : null;
}

export function formatTl(value: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

/** A short quote for evidence fields, cut on a word boundary. */
export function quote(text: string, max = 110): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function hashString(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function normalizeNeed(text: string): string {
  return lower(text).trim().replace(/\s+/g, " ");
}
