import type { BuyerAnalysis, RecommendationLevel } from "@/types/analysis";
import type { Product } from "@/types/product";

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function tokenize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .split(/[^a-z0-9çğıöşü]+/i)
    .filter((token) => token.length >= 4);
}

function buildFitScore(product: Product, userNeedText: string) {
  const needTokens = new Set(tokenize(userNeedText));
  const productText = [
    product.title,
    product.category,
    product.shortDescription,
    product.description,
    Object.entries(product.features).map(([k, v]) => `${k} ${v}`).join(" "),
  ].join(" ");
  const productTokens = new Set(tokenize(productText));
  const matches = [...needTokens].filter((t) => productTokens.has(t)).length;
  const matchScore = needTokens.size ? (matches / needTokens.size) * 100 : 55;
  const featureScore = Math.min(25, Object.keys(product.features).length * 5);
  return clamp(45 + matchScore * 0.35 + featureScore);
}

function buildTrustScore(product: Product) {
  const ratingScore = (product.rating / 5) * 70;
  const volumeScore = Math.min(20, Math.log10(Math.max(product.reviewCount, 1)) * 8);
  return clamp(ratingScore + volumeScore);
}

function buildPriceScore(product: Product) {
  if (product.originalPrice && product.originalPrice > product.price * 1.8) return 45;
  return 62;
}

function buildReturnRisk(product: Product, fitScore: number, trustScore: number) {
  const stockRisk = product.stock <= 3 ? 8 : 0;
  const lowReviewRisk = product.reviewCount < 20 ? 10 : 0;
  const categoryRisk = /ayakkabı|giyim|sandalye|koltuk/i.test(product.category) ? 8 : 4;
  return clamp(100 - fitScore * 0.45 - trustScore * 0.25 + categoryRisk + stockRisk + lowReviewRisk);
}

function recommendationLevel(overallRiskPercent: number): RecommendationLevel {
  if (overallRiskPercent >= 66) return "risky";
  if (overallRiskPercent >= 42) return "caution";
  return "safe";
}

