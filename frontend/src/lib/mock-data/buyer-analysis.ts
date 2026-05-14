import type { BuyerAnalysis } from "@/types/analysis";
import { formatPrice, getProductById, products } from "@/lib/mock-data/products";

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

const defaultNeedByCategory: Record<string, string> = {
  Elektronik: "Günlük kullanım için alacağım. Performans, garanti ve fiyat dengesi önemli.",
  "Ev & Yasam": "Evde uzun süre kullanmak istiyorum. Dayanıklı, rahat ve fiyatına değen bir ürün olmalı.",
  "Anne & Bebek": "Bebeğim için güvenli, sorunsuz ve kullanımı kolay bir ürün arıyorum.",
  Spor: "Günlük yürüyüş ve hafif antrenman için kullanacağım. Rahatlık, kalıp ve dayanıklılık önemli.",
  "Spor & Outdoor": "Günlük yürüyüş ve hafif antrenman için kullanacağım. Rahatlık, kalıp ve dayanıklılık önemli.",
  Mutfak: "Mutfakta sık kullanacağım. Güçlü, pratik temizlenen ve uzun ömürlü bir ürün istiyorum.",
  Aksesuar: "Hediye veya özel gün için alacağım. Göründüğü gibi gelmesi ve sağlam paketlenmesi önemli.",
};

function normalizeAnalysisProductId(analysisId: string) {
  return analysisId.replace(/^analysis-/, "");
}

function getCategoryFit(productId: string, category: string) {
  if (productId === "spor-ayakkabi-runflex") {
    return {
      subScores: [
        {
          label: "Kalıp / numara uyumu",
          score: 58,
          reason:
            "Yorumlarda standart kalıp dense de bazı kullanıcılar yarım numara büyük alınmasını önermiş. Numara hassasiyetin varsa risk orta seviyede.",
        },
        {
          label: "Uzun yürüyüş konforu",
          score: 64,
          reason:
            "Hafif taban olumlu ancak uzun kullanımda taban desteğinin sınırlı kaldığını söyleyen yorumlar var.",
        },
        {
          label: "Dayanıklılık",
          score: 57,
          reason:
            "Günlük kullanım için uygun görünüyor fakat yoğun antrenman ve yağmurlu zemin için güçlü kanıt yok.",
        },
      ],
      scenarios: [
        { scenario: "Günlük yürüyüş için alsaydın", score: 74 },
        { scenario: "Koşu antrenmanı için alsaydın", score: 51 },
        { scenario: "Okul/şehir kullanımı için alsaydın", score: 79 },
      ],
      returnReasons: [
        { label: "Numara / kalıp uymadı", percent: 34 },
        { label: "Uzun kullanımda rahatsız etti", percent: 24 },
        { label: "Beklediğim kadar dayanıklı değil", percent: 18 },
        { label: "Renk fotoğraftan farklı", percent: 12 },
        { label: "Diğer", percent: 12 },
      ],
      concern:
        "Sen rahatlık ve kalıp beklentisiyle bakıyorsan, iade sebeplerinin önemli kısmı tam bu alanlarla ilgili.",
    };
  }

  if (category === "Ev & Yasam") {
    return {
      subScores: [
        {
          label: "Kullanım konforu",
          score: 68,
          reason:
            "Ürün açıklaması temel özellikleri veriyor, fakat uzun süreli kullanım deneyimi yorumlarda karışık.",
        },
        {
          label: "Malzeme / dayanıklılık",
          score: 61,
          reason:
            "Malzeme bilgisi var ancak parça kalitesi ve uzun ömür konusunda yeterince güçlü kanıt yok.",
        },
        {
          label: "Kurulum / pratiklik",
          score: 56,
          reason:
            "Kurulum ve kullanım detayları açıklamada sınırlı olduğu için beklenti uyuşmazlığı riski var.",
        },
      ],
      scenarios: [
        { scenario: "Günlük ev kullanımı için alsaydın", score: 72 },
        { scenario: "Yoğun profesyonel kullanım için alsaydın", score: 48 },
        { scenario: "Hediye olarak alsaydın", score: 66 },
      ],
      returnReasons: [
        { label: "Beklediğim kadar rahat değil", percent: 29 },
        { label: "Malzeme kalitesi zayıf geldi", percent: 24 },
        { label: "Kurulum zorladı", percent: 18 },
        { label: "Ölçü beklentimle uyuşmadı", percent: 16 },
        { label: "Diğer", percent: 13 },
      ],
      concern:
        "İade sebepleri çoğunlukla konfor, ölçü ve malzeme beklentisiyle ilişkili. Ürün ölçülerini ve yorumları kontrol etmeden karar verme.",
    };
  }

  return {
    subScores: [
      {
        label: "Beklenti uyumu",
        score: 63,
        reason:
          "Ürün temel ihtiyacı karşılıyor gibi görünse de açıklamada karar vermeyi etkileyen bazı detaylar eksik.",
      },
      {
        label: "Kalite sinyali",
        score: 59,
        reason:
          "Yorumlar genel olarak olumlu fakat detaylı deneyim içeren yorum sayısı sınırlı.",
      },
      {
        label: "Fiyat / değer dengesi",
        score: 55,
        reason:
          "Benzer ürünlere göre fiyat avantajı net değil; indirim ve pazar karşılaştırması kontrol edilmeli.",
      },
    ],
    scenarios: [
      { scenario: "Günlük kullanım için alsaydın", score: 70 },
      { scenario: "Yoğun kullanım için alsaydın", score: 52 },
      { scenario: "Hediye olarak alsaydın", score: 64 },
    ],
    returnReasons: [
      { label: "Beklediğim gibi çıkmadı", percent: 31 },
      { label: "Kalite beklentimi karşılamadı", percent: 25 },
      { label: "Fiyatına değmedi", percent: 18 },
      { label: "Kargo / paketleme sorunu", percent: 14 },
      { label: "Diğer", percent: 12 },
    ],
    concern:
      "Geçmiş iade sebepleri daha çok beklenti uyuşmazlığı ve kalite algısı etrafında toplanıyor.",
  };
}

