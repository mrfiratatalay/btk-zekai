import type { Product, ProductAnalysisEvidence } from "@/types/product";

const headphoneImages = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
];

const baseProducts: Product[] = [
  {
    id: "bluetooth-kulaklik-pro-x1",
    title: "PulseWave Pro X1 Bluetooth 5.3 Kablosuz Kulaklik",
    brand: "PulseWave",
    sellerName: "TeknoPazar Plus",
    category: "Elektronik",
    price: 1015,
    originalPrice: 1450,
    discountPercent: 30,
    rating: 4.6,
    reviewCount: 1428,
    image: headphoneImages[0],
    thumbnails: headphoneImages,
    shortDescription:
      "Günlük kullanım, müzik ve online görüşmeler için hafif kablosuz kulaklık.",
    description:
      "Üstün ses deneyimi, güçlü bas performansı ve konforlu tasarımıyla gün boyu kullanım için geliştirilmiştir. Bluetooth 5.3 bağlantı, hızlı eşleşme ve uzun pil ömrü sunar. Premium malzeme hissi ve şık mat yüzeyiyle hem iş hem eğlence kullanımına uygundur.",
    features: {
      "Baglanti": "Bluetooth 5.3",
      "Pil omru": "20 saate kadar",
      "Mikrofon": "Dahili mikrofon",
      "Gecikme modu": "Belirtilmemis",
      "Garanti": "2 yil ithalatci garantili",
      "Agirlik": "238 g",
    },
    badges: ["Cok satan", "AI analiz uygun", "Sinirli indirim"],
    stock: 18,
    cargoText: "Bugun kargoda, 2 is gunu icinde teslim",
  },
  {
    id: "akilli-saat-fit-neo",
    title: "FitNeo S3 Akilli Saat Nabiz ve Uyku Takipli",
    brand: "FitNeo",
    sellerName: "SaatSepeti",
    category: "Elektronik",
    price: 1299,
    originalPrice: 1699,
    discountPercent: 24,
    rating: 4.4,
    reviewCount: 876,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Günlük aktivite, nabız ve uyku takibi için ince tasarım.",
    description:
      "Spor modları, telefon bildirimleri ve uzun pil ömrüyle günlük sağlık takibi sunan akıllı saat.",
    features: {
      "Ekran": "1.8 inc AMOLED",
      "Pil": "7 gun",
      "Su dayanimi": "IP68",
      "Sensorler": "Nabiz, uyku, adim",
    },
    badges: ["Yeni", "AI karar asistani"],
    stock: 34,
    cargoText: "Yarin kargoda",
  },
  {
    id: "ergonomik-calisma-sandalyesi",
    title: "NordDesk Bel Destekli Ergonomik Calisma Sandalyesi",
    brand: "NordDesk",
    sellerName: "EvOfis Market",
    category: "Ev & Yasam",
    price: 2799,
    originalPrice: 3299,
    discountPercent: 15,
    rating: 4.2,
    reviewCount: 512,
    image:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Uzun çalışma saatleri için ayarlanabilir bel destekli sandalye.",
    description:
      "Ev ofis kullanımına uygun, file sırtlı ve yüksekliği ayarlanabilir çalışma sandalyesi.",
    features: {
      "Malzeme": "File sirt, kumas minder",
      "Tasima kapasitesi": "120 kg",
      "Ayarlanabilirlik": "Yukseklik ve kolcak",
    },
    badges: ["Ofis favorisi", "AI analiz uygun"],
    stock: 11,
    cargoText: "Ucretsiz kargo, 3 is gunu icinde teslim",
  },
  {
    id: "seramik-taki-seti-beyaz",
    title: "LunaCraft Beyaz Seramik Taki Seti",
    brand: "LunaCraft",
    sellerName: "Atolye Luna",
    category: "Aksesuar",
    price: 380,
    originalPrice: 450,
    discountPercent: 16,
    rating: 4.1,
    reviewCount: 238,
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Hediye kutulu, el yapımı seramik takı seti.",
    description:
      "Özel günler için zarif görünümlü, hediye kutusunda gönderilen seramik takı seti.",
    features: {
      "Parca sayisi": "3",
      "Malzeme": "Seramik",
      "Kutu": "Hediye kutulu",
    },
    badges: ["Hediye onerisi"],
    stock: 7,
    cargoText: "Ozenli paketleme, 2 is gunu icinde kargo",
  },
  {
    id: "hava-temizleyici-mini",
    title: "AirPure Mini HEPA Filtreli Hava Temizleyici",
    brand: "AirPure",
    sellerName: "Saglikli Ev",
    category: "Ev & Yasam",
    price: 2190,
    originalPrice: 2490,
    discountPercent: 12,
    rating: 4.7,
    reviewCount: 963,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Küçük odalar için sessiz HEPA filtreli hava temizleyici.",
    description:
      "Toz, polen ve kötü kokulara karşı kompakt boyutlu hava temizleme çözümü.",
    features: {
      "Filtre": "HEPA",
      "Alan": "20 m2",
      "Ses": "32 dB",
    },
    badges: ["Yuksek puan", "AI karar asistani"],
    stock: 22,
    cargoText: "Bugun kargoda",
  },
  {
    id: "spor-ayakkabi-runflex",
    title: "RunFlex Hafif Tabanli Gunluk Spor Ayakkabi",
    brand: "RunFlex",
    sellerName: "Aktif Spor",
    category: "Spor & Outdoor",
    price: 899,
    originalPrice: 1199,
    discountPercent: 25,
    rating: 4.3,
    reviewCount: 701,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Günlük yürüyüş ve hafif antrenman için nefes alan spor ayakkabı.",
    description:
      "Esnek taban, nefes alan yüzey ve hafif tasarımla şehir içi kullanım için uygundur.",
    features: {
      "Taban": "Esnek EVA",
      "Kullanim": "Gunluk yuruyus",
      "Kalıp": "Standart",
    },
    badges: ["Cok satan"],
    stock: 46,
    cargoText: "24 saat icinde kargoda",
  },
  {
    id: "mutfak-robotu-compact",
    title: "CookMate Compact 900W Mutfak Robotu",
    brand: "CookMate",
    sellerName: "Mutfak Merkezi",
    category: "Mutfak",
    price: 1849,
    originalPrice: 2299,
    discountPercent: 20,
    rating: 4.5,
    reviewCount: 1192,
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1200&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Doğrama, karıştırma ve rendeleme için kompakt mutfak robotu.",
    description:
      "Günlük mutfak işlerini hızlandıran, çok aparatlı ve kompakt gövdeli mutfak yardımcısı.",
    features: {
      "Guc": "900W",
      "Hazne": "1.8 L",
      "Aparat": "5 parca",
    },
    badges: ["AI analiz uygun"],
    stock: 16,
    cargoText: "Ucretsiz kargo",
  },
  {
    id: "bebek-kamerasi-nightview",
    title: "NightView Wi-Fi Bebek Kamerasi",
    brand: "NightView",
    sellerName: "Anne Bebek Dunyasi",
    category: "Anne & Bebek",
    price: 1590,
    originalPrice: 1890,
    discountPercent: 16,
    rating: 4.0,
    reviewCount: 354,
    image:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=1200&q=80",
    ],
    shortDescription: "Gece görüşlü, çift yönlü ses destekli bebek kamerası.",
    description:
      "Ev içinde bebek takibi için gece görüşü, hareket algılama ve mobil uygulama desteği sunar.",
    features: {
      "Baglanti": "Wi-Fi",
      "Ses": "Cift yonlu",
      "Gece gorusu": "Var",
    },
    badges: ["Guven odakli", "AI karar asistani"],
    stock: 9,
    cargoText: "Yarin teslim secenegi",
  },
];

