import type { BuyerAnalysis } from "@/types/analysis";

export const demoBuyerAnalysis: BuyerAnalysis = {
  analysisId: "demo-analysis-1",
  productId: "bluetooth-kulaklik-pro-x1",
  userNeedText:
    "Online ders ve oyun için bluetooth kulaklık arıyorum. Mikrofon iyi olsun, kulağımı acıtmasın, 1500 TL’yi geçmesin.",
  overallRiskPercent: 62,
  recommendationLevel: "caution",
  recommendationText:
    "Bu ürün senin kullanım senaryona tam uymuyor. Özellikle mikrofon, oyun gecikmesi ve fiyat tarafında kontrol etmen gereken riskler var.",
  scores: {
    fitScore: 54,
    trustScore: 41,
    priceScore: 35,
    returnRiskPercent: 32,
  },
  agentSteps: [
    {
      id: "need-agent",
      label: "İhtiyaç Anlama Ajanı",
      description: "Kullanıcının serbest metin ihtiyacını yapılandırır.",
      status: "pending",
      summary:
        "Kullanıcı ihtiyacından mikrofon, düşük gecikme ve uzun kullanım konforu öncelikleri çıkarıldı.",
      durationMs: 800,
      type: "need",
    },
    {
      id: "product-agent",
      label: "Ürün Gerçekliği Ajanı",
      description: "Ürün açıklaması ve teknik iddiaları inceler.",
      status: "pending",
      summary:
        "Ürün açıklamasında mikrofon kalitesi ve gecikme bilgisi belirsiz kaldı.",
      durationMs: 900,
      type: "product",
    },
    {
      id: "review-agent",
      label: "Yorum Madenciliği Ajanı",
      description: "Yorumları risk başlıklarına ve şüpheli örüntülere ayırır.",
      status: "pending",
      summary:
        "142 yorum tarandı, mikrofon ve gecikme şikayetleri öne çıktı.",
      durationMs: 1000,
      type: "review",
    },
    {
      id: "visual-agent",
      label: "Görsel Forensik Ajanı",
      description: "Ürün görsellerini tutarlılık ve stok fotoğraf açısından inceler.",
      status: "pending",
      summary: "2 ürün görselinde stok fotoğraf kullanım ihtimali işaretlendi.",
      durationMs: 900,
      type: "visual",
    },
    {
      id: "price-agent",
      label: "Fiyat Pazar Ajanı",
      description: "Fiyat geçmişi ve pazar medyanı karşılaştırmasını yapar.",
      status: "pending",
      summary: "Fiyatın pazar medyanının üzerinde olduğu tespit edildi.",
      durationMs: 900,
      type: "price",
    },
    {
      id: "return-agent",
      label: "İade Riski Ajanı",
      description: "Geçmiş iade sebeplerini kullanıcının ihtiyacıyla eşleştirir.",
      status: "pending",
      summary:
        "İade sebeplerinin önemli kısmının mikrofon ve oyun gecikmesiyle ilişkili olduğu görüldü.",
      durationMs: 800,
      type: "return",
    },
    {
      id: "synthesis-agent",
      label: "Risk Sentezi Ajanı",
      description: "Tüm ajan çıktılarından dört eksenli karar skoru üretir.",
      status: "pending",
      summary: "Genel pişmanlık riski %62 olarak hesaplandı.",
      durationMs: 850,
      type: "synthesis",
    },
    {
      id: "verification-agent",
      label: "Doğrulama Ajanı",
      description: "Rapor iddialarını kanıt zinciriyle kontrol eder.",
      status: "pending",
      summary: "Kanıtsız iddialar rapordan çıkarıldı.",
      durationMs: 750,
      type: "verification",
    },
    {
      id: "report-agent",
      label: "Karar Raporu",
      description: "Kişisel karar raporunu kullanıcıya sunar.",
      status: "pending",
      summary: "Dört eksenli karar raporu hazırlandı.",
      durationMs: 600,
      type: "report",
    },
  ],
  fitAnalysis: {
    title: "Bu ürün senin kullanım senaryona ne kadar uygun?",
    summary:
      "Online ders ve oyun için mikrofon, düşük gecikme ve uzun kullanım konforu kritik. Bu ürün bu üç başlıkta karışık sinyal veriyor.",
    subScores: [
      {
        label: "Mikrofon Kalitesi",
        score: 38,
        reason:
          "Yorumlarda mikrofonun karşı tarafa net gitmediği ve toplantılarda sorun çıkardığı tekrar ediyor.",
      },
      {
        label: "Oyun / Düşük Gecikme",
        score: 47,
        reason:
          "Ürün açıklamasında düşük gecikme modu belirtilmemiş; bazı yorumlarda oyun sırasında gecikme şikayeti var.",
      },
      {
        label: "Uzun Kullanım Konforu",
        score: 61,
        reason:
          "Konfor yorumları karışık. Kısa kullanımda olumlu, uzun kullanımda kulak ağrısı şikayetleri var.",
      },
    ],
    scenarioComparisons: [
      { scenario: "Müzik dinlemek için alsaydın", score: 78 },
      { scenario: "İş toplantıları için alsaydın", score: 49 },
      { scenario: "Podcast / sesli kitap için alsaydın", score: 82 },
    ],
  },
  trustAnalysis: {
    title: "Bu satıcıya ve ürün listesine güvenebilir misin?",
    summary:
      "Satıcı ve listeleme tarafında güveni zayıflatan birkaç sinyal var. En kritik başlık yorum kalitesi.",
    signals: [
      {
        title: "Yorum forensiği",
        value: "142 yorum, 32 şüpheli",
        description:
          "Kısa ve birbirine benzeyen yorum kümeleri bulundu. Bu yorumlar nihai skorda düşük ağırlıkla ele alındı.",
        tone: "danger",
      },
      {
        title: "Görsel forensik",
        value: "2 görsel riskli",
        description:
          "Ürün görsellerinden ikisi stok fotoğraf olabilir. Müşteri fotoğraflarıyla tam tutarlılık yok.",
        tone: "warning",
      },
      {
        title: "Satıcı geçmişi",
        value: "6 aylık mağaza",
        description:
          "Satıcı yeni sayılır ve iade oranı kategori ortalamasının üzerinde görünüyor.",
        tone: "warning",
      },
      {
        title: "Açıklama tutarlılığı",
        value: "Kritik bilgi eksik",
        description:
          "Mikrofon, gecikme ve garanti detayı gibi karar etkileyen alanlar net değil.",
        tone: "warning",
      },
    ],
  },
  priceAnalysis: {
    title: "Bu fiyat adil mi?",
    summary:
      "Ürün indirimli gösteriliyor ancak fiyat geçmişi ve pazar karşılaştırması fiyat riskini yükseltiyor.",
    warning:
      "Satıcı %30 indirim gösteriyor ancak fiyat geçmişi bu indirimin yapay olabileceğini gösteriyor.",
    marketComparison: [
      { label: "Bu satıcı", value: "1.015 TL" },
      { label: "Pazar medyanı", value: "720 TL" },
      { label: "Adil fiyat aralığı", value: "680–780 TL" },
    ],
    priceHistory: [
      { day: "G-30", price: 1015, median: 720 },
      { day: "G-21", price: 1015, median: 725 },
      { day: "G-14", price: 1450, median: 730 },
      { day: "G-7", price: 1015, median: 720 },
      { day: "Bugün", price: 1015, median: 720 },
    ],
  },
  returnRiskAnalysis: {
    title: "Bu ürünü iade etme olasılığın ne kadar?",
    summary:
      "Bu ürün için iade riski ortalamanın üzerinde. Risk, kullanıcının mikrofon ve oyun öncelikleriyle doğrudan kesişiyor.",
    reasons: [
      { label: "Mikrofon beklediğim gibi değildi", percent: 38 },
      { label: "Kulak ağrıttı", percent: 22 },
      { label: "Oyun gecikmesi fazla", percent: 18 },
      { label: "Kargo hasarı", percent: 12 },
      { label: "Diğer", percent: 10 },
    ],
    personalWarning:
      "Sen mikrofon ve oyun öncelikli olduğunu söyledin. İade sebeplerinin önemli kısmı tam bu alanlarla ilgili.",
  },
  finalAdvice:
    "Bu ürünü mevcut haliyle almanı önermiyorum. Senin senaryon için daha güvenli alternatiflere bakman daha mantıklı.",
  alternatives: [
    { title: "Düşük gecikmeli oyuncu kulaklığı", fitScore: 82, price: "1.290 TL" },
    { title: "Toplantı odaklı mikrofonlu kulaklık", fitScore: 79, price: "1.180 TL" },
    { title: "Hafif günlük bluetooth kulaklık", fitScore: 74, price: "890 TL" },
  ],
};

export function getBuyerAnalysisById(analysisId: string) {
  if (analysisId !== demoBuyerAnalysis.analysisId) {
    return undefined;
  }

  return demoBuyerAnalysis;
}