export function getBuyerAnalysisById(analysisId: string, userNeed?: string) {
  if (analysisId === demoBuyerAnalysis.analysisId) {
    return {
      ...demoBuyerAnalysis,
      userNeedText: userNeed?.trim() || demoBuyerAnalysis.userNeedText,
    };
  }

  const productId = normalizeAnalysisProductId(analysisId);
  const product = getProductById(productId);

  if (!product) {
    return undefined;
  }

  const categoryFit = getCategoryFit(product.id, product.category);
  const similarProducts = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 3);
  const marketMedian = Math.max(1, Math.round(product.price * 0.88));
  const fairMin = Math.round(marketMedian * 0.92);
  const fairMax = Math.round(marketMedian * 1.08);

  return {
    ...demoBuyerAnalysis,
    analysisId: `analysis-${product.id}`,
    productId: product.id,
    userNeedText:
      userNeed?.trim() ||
      defaultNeedByCategory[product.category] ||
      "Bu ürünü almadan önce bana uygun olup olmadığını anlamak istiyorum.",
    overallRiskPercent: 54,
    recommendationLevel: "caution",
    recommendationText: `${product.title} için bazı sinyaller olumlu, ancak fiyat, açıklama netliği ve iade sebeplerini kontrol etmeden karar vermemelisin.`,
    scores: {
      fitScore: 63,
      trustScore: 58,
      priceScore: product.discountPercent ? 52 : 61,
      returnRiskPercent: 27,
    },
    agentSteps: demoBuyerAnalysis.agentSteps.map((step) => {
      if (step.id === "need-agent") {
        return {
          ...step,
          summary: "Kullanım amacın ve önceliklerin karar kriterlerine çevrildi.",
        };
      }

      if (step.id === "product-agent") {
        return {
          ...step,
          summary: `${product.title} açıklaması ve teknik özellikleri incelendi.`,
        };
      }

      if (step.id === "review-agent") {
        return {
          ...step,
          summary: `${product.reviewCount.toLocaleString("tr-TR")} değerlendirme içinden tekrar eden risk başlıkları çıkarıldı.`,
        };
      }

      if (step.id === "return-agent") {
        return {
          ...step,
          summary: `${product.category} kategorisindeki iade sebepleri ihtiyaç metninle eşleştirildi.`,
        };
      }

      return step;
    }),
    fitAnalysis: {
      title: "Bu ürün senin kullanım senaryona ne kadar uygun?",
      summary: `${product.title} için analiz, senin ihtiyacın ile ürün açıklaması, yorum sinyalleri ve kategori iade nedenlerini eşleştiriyor.`,
      subScores: categoryFit.subScores,
      scenarioComparisons: categoryFit.scenarios,
    },
    trustAnalysis: {
      title: "Bu satıcıya ve ürün listesine güvenebilir misin?",
      summary: `${product.sellerName} ve bu ürün listesi için güven sinyalleri orta seviyede. Listeleme var ama bazı karar detayları daha net olmalı.`,
      signals: [
        {
          title: "Yorum forensiği",
          value: `${product.reviewCount.toLocaleString("tr-TR")} yorum`,
          description:
            "Yorum hacmi karar vermek için yeterli, ancak kısa ve detay vermeyen yorumlar nihai skorda düşük ağırlıkla ele alındı.",
          tone: "warning",
        },
        {
          title: "Görsel tutarlılık",
          value: `${product.thumbnails.length} görsel`,
          description:
            "Ürün görselleri temel görünümü veriyor; farklı açı ve gerçek kullanım fotoğrafları güveni artırır.",
          tone: "warning",
        },
        {
          title: "Satıcı geçmişi",
          value: product.sellerName,
          description:
            "Satıcı profili tek başına kırmızı bayrak üretmiyor, fakat karar için iade oranı ve yorum kalitesi birlikte değerlendirildi.",
          tone: "success",
        },
        {
          title: "Açıklama netliği",
          value: "Kısmen yeterli",
          description:
            "Ürün açıklaması temel faydayı anlatıyor, fakat beklenti yönetimi yapacak sınır ve kullanım bilgileri eksik.",
          tone: "warning",
        },
      ],
    },
    priceAnalysis: {
      title: "Bu fiyat adil mi?",
      summary: `${formatPrice(product.price)} fiyatı, kategori içi benzer ürünlerle karşılaştırıldığında dikkatli kontrol gerektiriyor.`,
      warning: product.discountPercent
        ? `Ürün %${product.discountPercent} indirimli gösteriliyor. İndirimin gerçek avantaj olup olmadığını fiyat geçmişiyle kontrol etmek gerekir.`
        : "Üründe belirgin indirim yok; fiyat kararını benzer ürünlerin medyanıyla karşılaştırmak daha doğru olur.",
      marketComparison: [
        { label: "Bu satıcı", value: formatPrice(product.price) },
        { label: "Tahmini pazar medyanı", value: formatPrice(marketMedian) },
        { label: "Adil fiyat aralığı", value: `${formatPrice(fairMin)}-${formatPrice(fairMax)}` },
      ],
      priceHistory: [
        { day: "G-30", price: product.price, median: marketMedian },
        { day: "G-21", price: product.price, median: Math.round(marketMedian * 1.01) },
        {
          day: "G-14",
          price: product.originalPrice || Math.round(product.price * 1.08),
          median: Math.round(marketMedian * 1.02),
        },
        { day: "G-7", price: product.price, median: marketMedian },
        { day: "Bugün", price: product.price, median: marketMedian },
      ],
    },
    returnRiskAnalysis: {
      title: "Bu ürünü iade etme olasılığın ne kadar?",
      summary: `${product.category} kategorisindeki geçmiş iade sinyalleri ve ürün yorumları birlikte değerlendirildi.`,
      reasons: categoryFit.returnReasons,
      personalWarning: categoryFit.concern,
    },
    finalAdvice: `${product.title} için karar vermeden önce özellikle uygunluk, fiyat ve iade sebeplerini kontrol etmeni öneriyorum. Senin senaryonda tamamen risksiz görünmüyor.`,
    alternatives:
      similarProducts.length > 0
        ? similarProducts.map((item, index) => ({
            title: item.title,
            fitScore: [78, 74, 71][index] || 70,
            price: formatPrice(item.price),
          }))
        : demoBuyerAnalysis.alternatives,
  } satisfies BuyerAnalysis;
}
