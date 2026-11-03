import { categoryName, reviewsOf } from "./commerce";
import type { CommerceProduct, ZekaiDb } from "./db";
import { aspectsIn, clausesOf, formatTl, lower, polarity, quote, type Aspect } from "./text";

/**
 * Seller-side demo generators. In production each is one structured Gemini call; here the
 * text is assembled only from the product's own data and its real reviews, so nothing is
 * invented (no warranty or feature the product does not list).
 */
function featureList(p: CommerceProduct): string[] {
  return Object.entries(p.features).map(([key, value]) => (/^\d+$/.test(key) ? value : `${key}: ${value}`));
}

/** Aspects that buyers complain about, most frequent first, each with one sample review. */
export function complaintsOf(db: ZekaiDb, p: CommerceProduct): { aspect: Aspect; sample: string; count: number }[] {
  const found = new Map<string, { aspect: Aspect; sample: string; count: number }>();
  for (const review of reviewsOf(db, p.id)) {
    for (const clause of clausesOf(`${review.title}. ${review.text}`)) {
      const aspects = aspectsIn(clause);
      if (aspects.length !== 1 || polarity(clause) !== "negative") continue;
      const entry = found.get(aspects[0].key) ?? { aspect: aspects[0], sample: quote(clause, 90), count: 0 };
      entry.count += 1;
      found.set(aspects[0].key, entry);
    }
  }
  return [...found.values()].sort((a, b) => b.count - a.count);
}

export interface SimulationInsight {
  buyCount: number;
  skipCount: number;
  undecidedCount: number;
  skipperReasons: string[];
  undecidedConcerns: string[];
  recommendations: string[];
}

export function generateContent(db: ZekaiDb, p: CommerceProduct, insight?: SimulationInsight | null) {
  const features = featureList(p);
  const values = Object.entries(p.features).filter(([k]) => !/^\d+$/.test(k)).slice(0, 3).map(([k, v]) => `${k} ${v}`);
  const base = p.brand && !p.title.toLocaleLowerCase("tr-TR").includes(p.brand.toLocaleLowerCase("tr-TR")) ? `${p.brand} ${p.title}` : p.title;
  const title = values.length ? `${base} | ${values.join(", ")}`.slice(0, 110) : base;
  const complaints = complaintsOf(db, p).slice(0, 2);
  const concernText = complaints.length
    ? `Yorumlarda en çok sorulan konu ${complaints.map((c) => lower(c.aspect.label)).join(" ve ")}. ${complaints[0].aspect.label} için ürünün sunduğu değerleri açıkça yazdık; beklentinizi bu bilgilere göre kurmanızı öneririz.`
    : "Yorumlarda tekrar eden bir şikâyet yok; açıklamayı ürünün öne çıkan özelliklerine odakladık.";
  const insightText = insight && insight.skipperReasons.length
    ? ` Müşteri simülasyonunda vazgeçme nedeni olarak öne çıkan “${insight.skipperReasons[0]}” konusunu da yanıtladık.`
    : "";
  return {
    title,
    shortDescription: `${p.shortDescription.replace(/\.$/, "")}. ${values.length ? `${values.join(" · ")}.` : ""}`.trim(),
    description: [
      p.description,
      features.length ? `Teknik olarak öne çıkanlar: ${features.join(", ")}. ${p.cargoText ? `Kargoya veriliş: ${p.cargoText}.` : ""}` : "",
      concernText + insightText,
    ].filter(Boolean).join("\n\n"),
    features: [...features, ...p.badges].slice(0, 5),
    whatIImproved: [
      values.length ? "Başlığa ürünün öne çıkan teknik değerlerini ekledim." : "Başlığı sade bıraktım; ürünün teknik değeri tanımlı değil.",
      "Açıklamayı kullanım, teknik özellikler ve sık sorulanlar olarak üç paragrafa böldüm.",
      complaints.length ? `Yorumlarda tekrar eden “${lower(complaints[0].aspect.label)}” sorusunu açıklamada yanıtladım.` : "Yorumlarda tekrar eden şikâyet olmadığı için olumlu sinyalleri öne çıkardım.",
      insight ? "Simülasyondaki kararsız müşterilerin sorularını açıklamaya taşıdım." : "",
    ].filter(Boolean).join(" "),
  };
}

const TAGS: Record<string, string[]> = {
  Elektronik: ["#teknoloji", "#elektronik", "#gadget"], Aksesuar: ["#aksesuar", "#teknoloji"], Mutfak: ["#mutfak", "#evdekahve", "#pratiktarifler"],
  "Ev & Yaşam": ["#evdekor", "#evyaşam"], "Spor & Outdoor": ["#spor", "#koşu", "#aktifyaşam"], Giyim: ["#stil", "#kombin", "#moda"],
  "Anne & Bebek": ["#bebek", "#annebebek"],
};

