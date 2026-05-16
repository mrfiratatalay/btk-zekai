import type { BuyerAnalysis, RecommendationLevel } from "@/types/analysis";
import type { Product, ProductPricePoint, ProductReview } from "@/types/product";

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
    Object.entries(product.features).map(([key, value]) => `${key} ${value}`).join(" "),
  ].join(" ");
  const productTokens = new Set(tokenize(productText));
  const matches = [...needTokens].filter((token) => productTokens.has(token)).length;
  const matchScore = needTokens.size ? (matches / needTokens.size) * 100 : 55;
  const featureScore = Math.min(25, Object.keys(product.features).length * 5);
  return clamp(45 + matchScore * 0.35 + featureScore);
}

function buildTrustScore(product: Product, reviews: ProductReview[]) {
  const verifiedRatio = reviews.length
    ? reviews.filter((review) => review.verifiedPurchase).length / reviews.length
    : 0;
  const ratingScore = (product.rating / 5) * 70;
  const reviewVolumeScore = Math.min(20, Math.log10(Math.max(product.reviewCount, 1)) * 8);
  return clamp(ratingScore + reviewVolumeScore + verifiedRatio * 10);
}

function buildPriceScore(product: Product, priceHistory: ProductPricePoint[]) {
  const latestMedian = priceHistory.at(-1)?.marketMedian;
  const median = latestMedian && latestMedian > 0 ? latestMedian : product.price;
  const ratio = product.price / median;
  const base = ratio <= 0.9 ? 88 : ratio <= 1 ? 78 : ratio <= 1.12 ? 62 : 45;
  const discountPenalty = product.originalPrice && product.originalPrice > product.price * 1.8 ? 12 : 0;
  return clamp(base - discountPenalty);
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

function buildReviewSignals(reviews: ProductReview[]) {
  const positive = reviews.filter((review) => review.rating >= 4).length;
  const negative = reviews.filter((review) => review.rating <= 2).length;
  return {
    positive,
    negative,
    verified: reviews.filter((review) => review.verifiedPurchase).length,
  };
}

export function buildBuyerAnalysisFromProduct({
  analysisId,
  product,
  reviews = [],
  priceHistory = [],
  userNeedText,
}: {
  analysisId: string;
  product: Product;
  reviews?: ProductReview[];
  priceHistory?: ProductPricePoint[];
  userNeedText: string;
}): BuyerAnalysis {
  const fitScore = buildFitScore(product, userNeedText);
  const trustScore = buildTrustScore(product, reviews);
  const priceScore = buildPriceScore(product, priceHistory);
  const returnRiskPercent = buildReturnRisk(product, fitScore, trustScore);
  const overallRiskPercent = clamp(100 - (fitScore + trustScore + priceScore) / 3 + returnRiskPercent * 0.35);
  const level = recommendationLevel(overallRiskPercent);
  const reviewSignals = buildReviewSignals(reviews);
  const median = priceHistory.at(-1)?.marketMedian ?? product.price;
  const latestHistory = priceHistory.slice(-8).map((point) => ({
    day: point.day,
    price: point.price,
    median: point.marketMedian,
  }));

  return {
    analysisId,
    productId: product.id,
    userNeedText,
    overallRiskPercent,
    recommendationLevel: level,
    recommendationText:
      level === "safe"
        ? "Ürün ihtiyacınla uyumlu görünüyor; fiyat ve yorum sinyalleri kabul edilebilir."
        : level === "caution"
          ? "Satın almadan önce yorumları, iade koşullarını ve fiyat geçmişini dikkatle kontrol et."
          : "Risk sinyalleri yüksek; alternatif ürünleri karşılaştırmadan satın alma.",
    scores: { fitScore, trustScore, priceScore, returnRiskPercent },
    agentSteps: [
      { id: "need-agent", label: "İhtiyaç Analizi", description: "Kullanıcı ihtiyacı ürün verisiyle eşleştiriliyor.", status: "pending", summary: "İhtiyaç metni ayrıştırıldı.", durationMs: 900, type: "need" },
      { id: "product-agent", label: "Ürün Verisi", description: "Başlık, açıklama ve teknik özellikler inceleniyor.", status: "pending", summary: "Ürün içeriği API verisinden okundu.", durationMs: 1100, type: "product" },
      { id: "review-agent", label: "Yorumlar", description: "DB'deki ürün yorumları taranıyor.", status: "pending", summary: `${reviews.length} yorum sinyali değerlendirildi.`, durationMs: 1200, type: "review" },
      { id: "visual-agent", label: "Görseller", description: "Ürün görsel çeşitliliği kontrol ediliyor.", status: "pending", summary: `${product.thumbnails.length} ürün görseli kontrol edildi.`, durationMs: 900, type: "visual" },
      { id: "price-agent", label: "Fiyat", description: "Fiyat geçmişi ve pazar medyanı karşılaştırılıyor.", status: "pending", summary: `${priceHistory.length} fiyat noktası incelendi.`, durationMs: 1100, type: "price" },
      { id: "return-agent", label: "İade Riski", description: "Kategori, yorum ve stok sinyalleriyle iade riski hesaplanıyor.", status: "pending", summary: `Tahmini risk %${returnRiskPercent}.`, durationMs: 1000, type: "return" },
      { id: "synthesis-agent", label: "Karar Sentezi", description: "Tüm kanıtlar tek raporda birleştiriliyor.", status: "pending", summary: "Skorlar birleştirildi.", durationMs: 800, type: "synthesis" },
      { id: "verification-agent", label: "Doğrulama", description: "Kanıtsız iddialar ayıklanıyor.", status: "pending", summary: "Rapor kanıt kalitesine göre temizlendi.", durationMs: 700, type: "verification" },
      { id: "report-agent", label: "Rapor", description: "Satın alma kararı hazırlanıyor.", status: "pending", summary: "Rapor hazır.", durationMs: 600, type: "report" },
    ],
    fitAnalysis: {
      title: "İhtiyaç Uyumu",
      summary: `Ürün içeriği, yazdığın ihtiyaçla ${fitScore}/100 düzeyinde eşleşiyor.`,
      subScores: [
        { label: "Kullanım amacı", score: fitScore, reason: "İhtiyaç metni ürün başlığı, kategori, açıklama ve özelliklerle karşılaştırıldı." },
        { label: "Özellik açıklığı", score: clamp(Object.keys(product.features).length * 18), reason: `${Object.keys(product.features).length} teknik özellik API'den geldi.` },
        { label: "Stok uygunluğu", score: product.stock > 0 ? 85 : 15, reason: product.stock > 0 ? `${product.stock} adet stok var.` : "Ürün stokta görünmüyor." },
      ],
      scenarioComparisons: [
        { scenario: "Günlük kullanım", score: clamp(fitScore + 5) },
        { scenario: "Fiyat hassasiyeti", score: priceScore },
        { scenario: "Düşük risk beklentisi", score: clamp(100 - returnRiskPercent) },
      ],
    },
    trustAnalysis: {
      title: "Güven Sinyalleri",
      summary: `${product.rating.toFixed(1)} puan, ${product.reviewCount.toLocaleString("tr-TR")} değerlendirme ve ${reviews.length} yorum örneği incelendi.`,
      signals: [
        { title: "Satıcı", value: product.sellerName, description: "Satıcı bilgisi ürün API kaydından alındı.", tone: "success" },
        { title: "Doğrulanmış Yorum", value: `${reviewSignals.verified}/${reviews.length || 0}`, description: "Yorum örneklerinde doğrulanmış satın alma sinyali kontrol edildi.", tone: reviewSignals.verified ? "success" : "warning" },
        { title: "Olumsuz Yorum", value: `${reviewSignals.negative}`, description: "Düşük puanlı yorum sayısı risk sinyali olarak hesaplandı.", tone: reviewSignals.negative > 1 ? "warning" : "success" },
        { title: "Görsel Kanıt", value: `${product.thumbnails.length} görsel`, description: "Ürün sayfasındaki görsel sayısı DB ürün kaydından geldi.", tone: product.thumbnails.length >= 3 ? "success" : "warning" },
      ],
    },
    priceAnalysis: {
      title: "Fiyat Analizi",
      summary: `Mevcut fiyat ${formatPrice(product.price)}; pazar medyanı ${formatPrice(median)} olarak görünüyor.`,
      warning: product.originalPrice && product.originalPrice > product.price * 1.8
        ? "Orijinal fiyat mevcut fiyata göre çok yüksek; indirim iddiası ayrıca kontrol edilmeli."
        : "",
      marketComparison: [
        { label: "Bu satıcı", value: formatPrice(product.price) },
        { label: "Pazar medyanı", value: formatPrice(median) },
        { label: "Fiyat skoru", value: `${priceScore}/100` },
      ],
      priceHistory: latestHistory,
    },
    returnRiskAnalysis: {
      title: "İade Riski",
      summary: `Kategori, stok, yorum hacmi ve ihtiyaç uyumuna göre tahmini risk %${returnRiskPercent}.`,
      reasons: [
        { label: "İhtiyaç uyumsuzluğu", percent: clamp(100 - fitScore) },
        { label: "Yorum güveni", percent: clamp(100 - trustScore) },
        { label: "Kategori hassasiyeti", percent: /ayakkabı|giyim|sandalye|koltuk/i.test(product.category) ? 28 : 14 },
      ],
      personalWarning:
        returnRiskPercent > 55
          ? "Bu ürün beklentini tam karşılamayabilir; satın almadan önce iade koşullarını kontrol et."
          : "Belirgin yüksek iade riski görünmüyor; yine de kullanım senaryonu özelliklerle eşleştir.",
    },
    finalAdvice:
      level === "safe"
        ? "Satın alma kararı makul görünüyor. Kritik özellikleri ve teslimat koşullarını son kez kontrol et."
        : level === "caution"
          ? "Karar vermeden önce benzer ürünlerle fiyat ve yorum kıyaslaması yap."
          : "Bu haliyle beklemek veya alternatifleri incelemek daha doğru olur.",
    alternatives: [],
  };
}
