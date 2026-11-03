import { CATALOG } from "./catalog";
import { bundleProductDto, bundlePricing, categoryName, ratingOf, reviewsOf } from "./commerce";
import type { CommerceProduct, ZekaiDb } from "./db";
import { formatTl, quote } from "./text";

/**
 * Customer simulation: the same five personas as services/ai-service/seller/simulation_router.py.
 * Each one decides from the part of the page it cares about, using the product's real data.
 */
const PERSONAS = [
  { id: "butce_odakli_alici", name: "Elif", age: 28, city: "İstanbul", segment: "Bütçe odaklı alıcı", profile: "Fiyat performans dengesine bakar ve gereksiz pahalı ürünlerden uzak durur.", caresAbout: "Fiyat, yorumlar ve garanti", focusArea: "price", focusLabel: "Fiyatı tartıyor" },
  { id: "kalite_arayan_profesyonel", name: "Mert", age: 34, city: "Ankara", segment: "Kalite arayan profesyonel", profile: "İşinde uzun süre kullanabileceği güvenilir ürünleri tercih eder.", caresAbout: "Kalite, teknik özellikler ve garanti", focusArea: "features", focusLabel: "Özellikleri inceliyor" },
  { id: "yorumlara_bakan_kullanici", name: "Zeynep", age: 31, city: "İzmir", segment: "Yorumlara bakan kullanıcı", profile: "Karar vermeden önce diğer alıcıların deneyimlerini dikkatle okur.", caresAbout: "Yorumlar, puan ve şikâyetler", focusArea: "reviews", focusLabel: "Yorumlara bakıyor" },
  { id: "hizli_karar_veren", name: "Burak", age: 25, city: "Bursa", segment: "Hızlı karar veren", profile: "Ürün bilgisi netse ve teslimat iyi görünüyorsa hızlı satın alır.", caresAbout: "Kargo, başlık ve satın alma kolaylığı", focusArea: "shipping", focusLabel: "Kargoya bakıyor" },
  { id: "tasarim_odakli_alici", name: "Derya", age: 39, city: "Eskişehir", segment: "Tasarım odaklı alıcı", profile: "Ürünün görünüşü, sunumu ve marka algısı kararında etkili olur.", caresAbout: "Görseller, marka algısı ve açıklama", focusArea: "image", focusLabel: "Görsellere bakıyor" },
] as const;

type Decision = "buy" | "skip" | "undecided";

