import type { AgentStep, BuyerAnalysis, RecommendationLevel } from "@/types/analysis";
import type { Product } from "@/types/product";
import {
  formatPrice,
  getProductById,
  products,
} from "@/lib/mock-data/products";

type AnalysisProfile = {
  fitFocus: string[];
  coreConcern: string;
  categoryUseCase: string;
  returnReasons: Array<{ label: string; percent: number }>;
  scenarios: Array<{ scenario: string; score: number }>;
};

const defaultNeed =
  "Bu ürünü almayı düşünüyorum. Beklentilerime uygun mu, fiyatı ve iade riski mantıklı mı görmek istiyorum.";

function clampScore(value: number) {
  return Math.min(92, Math.max(24, Math.round(value)));
}

function getRecommendationLevel(risk: number): RecommendationLevel {
  if (risk >= 66) {
    return "risky";
  }

  if (risk >= 45) {
    return "caution";
  }

  return "safe";
}

function getProfile(product: Product): AnalysisProfile {
  const category = product.category.toLocaleLowerCase("tr-TR");

  if (product.features.Mikrofon || product.features["Gecikme modu"]) {
    return {
      fitFocus: ["Mikrofon Kalitesi", "Gecikme / Oyun Uyumu", "Uzun Kullanım Konforu"],
      coreConcern: "mikrofon, gecikme ve uzun kullanım konforu",
      categoryUseCase: "online ders, oyun ve günlük müzik kullanımı",
      returnReasons: [
        { label: "Mikrofon beklediğim gibi değildi", percent: 38 },
        { label: "Kulak ağrıttı / konfor", percent: 22 },
        { label: "Oyun gecikmesi fazla", percent: 18 },
        { label: "Kargo hasarı", percent: 12 },
        { label: "Diğer", percent: 10 },
      ],
      scenarios: [
        { scenario: "Müzik dinlemek için alsaydın", score: 78 },
        { scenario: "İş toplantıları için alsaydın", score: 49 },
        { scenario: "Podcast / sesli kitap için alsaydın", score: 82 },
      ],
    };
  }

  if (category.includes("ev")) {
    return {
      fitFocus: ["Ölçü ve Alan Uyumu", "Malzeme / Konfor", "Kurulum Beklentisi"],
      coreConcern: "ölçü, konfor ve kullanım alanı beklentisi",
      categoryUseCase: "ev veya ofis içinde uzun süreli kullanım",
      returnReasons: [
        { label: "Ölçü beklediğim gibi değildi", percent: 30 },
        { label: "Konfor / kalite beklentisi karşılanmadı", percent: 26 },
        { label: "Kurulum veya kullanım zor geldi", percent: 18 },
        { label: "Kargo hasarı", percent: 14 },
        { label: "Diğer", percent: 12 },
      ],
      scenarios: [
        { scenario: "Dar alan için alsaydın", score: 58 },
        { scenario: "Uzun çalışma için alsaydın", score: 63 },
        { scenario: "Kısa süreli kullanım için alsaydın", score: 76 },
      ],
    };
  }

  if (category.includes("spor")) {
    return {
      fitFocus: ["Beden / Kalıp Uyumu", "Taban Konforu", "Dayanıklılık"],
      coreConcern: "beden uyumu, konfor ve iade riski",
      categoryUseCase: "günlük yürüyüş ve hafif antrenman",
      returnReasons: [
        { label: "Kalıp / beden uyuşmadı", percent: 42 },
        { label: "Taban konforu beklediğim gibi değil", percent: 21 },
        { label: "Malzeme kalitesi düşük geldi", percent: 16 },
        { label: "Görseldeki gibi durmadı", percent: 11 },
        { label: "Diğer", percent: 10 },
      ],
      scenarios: [
        { scenario: "Günlük yürüyüş için alsaydın", score: 74 },
        { scenario: "Koşu antrenmanı için alsaydın", score: 52 },
        { scenario: "Uzun ayakta kalma için alsaydın", score: 61 },
      ],
    };
  }

  if (category.includes("aksesuar")) {
    return {
      fitFocus: ["Görsel Beklenti", "Paketleme Güveni", "Kırılganlık Riski"],
      coreConcern: "görsel beklenti, paketleme ve kırılganlık",
      categoryUseCase: "hediye veya günlük aksesuar kullanımı",
      returnReasons: [
        { label: "Kırık / hasarlı geldi", percent: 36 },
        { label: "Görseldeki gibi durmadı", percent: 24 },
        { label: "Paketleme beklentimi karşılamadı", percent: 18 },
        { label: "Boyut beklediğimden farklı", percent: 12 },
        { label: "Diğer", percent: 10 },
      ],
      scenarios: [
        { scenario: "Hediye olarak alsaydın", score: 68 },
        { scenario: "Günlük kullanım için alsaydın", score: 72 },
        { scenario: "Premium görünüm bekleseydin", score: 55 },
      ],
    };
  }

  if (category.includes("bebek")) {
    return {
      fitFocus: ["Kurulum Kolaylığı", "Güven / Destek", "Bağlantı Kararlılığı"],
      coreConcern: "kurulum, güvenlik ve destek beklentisi",
      categoryUseCase: "bebek takibi ve ev içi güvenli kullanım",
      returnReasons: [
        { label: "Kurulum beklediğimden zor", percent: 31 },
        { label: "Bağlantı kararsız çalışıyor", percent: 24 },
        { label: "Uygulama / destek bilgisi yetersiz", percent: 18 },
        { label: "Görüntü veya ses beklentisi karşılanmadı", percent: 17 },
        { label: "Diğer", percent: 10 },
      ],
      scenarios: [
        { scenario: "Kısa süreli oda takibi için alsaydın", score: 75 },
        { scenario: "Kesintisiz gece takibi için alsaydın", score: 57 },
        { scenario: "Teknik destek öncelikli alsaydın", score: 61 },
      ],
    };
  }

  return {
    fitFocus: ["Kullanım Amacı", "Fiyat / Değer", "İade Riski"],
    coreConcern: "beklenti, fiyat ve iade riski",
    categoryUseCase: "günlük kullanım",
    returnReasons: [
      { label: "Beklentimi karşılamadı", percent: 30 },
      { label: "Fiyatına göre zayıf kaldı", percent: 24 },
      { label: "Ürün açıklaması yeterince net değildi", percent: 20 },
      { label: "Kargo / paketleme sorunu", percent: 14 },
      { label: "Diğer", percent: 12 },
    ],
    scenarios: [
      { scenario: "Günlük kullanım için alsaydın", score: 70 },
      { scenario: "Yoğun kullanım için alsaydın", score: 57 },
      { scenario: "Hediye olarak alsaydın", score: 66 },
    ],
  };
}