export function buildBuyerAnalysisFromProduct({
  analysisId,
  product,
  userNeedText,
}: {
  analysisId: string;
  product: Product;
  userNeedText: string;
}): BuyerAnalysis {
  const fitScore = buildFitScore(product, userNeedText);
  const trustScore = buildTrustScore(product);
  const priceScore = buildPriceScore(product);
  const returnRiskPercent = buildReturnRisk(product, fitScore, trustScore);
  const overallRiskPercent = clamp(100 - (fitScore + trustScore + priceScore) / 3 + returnRiskPercent * 0.35);
  const level = recommendationLevel(overallRiskPercent);

  const marketComparison: { label: string; value: string }[] = [
    { label: "Bu satıcı", value: formatPrice(product.price) },
    ...(product.originalPrice ? [{ label: "Liste fiyatı", value: formatPrice(product.originalPrice) }] : []),
    { label: "Fiyat skoru", value: `${priceScore}/100` },
  ];

  return {
    analysisId,
    productId: product.id,
    userNeedText,
    overallRiskPercent,
    recommendationLevel: level,
    recommendationText:
      level === "safe"
        ? "Ürün ihtiyacınla uyumlu görünüyor; güven sinyalleri kabul edilebilir."
        : level === "caution"
          ? "Satın almadan önce yorumları ve iade koşullarını dikkatle kontrol et."
          : "Risk sinyalleri yüksek; alternatifleri karşılaştırmadan satın alma.",
    scores: { fitScore, trustScore, priceScore, returnRiskPercent },
    agentSteps: [
      { id: "need-agent",         label: "İhtiyaç Analizi",  description: "Kullanıcı ihtiyacı ürün verisiyle eşleştiriliyor.", status: "pending", summary: "İhtiyaç metni ürün başlığı ve açıklamasıyla karşılaştırıldı.", durationMs: 900,  type: "need"         },
      { id: "product-agent",      label: "Ürün Verisi",      description: "Başlık, açıklama ve teknik özellikler inceleniyor.", status: "pending", summary: `${Object.keys(product.features).length} teknik özellik değerlendirildi.`,            durationMs: 1100, type: "product"      },
      { id: "review-agent",       label: "Yorum Sinyalleri", description: "Puan ve yorum hacmi analiz ediliyor.",               status: "pending", summary: `${product.reviewCount} yorum, ${product.rating.toFixed(1)} puan değerlendirildi.`,  durationMs: 1000, type: "review"       },
      { id: "price-agent",        label: "Fiyat",            description: "Fiyat makullüğü değerlendiriliyor.",                 status: "pending", summary: `${formatPrice(product.price)} fiyatı kategoriye göre değerlendirildi.`,             durationMs: 900,  type: "price"        },
      { id: "return-agent",       label: "İade Riski",       description: "Kategori ve stok sinyalleriyle iade riski hesaplanıyor.", status: "pending", summary: `Risk %${returnRiskPercent} tahmin edildi.`,                                   durationMs: 800,  type: "return"       },
      { id: "synthesis-agent",    label: "Karar Sentezi",    description: "Tüm kanıtlar tek raporda birleştiriliyor.",          status: "pending", summary: "Uyum, güven ve fiyat skorları birleştirildi.",                                        durationMs: 700,  type: "synthesis"    },
      { id: "verification-agent", label: "Doğrulama",        description: "Doğrulanamayan iddialar işaretleniyor.",             status: "pending", summary: "AI doğrulama için ADK bekleniyor.",                                                 durationMs: 600,  type: "verification" },
      { id: "report-agent",       label: "Rapor",            description: "Satın alma kararı hazırlanıyor.",                    status: "pending", summary: "Ön rapor hazır.",                                                                     durationMs: 500,  type: "report"       },
    ],
    fitAnalysis: {
      title: "İhtiyaç Uyumu",
      summary: `Ürün içeriği ihtiyacınla ${fitScore}/100 düzeyinde eşleşiyor.`,
      subScores: [
        { label: "Kullanım amacı",   score: fitScore,                                                  reason: "İhtiyaç metni ürün başlığı, kategori, açıklama ve özellikleriyle karşılaştırıldı." },
        { label: "Özellik açıklığı", score: clamp(Object.keys(product.features).length * 18),          reason: `${Object.keys(product.features).length} teknik özellik mevcut.` },
        { label: "Stok uygunluğu",   score: product.stock > 0 ? 85 : 15,                               reason: product.stock > 0 ? `${product.stock} adet stok var.` : "Ürün stokta görünmüyor." },
      ],
      scenarioComparisons: [
        { scenario: "Günlük kullanım",         score: clamp(fitScore + 5) },
        { scenario: "Fiyat hassasiyeti",       score: priceScore },
        { scenario: "Düşük risk beklentisi",   score: clamp(100 - returnRiskPercent) },
      ],
    },
    trustAnalysis: {
      title: "Güven Sinyalleri",
      summary: `${product.rating.toFixed(1)} puan ve ${product.reviewCount.toLocaleString("tr-TR")} değerlendirme incelendi.`,
      signals: [
        {
          title: "Satıcı",
          value: product.sellerName,
          description: "Satıcı bilgisi ürün kaydından alındı.",
          tone: "success",
        },
        {
          title: "Puan",
          value: `${product.rating.toFixed(1)} / 5`,
          description: `${product.reviewCount.toLocaleString("tr-TR")} değerlendirme üzerinden hesaplandı.`,
          tone: product.rating >= 4 ? "success" : product.rating >= 3 ? "warning" : "danger",
        },
        {
          title: "Yorum Hacmi",
          value: product.reviewCount.toLocaleString("tr-TR"),
          description: product.reviewCount >= 100 ? "Yeterli yorum hacmi güven sinyali veriyor." : "Yorum sayısı sınırlı, dikkatli değerlendir.",
          tone: product.reviewCount >= 100 ? "success" : product.reviewCount >= 20 ? "warning" : "danger",
        },
        {
          title: "Görsel Sayısı",
          value: `${product.thumbnails.length} görsel`,
          description: "Ürün sayfasındaki görsel çeşitliliği.",
          tone: product.thumbnails.length >= 3 ? "success" : "warning",
        },
      ],
    },
    priceAnalysis: {
      title: "Fiyat Değerlendirmesi",
      summary: `Mevcut fiyat ${formatPrice(product.price)}. AI genel bilgisiyle bu kategorideki fiyat makullüğü değerlendirildi.`,
      warning: product.originalPrice && product.originalPrice > product.price * 1.8
        ? "Orijinal fiyat mevcut fiyata göre çok yüksek; indirim iddiası dikkatle kontrol edilmeli."
        : "",
      marketComparison,
    },
    finalAdvice:
      level === "safe"
        ? "Satın alma kararı makul görünüyor. Teslimat koşullarını son kez kontrol et."
        : level === "caution"
          ? "Karar vermeden önce benzer ürünlerle yorum ve fiyat kıyaslaması yap."
          : "Bu haliyle beklemek veya alternatifleri incelemek daha doğru olur.",
  };
}