function decideFor(db: ZekaiDb, p: CommerceProduct, personaId: string): { decision: Decision; reason: string; recommendation: string; monologue: string; lookedAt: string[] } {
  const { rating, reviewCount } = ratingOf(db, p.id);
  const reviews = reviewsOf(db, p.id);
  const worst = [...reviews].sort((a, b) => a.rating - b.rating)[0];
  const featureCount = Object.keys(p.features).length;
  const warranty = Object.keys(p.features).some((k) => k.toLocaleLowerCase("tr-TR").includes("garanti")) || p.badges.some((b) => b.includes("Garanti"));
  const similar = db.commerce.products.filter((x) => x.categoryId === p.categoryId && x.id !== p.id).map((x) => x.price).sort((a, b) => a - b);
  const median = similar.length ? similar[Math.floor(similar.length / 2)] : p.price;
  switch (personaId) {
    case "butce_odakli_alici": {
      const discounted = !!p.originalPrice && p.originalPrice > p.price;
      const cheap = p.price <= median;
      const decision: Decision = discounted || cheap ? "buy" : rating >= 4 ? "undecided" : "skip";
      return { decision, lookedAt: ["price", "rating", "warranty"],
        reason: discounted ? `Liste fiyatı ${formatTl(p.originalPrice!)} iken ${formatTl(p.price)}; indirim net görünüyor.` : cheap ? `Benzer ürünlerin ortasında bir fiyat: ${formatTl(p.price)}.` : `Fiyat (${formatTl(p.price)}) benzer ürünlerin medyanından (${formatTl(median)}) yüksek.`,
        recommendation: discounted ? "İndirimi başlıkta ya da ilk görselde vurgulayın." : "Fiyatı benzer ürünlerle karşılaştıran kısa bir not ekleyin.",
        monologue: `${formatTl(p.price)}… ${discounted ? "İndirim gerçek gibi duruyor." : "Bu paraya başka seçeneklere de bakmalıyım."}` };
    }
    case "kalite_arayan_profesyonel": {
      const decision: Decision = featureCount >= 4 && warranty ? "buy" : featureCount >= 3 ? "undecided" : "skip";
      return { decision, lookedAt: ["features", "warranty", "title"],
        reason: decision === "buy" ? `${featureCount} teknik özellik ve garanti bilgisi var.` : warranty ? "Teknik özellikler yetersiz." : "Garanti bilgisi göremedim.",
        recommendation: warranty ? "Teknik tabloyu kullanım senaryolarıyla zenginleştirin." : "Garanti süresini özellik tablosuna ekleyin.",
        monologue: decision === "buy" ? "Teknik detaylar yeterli, garanti de var. Uzun süre kullanırım." : "Bilmem gereken birkaç teknik detay eksik." };
    }
    case "yorumlara_bakan_kullanici": {
      const lowShare = reviews.length ? reviews.filter((r) => r.rating <= 2).length / reviews.length : 1;
      const decision: Decision = rating >= 4.2 && lowShare < 0.2 ? "buy" : rating >= 3.6 ? "undecided" : "skip";
      return { decision, lookedAt: ["reviews", "rating"],
        reason: worst && decision !== "buy" ? `Şu yorum aklımı kurcalıyor: “${quote(worst.text, 80)}”` : `${reviewCount} yorumun ortalaması ${rating}/5; şikâyetler sınırlı.`,
        recommendation: "Olumsuz yorumlara görünür bir satıcı cevabı yazın; Müşteri Sesi bunun için taslak üretir.",
        monologue: decision === "buy" ? "Yorumlar tutarlı, gönül rahatlığıyla alırım." : "Bir de şu şikâyetlere cevap verilmiş mi bakayım…" };
    }
    case "hizli_karar_veren": {
      const fast = /1-2|2-3|aynı gün|ertesi gün/.test(p.cargoText) || p.badges.some((b) => b.includes("Kargo"));
      const decision: Decision = fast && p.stock > 0 ? "buy" : "undecided";
      return { decision, lookedAt: ["shipping", "title", "cta"],
        reason: fast ? `Kargo bilgisi net: ${p.cargoText || "ücretsiz kargo"}.` : `Teslimat süresi belirsiz (${p.cargoText || "bilgi yok"}).`,
        recommendation: fast ? "Kargo süresini sepete ekle düğmesinin yanında gösterin." : "Teslimat süresini başlığın altına yazın.",
        monologue: fast ? "Yarın kapıda olur, tamam alıyorum." : "Ne zaman gelir? Bilmiyorsam beklemem." };
    }
    default: {
      const images = p.images.length;
      const decision: Decision = images >= 2 ? "buy" : images === 1 ? "undecided" : "skip";
      return { decision, lookedAt: ["image", "title"],
        reason: images >= 2 ? `${images} görsel ürünü farklı açılardan gösteriyor.` : images === 1 ? "Tek görsel var; ürünü farklı açılardan göremedim." : "Hiç ürün görseli yok.",
        recommendation: "Stüdyo ve kullanım görselleri ekleyin; AI ile Düzenle ekranındaki görsel üretici bunun için var.",
        monologue: images >= 2 ? "Sunum şık, markaya güven veriyor." : "Görsel az, ürünü kafamda canlandıramadım." };
    }
  }
}

export function simulatePersonas(db: ZekaiDb, p: CommerceProduct) {
  return PERSONAS.map((persona) => {
    const d = decideFor(db, p, persona.id);
    return { ...persona, ...d, bubbleText: d.monologue };
  });
}

// ── Bundle recommendations: port of SellerService.ScoreRecommendation in commerce-api ──
function categoryComplement(primary: string, candidate: string): number {
  if (primary === "elektronik" && (candidate === "aksesuar" || candidate === "elektronik")) return 35;
  if (primary === "aksesuar" && (candidate === "elektronik" || candidate === "spor-outdoor")) return 30;
  if (primary === "mutfak" && candidate === "mutfak") return 35;
  if (primary === "ev-yasam" && candidate === "ev-yasam") return 30;
  if (primary === "spor-outdoor" && (candidate === "elektronik" || candidate === "aksesuar")) return 35;
  return primary === candidate ? 20 : 8;
}