function buildAgentSteps(product: Product, profile: AnalysisProfile, risk: number): AgentStep[] {
  const reviewCount = product.reviewCount.toLocaleString("tr-TR");

  return [
    {
      id: "need-agent",
      label: "İhtiyaç Anlama Ajanı",
      description: "Kullanıcının serbest metin ihtiyacını yapılandırır.",
      status: "pending",
      summary: `Kullanım senaryosundan ${profile.coreConcern} öncelikleri çıkarıldı.`,
      durationMs: 650,
      type: "need",
    },
    {
      id: "product-agent",
      label: "Ürün Gerçekliği Ajanı",
      description: "Ürün açıklaması ve teknik iddiaları inceler.",
      status: "pending",
      summary: `${product.title} için teknik özellikler ve açıklama tutarlılığı kontrol edildi.`,
      durationMs: 700,
      type: "product",
    },
    {
      id: "review-agent",
      label: "Yorum Madenciliği Ajanı",
      description: "Yorumları risk başlıklarına ve şüpheli örüntülere ayırır.",
      status: "pending",
      summary: `${reviewCount} yorum tarandı, ${profile.coreConcern} başlıklarında sinyaller çıkarıldı.`,
      durationMs: 850,
      type: "review",
    },
    {
      id: "visual-agent",
      label: "Görsel Forensik Ajanı",
      description: "Ürün görsellerini tutarlılık ve beklenti yönetimi açısından inceler.",
      status: "pending",
      summary: "Ürün görselleri açıklama ve kullanıcı beklentisiyle karşılaştırıldı.",
      durationMs: 650,
      type: "visual",
    },
    {
      id: "price-agent",
      label: "Fiyat Pazar Ajanı",
      description: "Fiyat geçmişi ve pazar medyanı karşılaştırmasını yapar.",
      status: "pending",
      summary: `${formatPrice(product.price)} fiyatı kategori referanslarıyla karşılaştırıldı.`,
      durationMs: 700,
      type: "price",
    },
    {
      id: "return-agent",
      label: "İade Riski Ajanı",
      description: "Geçmiş iade sebeplerini kullanıcının ihtiyacıyla eşleştirir.",
      status: "pending",
      summary: `İade sebeplerinin ${profile.returnReasons[0].percent}%'lik ana kümesi kullanıcı senaryosuyla eşleştirildi.`,
      durationMs: 650,
      type: "return",
    },
    {
      id: "synthesis-agent",
      label: "Risk Sentezi Ajanı",
      description: "Tüm ajan çıktılarından dört eksenli karar skoru üretir.",
      status: "pending",
      summary: `Genel pişmanlık riski %${risk} olarak hesaplandı.`,
      durationMs: 700,
      type: "synthesis",
    },
    {
      id: "verification-agent",
      label: "Doğrulama Ajanı",
      description: "Rapor iddialarını kanıt zinciriyle kontrol eder.",
      status: "pending",
      summary: "Kanıtsız iddialar rapordan çıkarıldı.",
      durationMs: 600,
      type: "verification",
    },
    {
      id: "report-agent",
      label: "Karar Raporu",
      description: "Kişisel karar raporunu kullanıcıya sunar.",
      status: "pending",
      summary: "Kanıta dayalı kişisel karar raporu hazırlandı.",
      durationMs: 500,
      type: "report",
    },
  ];
}