export function generateSocial(p: CommerceProduct, tone: string, purpose: string, platforms: string[], note = "") {
  const tags = [...(TAGS[categoryName(p)] ?? ["#alışveriş"]), `#${p.brand.replace(/[^\p{L}\p{N}]/gu, "").toLocaleLowerCase("tr-TR") || "akıllımarket"}`, "#akıllımarket"].slice(0, 6);
  const features = featureList(p).slice(0, 3);
  const opener = tone === "mizahi" ? `“Keşke daha önce alsaydım” diyenler kulübüne hoş geldiniz 😄` : tone === "samimi" ? `Bunu sizinle paylaşmadan duramadık 💛` : `${p.title}: işini iyi yapan, sade bir tercih.`;
  const goal = purpose === "guven" ? `${p.cargoText ? `${p.cargoText} içinde kargoda` : "Hızlı kargo"}, yorumları açık ve şeffaf.` : purpose === "tanitim" ? "Yeni sezonun en çok merak edilenlerinden." : `Şimdi ${formatTl(p.price)}${p.originalPrice ? ` (liste fiyatı ${formatTl(p.originalPrice)})` : ""}.`;
  const cta = purpose === "satis" ? "Bağlantı profilde, stoklar sınırlı." : purpose === "guven" ? "Yorumları okuyun, sonra karar verin." : "Detaylar için profildeki bağlantıya göz atın.";
  const has = (name: string) => platforms.includes(name);
  return {
    tone, purpose, platforms,
    instagram: has("instagram") ? {
      caption: `${opener}\n\n${p.shortDescription} ${features.length ? `Öne çıkanlar: ${features.join(", ")}.` : ""} ${goal}${note ? ` ${note}` : ""}`.trim(),
      hashtags: tags, cta, overlayText: features[0] ?? p.title,
    } : null,
    tiktok: has("tiktok") ? {
      hook: tone === "mizahi" ? "Bunu almadan önce 3 saniye ver 👀" : `${categoryName(p)} alırken herkesin sorduğu soru…`,
      scenes: [
        { title: "Problem", description: "Günlük kullanımdaki küçük bir sıkıntıyı göster (ör. şarjın bitmesi ya da yer darlığı)." },
        { title: "Ürün", description: `${p.title} kutudan çıkıyor; ${features[0] ?? "öne çıkan özellik"} yakın planda.` },
        { title: "Sonuç", description: `Kullanım anı ve fiyat etiketi: ${formatTl(p.price)}.` },
      ],
      caption: `${p.title} · ${goal}`, hashtags: tags.slice(0, 5),
    } : null,
    twitter: has("twitter") ? { post: `${p.title}: ${features.slice(0, 2).join(", ") || p.shortDescription}. ${goal}`.slice(0, 220), hashtags: tags.slice(0, 2), cta } : null,
    generatedAt: new Date().toISOString(),
  };
}

const FAQ_TEMPLATES: Record<string, string> = {
  mic: "Mikrofon görüşmeler için yeterli mi?", battery: "Pil ömrü ne kadar?", fit: "Kalıbı nasıl, hangi bedeni almalıyım?",
  setup: "Kurulumu ya da montajı zor mu?", compat: "Hangi cihazlarla uyumlu?", noise: "Çalışırken ses çıkarıyor mu?",
  durability: "Uzun süreli kullanımda dayanıklı mı?", app: "Uygulaması Türkçe mi?", box: "Kutudan neler çıkıyor?", heat: "Kullanırken ısınıyor mu?",
  latency: "Oyun ve video için gecikme var mı?", sound: "Ses kalitesi nasıl?", comfort: "Uzun süre kullanımda rahat mı?",
};

export function generateCustomerVoice(db: ZekaiDb, p: CommerceProduct, nextId: () => number) {
  const now = new Date().toISOString();
  const reviews = reviewsOf(db, p.id).slice(0, 10);
  const replyDrafts = reviews.map((r) => {
    const text = `${r.title}. ${r.text}`;
    const complaint = clausesOf(text).find((c) => polarity(c) === "negative");
    const sentiment = r.rating >= 4 && !complaint ? "positive" : r.rating <= 2 ? "negative" : "mixed";
    const aspect = aspectsIn(complaint ?? text)[0];
    const name = r.authorName === "Müşteri" ? "Değerli müşterimiz" : `${r.authorName.split(" ")[0]} Hanım/Bey`;
    const suggestedReply = sentiment === "positive"
      ? `${name}, güzel yorumunuz için teşekkür ederiz! ${aspect ? `${aspect.label} konusundaki memnuniyetiniz bizi çok sevindirdi.` : "Ürünü beğenmenize çok sevindik."} İyi günlerde kullanın.`
      : `${name}, geri bildiriminiz için teşekkür ederiz. ${aspect ? `${aspect.label} konusunda yaşadığınız durumu not aldık.` : "Yaşadığınız durumu not aldık."} Sipariş numaranızla bize mesaj gönderirseniz hızlıca yardımcı olalım.`;
    return {
      id: nextId(), reviewId: r.id, reviewText: r.text, authorName: r.authorName, rating: r.rating, suggestedReply, sentiment,
      issueType: aspect?.label ?? "Genel deneyim", needsReply: sentiment !== "positive", status: r.sellerReply ? "published" : "draft",
      createdAt: now, publishedAt: r.sellerReply ? now : null,
    };
  });
  const byAspect = new Map<string, number[]>();
  for (const r of reviews) for (const a of aspectsIn(`${r.title}. ${r.text}`)) byAspect.set(a.key, [...(byAspect.get(a.key) ?? []), r.id]);
  const faqDrafts = [...byAspect.entries()].filter(([key]) => FAQ_TEMPLATES[key]).sort((a, b) => b[1].length - a[1].length).slice(0, 4)
    .map(([key, ids]) => {
      const feature = Object.entries(p.features).find(([k]) => aspectsIn(k).some((a) => a.key === key));
      return {
        id: nextId(), question: FAQ_TEMPLATES[key],
        answer: feature ? `${feature[0]}: ${feature[1]}. Ayrıntılar ürün açıklamasında yer alıyor.` : `Bu konuyu ürün açıklamasında netleştirdik: ${quote(p.description, 120)}`,
        sourceReviewIds: ids, categoryTag: key, status: "draft", createdAt: now, publishedAt: null,
      };
    });
  return { replyDrafts, faqDrafts };
}