function tokens(p: CommerceProduct): Set<string> {
  const map: Record<string, string> = { ı: "i", ğ: "g", ü: "u", ş: "s", ö: "o", ç: "c" };
  const text = `${p.title} ${p.shortDescription} ${JSON.stringify(p.features)}`.toLowerCase().replace(/[ığüşöç]/g, (c) => map[c]);
  return new Set(text.split(/[^a-z0-9]+/).filter((t) => t.length > 3));
}

const DEMO_PAIRS: Record<string, number> = {
  "bluetooth-kulaklik-pro-x1|telefon-kilifi-magsafe": 20, "bluetooth-kulaklik-pro-x1|usb-c-hub-pro": 18,
  "akilli-saat-fit-neo|telefon-kilifi-magsafe": 20, "kahve-degirmeni-burr|mutfak-robotu-compact": 20,
  "masa-lambasi-led|ergonomik-calisma-sandalyesi": 20,
};

function score(db: ZekaiDb, primary: CommerceProduct, candidate: CommerceProduct): number {
  const slug = (p: CommerceProduct) => CATALOG.categories.find((c) => c.id === p.categoryId)?.slug ?? "";
  let total = categoryComplement(slug(primary), slug(candidate));
  const a = tokens(primary);
  total += Math.min(15, [...tokens(candidate)].filter((t) => a.has(t)).length * 5);
  const ratio = primary.price > 0 ? candidate.price / primary.price : 0;
  total += primary.price <= 0 ? 0 : ratio <= 0.75 ? 20 : ratio <= 1.25 ? 15 : ratio <= 2 ? 8 : 2;
  total += Math.min(10, Math.floor(candidate.stock / 5) + 2);
  const { rating, reviewCount } = ratingOf(db, candidate.id);
  total += Math.min(15, Math.round(rating * 2 + Math.min(5, reviewCount / 10)));
  total += DEMO_PAIRS[`${primary.id}|${candidate.id}`] ?? 0;
  return Math.min(100, total);
}

const MISSING_IDEAS: Record<string, string[]> = {
  "spor-outdoor": ["Spor çorabı", "Ayakkabı bakım spreyi", "Spor çantası", "Tabanlık"],
  elektronik: ["Koruyucu kılıf", "USB-C kablo", "Şarj adaptörü", "Stand"],
  mutfak: ["Ölçü kaşığı", "Saklama kabı", "Temizlik fırçası", "Kahve filtresi"],
  "ev-yasam": ["Yedek ampul", "Kablo düzenleyici", "Masa organizeri", "Temizlik seti"],
};

export function recommendBundles(db: ZekaiDb, sellerId: string, primary: CommerceProduct) {
  const brand = (p: CommerceProduct) => p.brand || p.title.split(" ")[0];
  const recommendations = db.commerce.products
    .filter((c) => c.sellerId === sellerId && c.id !== primary.id && c.published && c.stock > 0)
    .map((c) => ({ c, s: score(db, primary, c) }))
    .filter((x) => x.s >= 30)
    .sort((x, y) => y.s - x.s)
    .slice(0, 3)
    .map(({ c, s }) => ({
      primaryProduct: bundleProductDto(primary), complementaryProduct: bundleProductDto(c),
      suggestedTitle: `${brand(primary)} + ${brand(c)} Paketi`, suggestedShortDescription: `${brand(primary)} ürününü ${brand(c)} ile tamamla.`,
      suggestedCampaignText: "İkisini birlikte al, sepette %5 avantaj yakala.", suggestedCtaLabel: "Paketi Sepete Ekle", suggestedDiscountPercent: 5,
      recommendationReason: `${categoryName(c)} kategorisi ${categoryName(primary)} ile birlikte sepet değerini artırabilir.`, score: s,
      ...bundlePricing(primary, c, 5),
    }));
  const slug = CATALOG.categories.find((c) => c.id === primary.categoryId)?.slug ?? "";
  return {
    recommendations,
    missingOpportunity: recommendations.length ? null : {
      title: "Eksik Fırsat", message: "Bu ürünle birlikte satılabilecek uygun tamamlayıcı ürün mağazada bulunamadı.",
      suggestedProductIdeas: MISSING_IDEAS[slug] ?? ["Tamamlayıcı aksesuar", "Bakım ürünü", "Yedek parça", "Hediye paketi"],
    },
  };
}