function buildBuyerAnalysis(
  analysisId: string,
  product: Product,
  userNeedText = defaultNeed,
): BuyerAnalysis {
  const profile = getProfile(product);
  const pricePenalty = product.originalPrice && product.price > product.originalPrice * 0.85 ? 10 : 0;
  const ratingPenalty = Math.max(0, Math.round((4.6 - product.rating) * 12));
  const returnRisk = clampScore(profile.returnReasons[0].percent + ratingPenalty + pricePenalty);
  const fitScore = clampScore(78 - returnRisk * 0.42 + product.rating * 2);
  const trustScore = clampScore(48 + product.rating * 8 - ratingPenalty);
  const priceScore = clampScore(product.discountPercent ? 54 + product.discountPercent * 0.5 - pricePenalty : 52 - pricePenalty);
  const overallRiskPercent = clampScore(100 - (fitScore + trustScore + priceScore) / 3 + returnRisk * 0.35);
  const recommendationLevel = getRecommendationLevel(overallRiskPercent);
  const medianPrice = Math.round(product.price * 0.82);
  const fairLow = Math.round(medianPrice * 0.92);
  const fairHigh = Math.round(medianPrice * 1.08);
  const alternativeProducts = products
    .filter((item) => item.id !== product.id)
    .slice(0, 3)
    .map((item, index) => ({
      title: item.title,
      fitScore: clampScore(82 - index * 5),
      price: formatPrice(item.price),
    }));

  const recommendationText =
    recommendationLevel === "safe"
      ? `${product.title} senin senaryon için genel olarak makul görünüyor; yine de fiyat ve iade sinyallerini kontrol ederek ilerle.`
      : recommendationLevel === "risky"
        ? `${product.title} senin senaryon için yüksek pişmanlık riski taşıyor. En kritik başlıklar ${profile.coreConcern}.`
        : `${product.title} için dikkatli ilerle. ${profile.coreConcern} tarafında satın almadan önce kontrol edilmesi gereken sinyaller var.`;

  return {
    analysisId,
    productId: product.id,
    userNeedText,
    overallRiskPercent,
    recommendationLevel,
    recommendationText,
    scores: {
      fitScore,
      trustScore,
      priceScore,
      returnRiskPercent: returnRisk,
    },
    agentSteps: buildAgentSteps(product, profile, overallRiskPercent),
    fitAnalysis: {
      title: "Bu ürün senin kullanım senaryona ne kadar uygun?",
      summary: `${profile.categoryUseCase} için ${profile.coreConcern} kritik. Zekai bu ürünü yazdığın ihtiyaçla eşleştirdi.`,
      subScores: profile.fitFocus.map((label, index) => ({
        label,
        score: clampScore(fitScore - index * 7 + (index === 0 ? 3 : 0)),
        reason:
          index === 0
            ? `${label} başlığında ürün açıklaması, yorumlar ve iade sinyalleri birlikte değerlendirildi.`
            : `${label} tarafında kararını etkileyebilecek karışık kullanıcı sinyalleri var.`,
      })),
      scenarioComparisons: profile.scenarios,
    },
    trustAnalysis: {
      title: "Bu satıcıya ve ürün listesine güvenebilir misin?",
      summary:
        "Satıcı, yorum kalitesi, görsel tutarlılık ve açıklama netliği birlikte değerlendirildi.",
      signals: [
        {
          title: "Yorum forensiği",
          value: `${product.reviewCount.toLocaleString("tr-TR")} yorum`,
          description:
            "Yorum hacmi ve tekrar eden şikayet kümeleri nihai skorda ayrı ağırlıklarla ele alındı.",
          tone: product.rating >= 4.5 ? "success" : "warning",
        },
        {
          title: "Görsel tutarlılık",
          value: `${product.thumbnails.length} görsel`,
          description:
            "Ürün görselleri açıklamadaki kullanım vaadiyle karşılaştırıldı.",
          tone: "warning",
        },
        {
          title: "Satıcı geçmişi",
          value: product.sellerName,
          description:
            "Satıcı güven skoru ve iade sinyalleri kategori ortalamasıyla birlikte yorumlandı.",
          tone: "warning",
        },
        {
          title: "Açıklama netliği",
          value: "Kontrol edildi",
          description:
            "Kararı etkileyen özelliklerin ürün sayfasında ne kadar açık anlatıldığı incelendi.",
          tone: "warning",
        },
      ],
    },
    priceAnalysis: {
      title: "Bu fiyat adil mi?",
      summary:
        "Ürünün fiyatı, görünen indirim ve pazar referans aralığıyla karşılaştırıldı.",
      warning: product.originalPrice
        ? `Ürün indirimli görünüyor; önceki fiyat ${formatPrice(product.originalPrice)}, mevcut fiyat ${formatPrice(product.price)}.`
        : "Bu ürün için fiyat avantajı net bir eski fiyatla desteklenmiyor.",
      marketComparison: [
        { label: "Bu satıcı", value: formatPrice(product.price) },
        { label: "Pazar medyanı", value: formatPrice(medianPrice) },
        { label: "Adil fiyat aralığı", value: `${formatPrice(fairLow)} - ${formatPrice(fairHigh)}` },
      ],
      priceHistory: [
        { day: "G-30", price: product.price, median: medianPrice },
        { day: "G-21", price: product.price, median: Math.round(medianPrice * 1.01) },
        { day: "G-14", price: product.originalPrice ?? Math.round(product.price * 1.12), median: Math.round(medianPrice * 1.02) },
        { day: "G-7", price: product.price, median: medianPrice },
        { day: "Bugün", price: product.price, median: medianPrice },
      ],
    },
    returnRiskAnalysis: {
      title: "Bu ürünü iade etme olasılığın ne kadar?",
      summary:
        "İade riski, ürünün kategori sinyalleri ve yazdığın kullanım senaryosuyla birlikte hesaplandı.",
      reasons: profile.returnReasons,
      personalWarning:
        `Senin ihtiyacın ${profile.coreConcern} ile kesişiyor. Bu yüzden iade sebeplerindeki ilk iki başlık raporda yüksek ağırlık aldı.`,
    },
    finalAdvice:
      recommendationLevel === "safe"
        ? "Bu ürünü kontrollü şekilde değerlendirebilirsin. Fiyat ve iade koşullarını son kez kontrol ederek ilerlemek mantıklı."
        : "Bu ürünü mevcut haliyle hemen almanı önermiyorum. Kanıtları inceleyip alternatiflerle karşılaştırman daha mantıklı.",
    alternatives: alternativeProducts,
  };
}

export const demoBuyerAnalysis = buildBuyerAnalysis(
  "demo-analysis-1",
  getProductById("bluetooth-kulaklik-pro-x1") ?? products[0],
  "Online ders ve oyun için bluetooth kulaklık arıyorum. Mikrofon iyi olsun, kulağımı acıtmasın, 1500 TL'yi geçmesin.",
);

export function getBuyerAnalysisById(analysisId: string, userNeedText?: string) {
  if (analysisId === demoBuyerAnalysis.analysisId) {
    return userNeedText
      ? buildBuyerAnalysis(analysisId, getProductById(demoBuyerAnalysis.productId) ?? products[0], userNeedText)
      : demoBuyerAnalysis;
  }

  const productId = analysisId.replace(/^analysis-/, "");
  const product = getProductById(productId);

  if (!product) {
    return undefined;
  }

  return buildBuyerAnalysis(analysisId, product, userNeedText || defaultNeed);
}

export function getBuyerAnalysis(product: Product, userNeedText?: string) {
  const id = `analysis-${product.id}`;
  return buildBuyerAnalysis(id, product, userNeedText || defaultNeed);
}
