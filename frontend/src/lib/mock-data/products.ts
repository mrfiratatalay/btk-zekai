import type { Product } from "@/types/product";

const headphoneImages = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
];

export const products: Product[] = [
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
