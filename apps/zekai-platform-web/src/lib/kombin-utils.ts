import type { BodyZone } from "@/types/kombin";

const CATEGORY_ZONE_MAP: Record<string, BodyZone> = {
  // Kafa bölgesi
  "Kulaklık": "head",
  "Kablosuz Kulaklık": "head",
  "Bluetooth Kulaklık": "head",
  "Şapka": "head",
  "Gözlük": "head",
  "Güneş Gözlüğü": "head",
  // Bilek bölgesi
  "Akıllı Saat": "wrist",
  "Spor Saat": "wrist",
  "Bileklik": "wrist",
  "Saat": "wrist",
  // Ayak bölgesi
  "Ayakkabı": "feet",
  "Spor Ayakkabı": "feet",
  "Sneaker": "feet",
  "Bot": "feet",
  "Çorap": "feet",
  // Sırt bölgesi
  "Çanta": "back",
  "Sırt Çantası": "back",
  "Laptop Çantası": "back",
  // Gövde bölgesi
  "Tişört": "torso",
  "Hırka": "torso",
  "Sweatshirt": "torso",
  "Ceket": "torso",
  "Gömlek": "torso",
  "Yelek": "torso",
  // El bölgesi
  "Telefon": "hands",
  "Akıllı Telefon": "hands",
  "Tablet": "hands",
  "Telefon Kılıfı": "hands",
  "Kılıf": "hands",
  "Aksesuar": "hands",
  "Telefon Aksesuarı": "hands",
};

export function inferBodyZone(category: string): BodyZone {
  if (!category) return "torso";
  const direct = CATEGORY_ZONE_MAP[category];
  if (direct) return direct;
  // case-insensitive partial match
  const lower = category.toLowerCase();
  for (const [key, zone] of Object.entries(CATEGORY_ZONE_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return zone;
    }
  }
  return "torso";
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case "ana": return "Ana Parça";
    case "tamamlayici": return "Tamamlayıcı";
    case "opsiyonel": return "Opsiyonel";
    default: return role;
  }
}

export function getRoleColor(role: string): string {
  switch (role) {
    case "ana": return "text-[#adff41]";
    case "tamamlayici": return "text-sky-400";
    case "opsiyonel": return "text-muted-foreground";
    default: return "text-muted-foreground";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 75) return "text-[#adff41]";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}