const analysisEvidenceByProductId: Record<string, ProductAnalysisEvidence> = {
  "bluetooth-kulaklik-pro-x1": {
    reviews: [
      {
        id: "pw-r1",
        rating: 5,
        title: "Online ders icin mikrofonu yeterli",
        text: "Ders ve Zoom gorusmelerinde sesim net gidiyor. Kulak pedleri 2 saatten sonra biraz isitiyor ama rahatsiz edici degil.",
        verifiedPurchase: true,
        date: "2026-04-18",
        helpfulCount: 42,
        tags: ["mikrofon", "konfor", "online ders"],
      },
      {
        id: "pw-r2",
        rating: 3,
        title: "Oyun gecikmesi bekledigimden fazla",
        text: "Muzik ve video iyi ama rekabetci oyunlarda gecikmeyi hissediyorum. Urun sayfasinda gecikme modu net yazmamis.",
        verifiedPurchase: true,
        date: "2026-04-02",
        helpfulCount: 31,
        tags: ["gecikme", "oyun", "eksik bilgi"],
      },
      {
        id: "pw-r3",
        rating: 4,
        title: "Pil iyi, kutu icerigi sade",
        text: "Pil suresi iddia edildigi gibi uzun. Sarj kablosu kisa, tasima kilifi cikmiyor.",
        verifiedPurchase: true,
        date: "2026-03-22",
        helpfulCount: 17,
        tags: ["pil", "kutu icerigi"],
      },
      {
        id: "pw-r4",
        rating: 2,
        title: "Mikrofon kalabalik ortamda zayif",
        text: "Sessiz odada iyi ama kafede arka plan sesini fazla aliyor. Toplanti icin alacaklar dikkat etmeli.",
        verifiedPurchase: true,
        date: "2026-03-11",
        helpfulCount: 28,
        tags: ["mikrofon", "gurultu", "toplanti"],
      },
    ],
    visualNotes: {
      studioPhotoCount: 4,
      customerPhotoCount: 9,
      consistencyNotes: [
        "Musteri fotograflarinda kulaklik formu studyo gorselleriyle uyumlu.",
        "Mat yuzey gercek fotolarda biraz daha koyu gorunuyor.",
      ],
      redFlags: ["Gecikme modu icin arayuz veya uygulama ekran goruntusu yok."],
    },
    priceHistory: [
      { day: "G-30", price: 1390, marketMedian: 1160 },
      { day: "G-21", price: 1450, marketMedian: 1140 },
      { day: "G-14", price: 1015, marketMedian: 1120 },
      { day: "G-7", price: 1015, marketMedian: 1110 },
      { day: "Bugun", price: 1015, marketMedian: 1100 },
    ],
    market: {
      medianPrice: 1100,
      fairPriceMin: 940,
      fairPriceMax: 1240,
      alternativeSellers: [
        { name: "SesMarket", price: 1089, rating: 8.8 },
        { name: "KulaklikSepeti", price: 1125, rating: 9.1 },
        { name: "TeknoOutlet", price: 999, rating: 7.9 },
      ],
    },
    returnReasons: [
      { label: "Mikrofon beklentisi karsilanmadi", percent: 34, evidence: "Olumsuz yorumlar kalabalik ortam mikrofon performansini tekrar ediyor." },
      { label: "Oyun gecikmesi", percent: 23, evidence: "Gecikme modu urun ozelliklerinde belirtilmemis." },
      { label: "Uzun kullanim konforu", percent: 18, evidence: "Pedlerin uzun kullanimda isittigi yorumu var." },
    ],
    sellerSignals: {
      storeRating: 9.2,
      shippingScore: 8.7,
      responseTime: "Ortalama 3 saat",
      riskNotes: ["Ithalatci garanti var, yetkili servis bilgisi acik degil."],
    },
  },
  "akilli-saat-fit-neo": {
    reviews: [
      { id: "fn-r1", rating: 5, title: "Pil beklentiyi karsiladi", text: "Bildirimler acikken 5-6 gun rahat gidiyor. Ekran parlakligi disarida yeterli.", verifiedPurchase: true, date: "2026-04-20", helpfulCount: 26, tags: ["pil", "ekran"] },
      { id: "fn-r2", rating: 3, title: "Uyku takibi tutarsiz", text: "Adim sayar iyi ama uyku baslangicini iki kez yanlis yakaladi.", verifiedPurchase: true, date: "2026-04-03", helpfulCount: 19, tags: ["uyku", "sensor"] },
      { id: "fn-r3", rating: 4, title: "Uygulama sade", text: "Kurulum kolay, bildirimler hizli geliyor. Kordon biraz sert.", verifiedPurchase: true, date: "2026-03-18", helpfulCount: 12, tags: ["kurulum", "kordon"] },
    ],
    visualNotes: {
      studioPhotoCount: 2,
      customerPhotoCount: 6,
      consistencyNotes: ["Musteri fotograflarinda ekran cercevesi studyo gorseline yakin.", "Kordon rengi isikta biraz farkli gorunuyor."],
      redFlags: ["Uygulama ekranlari urun galerisinde detayli degil."],
    },
    priceHistory: [
      { day: "G-30", price: 1599, marketMedian: 1420 },
      { day: "G-21", price: 1699, marketMedian: 1410 },
      { day: "G-14", price: 1399, marketMedian: 1390 },
      { day: "G-7", price: 1299, marketMedian: 1380 },
      { day: "Bugun", price: 1299, marketMedian: 1375 },
    ],
    market: {
      medianPrice: 1375,
      fairPriceMin: 1220,
      fairPriceMax: 1490,
      alternativeSellers: [
        { name: "TeknoSaat", price: 1349, rating: 8.6 },
        { name: "MobilFit", price: 1279, rating: 8.1 },
      ],
    },
    returnReasons: [
      { label: "Sensor dogrulugu", percent: 29, evidence: "Uyku takibi hakkinda tutarsizlik yorumlari var." },
      { label: "Kordon konforu", percent: 17, evidence: "Kordon sertligi tekrar eden orta seviye sikayet." },
      { label: "Uygulama beklentisi", percent: 14, evidence: "Uygulama ekranlari urun sayfasinda detayli kanitlanmiyor." },
    ],
    sellerSignals: {
      storeRating: 8.9,
      shippingScore: 8.4,
      responseTime: "Ortalama 5 saat",
      riskNotes: ["Servis ve yedek kordon bilgisi sinirli."],
    },
  },
  "ergonomik-calisma-sandalyesi": {
    reviews: [
      { id: "nd-r1", rating: 4, title: "Bel destegi iyi", text: "Gunde 6 saat kullaniyorum, bel destegi rahat. Kolcaklar biraz oynuyor.", verifiedPurchase: true, date: "2026-04-12", helpfulCount: 33, tags: ["bel destegi", "kolcak"] },
      { id: "nd-r2", rating: 2, title: "Kurulum zor geldi", text: "Vidalarin biri zor oturdu, kurulum kagidi daha net olmaliydi.", verifiedPurchase: true, date: "2026-03-29", helpfulCount: 21, tags: ["kurulum", "vida"] },
      { id: "nd-r3", rating: 3, title: "Uzun boylular icin sinirda", text: "1.85 boyundayim, sirt yuksekligi bana biraz kisa geldi.", verifiedPurchase: true, date: "2026-03-16", helpfulCount: 18, tags: ["olcu", "konfor"] },
    ],
    visualNotes: {
      studioPhotoCount: 2,
      customerPhotoCount: 7,
      consistencyNotes: ["File sirt ve minder kalinligi musteri fotolarinda uyumlu.", "Olcu karsilastirmasi icin insanli gorsel yok."],
      redFlags: ["Net oturum yuksekligi ve sirt olcusu gorselde isaretlenmemis."],
    },
    priceHistory: [
      { day: "G-30", price: 3199, marketMedian: 2890 },
      { day: "G-21", price: 3299, marketMedian: 2910 },
      { day: "G-14", price: 2999, marketMedian: 2870 },
      { day: "G-7", price: 2799, marketMedian: 2840 },
      { day: "Bugun", price: 2799, marketMedian: 2820 },
    ],
    market: {
      medianPrice: 2820,
      fairPriceMin: 2550,
      fairPriceMax: 3090,
      alternativeSellers: [
        { name: "OfisKolay", price: 2899, rating: 8.5 },
        { name: "MobilyaJet", price: 2749, rating: 8.0 },
      ],
    },
    returnReasons: [
      { label: "Olcu ve boy uyumu", percent: 31, evidence: "Uzun boylu kullanicilar sirt yuksekligini sinirda buluyor." },
      { label: "Kurulum zorlugu", percent: 24, evidence: "Vida ve kurulum semasi sikayetleri var." },
      { label: "Kolcak stabilitesi", percent: 16, evidence: "Kolcak oynama yorumu tekrar ediyor." },
    ],
    sellerSignals: {
      storeRating: 8.4,
      shippingScore: 7.8,
      responseTime: "Ortalama 6 saat",
      riskNotes: ["Buyuk hacimli kargoda hasar riski kategori ortalamasinin uzerinde."],
    },
  },
  "seramik-taki-seti-beyaz": {
    reviews: [
      { id: "lc-r1", rating: 5, title: "Hediye paketi guzel", text: "Kutusu ozenliydi, hediye olarak aldim. Renk fotograftakine yakin.", verifiedPurchase: true, date: "2026-04-10", helpfulCount: 15, tags: ["hediye", "paketleme"] },
      { id: "lc-r2", rating: 2, title: "Bir parca catlak geldi", text: "Kolye ucu kenarinda ince catlak vardi, iade sureci hizli ilerledi.", verifiedPurchase: true, date: "2026-03-27", helpfulCount: 24, tags: ["kargo", "hasar"] },
      { id: "lc-r3", rating: 4, title: "Boyut bekledigimden kucuk", text: "Kalitesi iyi ama fotograf daha buyuk algi yaratiyor.", verifiedPurchase: true, date: "2026-03-08", helpfulCount: 11, tags: ["boyut", "gorsel"] },
    ],
    visualNotes: {
      studioPhotoCount: 2,
      customerPhotoCount: 5,
      consistencyNotes: ["Renk ve parlaklik musteri fotograflarinda uyumlu.", "Boyut algisi icin elde/ustte gorsel sinirli."],
      redFlags: ["Kirilgan urun icin paket koruma katmanlari gorsellenmemis."],
    },
    priceHistory: [
      { day: "G-30", price: 450, marketMedian: 410 },
      { day: "G-21", price: 450, marketMedian: 405 },
      { day: "G-14", price: 399, marketMedian: 400 },
      { day: "G-7", price: 380, marketMedian: 395 },
      { day: "Bugun", price: 380, marketMedian: 390 },
    ],
    market: {
      medianPrice: 390,
      fairPriceMin: 340,
      fairPriceMax: 430,
      alternativeSellers: [
        { name: "ElisiPazar", price: 410, rating: 8.7 },
        { name: "HediyeKutusu", price: 369, rating: 7.8 },
      ],
    },
    returnReasons: [
      { label: "Kargo hasari", percent: 36, evidence: "Catlak/hasar yorumu var, urun kirilgan." },
      { label: "Boyut beklentisi", percent: 22, evidence: "Fotograf boyut algisini buyutebiliyor." },
      { label: "Hediye paketi beklentisi", percent: 13, evidence: "Paketleme iyi ama koruma katmani belirsiz." },
    ],
    sellerSignals: {
      storeRating: 8.6,
      shippingScore: 7.9,
      responseTime: "Ortalama 2 saat",
      riskNotes: ["Kirilgan urun oldugu icin paketleme kaniti karar icin kritik."],
    },
  },
  "hava-temizleyici-mini": {
    reviews: [
      { id: "ap-r1", rating: 5, title: "Kucuk oda icin yeterli", text: "12 m2 odada koku ve toz hissi azaldi. Sessiz mod gece rahatsiz etmiyor.", verifiedPurchase: true, date: "2026-04-17", helpfulCount: 38, tags: ["sessiz", "kucuk oda"] },
      { id: "ap-r2", rating: 4, title: "Filtre bilgisi net olmali", text: "Cihaz iyi ama yedek filtre fiyatini sayfada gormek isterdim.", verifiedPurchase: true, date: "2026-04-01", helpfulCount: 22, tags: ["filtre", "maliyet"] },
      { id: "ap-r3", rating: 3, title: "20 m2 iddiasi sinirda", text: "Salon icin zayif kaldi, yatak odasinda daha mantikli.", verifiedPurchase: true, date: "2026-03-20", helpfulCount: 19, tags: ["alan", "performans"] },
    ],
    visualNotes: {
      studioPhotoCount: 2,
      customerPhotoCount: 6,
      consistencyNotes: ["Boyut musteri fotolarinda kompakt gorunuyor.", "Filtre yuvasini gosteren gorsel yok."],
      redFlags: ["Yedek filtre ve CADR degeri urun gorsellerinde kanitlanmamis."],
    },
    priceHistory: [
      { day: "G-30", price: 2490, marketMedian: 2310 },
      { day: "G-21", price: 2390, marketMedian: 2290 },
      { day: "G-14", price: 2290, marketMedian: 2260 },
      { day: "G-7", price: 2190, marketMedian: 2240 },
      { day: "Bugun", price: 2190, marketMedian: 2230 },
    ],
    market: {
      medianPrice: 2230,
      fairPriceMin: 1990,
      fairPriceMax: 2450,
      alternativeSellers: [
        { name: "TemizHava", price: 2249, rating: 9.0 },
        { name: "EvSaglik", price: 2175, rating: 8.5 },
      ],
    },
    returnReasons: [
      { label: "Alan performansi", percent: 27, evidence: "20 m2 iddiasi salon kullanimi icin sinirda yorumlanmis." },
      { label: "Filtre maliyeti belirsiz", percent: 21, evidence: "Yedek filtre fiyati sayfada net degil." },
      { label: "Beklenen temizlik etkisi", percent: 15, evidence: "Kucuk odada iyi, buyuk alanda zayif sinyali var." },
    ],
    sellerSignals: {
      storeRating: 9.1,
      shippingScore: 8.9,
      responseTime: "Ortalama 4 saat",
      riskNotes: ["Yedek filtre bulunabilirligi satin alma kararinda kontrol edilmeli."],
    },
  },
  "spor-ayakkabi-runflex": {
    reviews: [
      { id: "rf-r1", rating: 5, title: "Gunluk yuruyuste rahat", text: "Tabani yumusak, gunluk 7-8 bin adimda rahat ettirdi.", verifiedPurchase: true, date: "2026-04-14", helpfulCount: 29, tags: ["konfor", "yuruyus"] },
      { id: "rf-r2", rating: 3, title: "Kalip yarim numara dar", text: "Normal numaram ayagimi siki tuttu, degisim yaptim.", verifiedPurchase: true, date: "2026-03-30", helpfulCount: 35, tags: ["kalip", "beden"] },
      { id: "rf-r3", rating: 3, title: "Kosuda destek az", text: "Gunluk kullanim iyi ama kosu antrenmani icin taban destegi yeterli degil.", verifiedPurchase: true, date: "2026-03-15", helpfulCount: 18, tags: ["kosu", "destek"] },
    ],
    visualNotes: {
      studioPhotoCount: 2,
      customerPhotoCount: 8,
      consistencyNotes: ["Renk musteri fotolarinda studyo gorseline yakin.", "Burun formu ve taban kalinligi uyumlu."],
      redFlags: ["Beden tablosu ve ayak olcu rehberi gorsellerde yok."],
    },
    priceHistory: [
      { day: "G-30", price: 1099, marketMedian: 980 },
      { day: "G-21", price: 1199, marketMedian: 970 },
      { day: "G-14", price: 949, marketMedian: 960 },
      { day: "G-7", price: 899, marketMedian: 950 },
      { day: "Bugun", price: 899, marketMedian: 945 },
    ],
    market: {
      medianPrice: 945,
      fairPriceMin: 840,
      fairPriceMax: 1040,
      alternativeSellers: [
        { name: "Sporium", price: 929, rating: 8.4 },
        { name: "AktifOutlet", price: 879, rating: 7.7 },
      ],
    },
    returnReasons: [
      { label: "Beden/kalip uyumsuzlugu", percent: 42, evidence: "Yarim numara dar kalip yorumu tekrar ediyor." },
      { label: "Kosu destegi beklentisi", percent: 19, evidence: "Gunluk yuruyus iyi, kosu antrenmani icin zayif." },
      { label: "Taban konforu", percent: 15, evidence: "Yumusak taban ovuluyor ama destek sinirli." },
    ],
    sellerSignals: {
      storeRating: 8.5,
      shippingScore: 8.8,
      responseTime: "Ortalama 4 saat",
      riskNotes: ["Beden degisim politikasinin netligi kritik."],
    },
  },
  "mutfak-robotu-compact": {
    reviews: [
      { id: "cm-r1", rating: 5, title: "Dograyici guclu", text: "Sebze dograma ve rende iyi. Hazne gunluk yemek icin yeterli.", verifiedPurchase: true, date: "2026-04-19", helpfulCount: 31, tags: ["guc", "hazne"] },
      { id: "cm-r2", rating: 3, title: "Ses bekledigimden yuksek", text: "Performans iyi ama calisirken sesi fazla.", verifiedPurchase: true, date: "2026-04-04", helpfulCount: 23, tags: ["ses", "konfor"] },
      { id: "cm-r3", rating: 4, title: "Aparatlar yeterli", text: "5 aparat cikiyor, kutu icerigi eksiksizdi. Plastik hazne dikkatli yikanmali.", verifiedPurchase: true, date: "2026-03-21", helpfulCount: 14, tags: ["aparat", "malzeme"] },
    ],
    visualNotes: {
      studioPhotoCount: 2,
      customerPhotoCount: 5,
      consistencyNotes: ["Kutu icerigi musteri fotolarinda 5 parca gorunuyor.", "Hazne boyutu urun aciklamasiyla uyumlu."],
      redFlags: ["Ses seviyesi icin desibel bilgisi yok."],
    },
    priceHistory: [
      { day: "G-30", price: 2199, marketMedian: 1950 },
      { day: "G-21", price: 2299, marketMedian: 1960 },
      { day: "G-14", price: 1999, marketMedian: 1930 },
      { day: "G-7", price: 1849, marketMedian: 1910 },
      { day: "Bugun", price: 1849, marketMedian: 1900 },
    ],
    market: {
      medianPrice: 1900,
      fairPriceMin: 1720,
      fairPriceMax: 2090,
      alternativeSellers: [
        { name: "MutfakPro", price: 1899, rating: 8.9 },
        { name: "EvChef", price: 1819, rating: 8.2 },
      ],
    },
    returnReasons: [
      { label: "Ses seviyesi", percent: 25, evidence: "Ses sikayeti tekrar ediyor, desibel kaniti yok." },
      { label: "Malzeme beklentisi", percent: 18, evidence: "Plastik hazne dikkatli kullanim gerektiriyor." },
      { label: "Hazne kapasitesi", percent: 13, evidence: "Gunluk kullanim yeterli, kalabalik aile icin sinirda olabilir." },
    ],
    sellerSignals: {
      storeRating: 8.8,
      shippingScore: 8.6,
      responseTime: "Ortalama 5 saat",
      riskNotes: ["Yedek aparat ve servis bilgisi sayfada sinirli."],
    },
  },
  "bebek-kamerasi-nightview": {
    reviews: [
      { id: "nv-r1", rating: 4, title: "Gece gorusu iyi", text: "Karanlik odada goruntu net. Kurulum 10 dakika surdu.", verifiedPurchase: true, date: "2026-04-08", helpfulCount: 27, tags: ["gece gorusu", "kurulum"] },
      { id: "nv-r2", rating: 2, title: "Wi-Fi kopmalari yasadim", text: "Modem uzaktayken baglanti koptu, bebek takibinde guven vermedi.", verifiedPurchase: true, date: "2026-03-28", helpfulCount: 34, tags: ["wifi", "guven"] },
      { id: "nv-r3", rating: 3, title: "Uygulama bildirimleri gec geliyor", text: "Hareket algilama calisiyor ama bildirim bazen gec dusuyor.", verifiedPurchase: true, date: "2026-03-12", helpfulCount: 22, tags: ["uygulama", "bildirim"] },
    ],
    visualNotes: {
      studioPhotoCount: 2,
      customerPhotoCount: 4,
      consistencyNotes: ["Kamera boyutu musteri fotolarinda uyumlu.", "Gece gorusu ornek ekran goruntusu sinirli."],
      redFlags: ["Uygulama izinleri ve veri guvenligi aciklamasi sayfada yok."],
    },
    priceHistory: [
      { day: "G-30", price: 1790, marketMedian: 1680 },
      { day: "G-21", price: 1890, marketMedian: 1690 },
      { day: "G-14", price: 1690, marketMedian: 1670 },
      { day: "G-7", price: 1590, marketMedian: 1660 },
      { day: "Bugun", price: 1590, marketMedian: 1650 },
    ],
    market: {
      medianPrice: 1650,
      fairPriceMin: 1490,
      fairPriceMax: 1820,
      alternativeSellers: [
        { name: "BebekTekno", price: 1649, rating: 8.3 },
        { name: "GuvenliEv", price: 1579, rating: 7.8 },
      ],
    },
    returnReasons: [
      { label: "Baglanti kararliligi", percent: 33, evidence: "Wi-Fi kopmasi bebek takibi icin kritik risk." },
      { label: "Bildirim gecikmesi", percent: 24, evidence: "Uygulama bildirimi gec geliyor yorumu var." },
      { label: "Veri guvenligi belirsizligi", percent: 17, evidence: "Uygulama izinleri ve veri guvenligi aciklamasi yok." },
    ],
    sellerSignals: {
      storeRating: 8.1,
      shippingScore: 8.2,
      responseTime: "Ortalama 7 saat",
      riskNotes: ["Bebek urunu oldugu icin baglanti ve veri guvenligi kaniti kritik."],
    },
  },
};

export const products: Product[] = baseProducts.map((product) => ({
  ...product,
  analysisEvidence: analysisEvidenceByProductId[product.id],
}));

export const categories = [
  "Elektronik",
  "Giyim",
  "Ev & Yasam",
  "Anne & Bebek",
  "Kozmetik",
  "Spor & Outdoor",
  "Kitap",
  "Mutfak",
  "Aksesuar",
  "Kisisel Bakim",
];

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getSimilarProducts(productId: string) {
  return products.filter((product) => product.id !== productId).slice(0, 4);
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}
