# Arayüz ve tasarım

## İki uygulama, ortak temel

| | Akıllı Market | ZekAI |
|---|---|---|
| Klasör | [`apps/akilli-market-web`](../apps/akilli-market-web) | [`apps/zekai-platform-web`](../apps/zekai-platform-web) |
| Sayfa | 11 | 23 |
| Çatı | Next.js 16 (App Router), React 19, TypeScript strict | Aynı |
| Stil | Tailwind CSS 4, shadcn/ui (Radix), lucide ikonları | Aynı, ek olarak Framer Motion |
| Durum | Zustand: sepet ve favoriler | Zustand: alıcı kayıtları; TanStack Query: satıcı ekranlarının bir kısmı |
| Özel | Ürün sayfası sunucuda çiziliyor, satıcı değişikliğinde yeniden üretiliyor | React Flow ile analiz akışı, three.js ile kombin figürü |
| Tema | Açık | Açık ve koyu (`next-themes`) |

İki uygulamayı ayrı tuttuk çünkü iki ayrı ürünü temsil ediyorlar; ortak bir paket yok. Bunun bedeli, bazı
bileşenlerin ve API istemcisinin iki uygulamada ayrı ayrı yazılmış olması.

## Ekranlar veri katmanını bilmiyor

Ekranlar `lib/api` altındaki fonksiyonları çağırıyor (`getProduct`, `generateAiContent`, `runBuyerAgentStream`
gibi). Bu fonksiyonlar da bütün ağ çağrılarını tek bir yerden yapıyor:
[`transport.ts`](../apps/zekai-platform-web/src/lib/api/transport.ts). Gerçek API derlemesinde bu `fetch`;
Vercel'deki demoda tarayıcıdaki demo katmanı. Hata işleme, 401'de token yenileme ve SSE okuma kodu iki modda
da aynı çalışıyor; demoyu kurarken hiçbir ekranın veri koduna dokunmadım.

Tek istisna Akıllı Market'in ürün sayfası: gerçek modda sunucuda çiziliyor, ama demonun verisi tarayıcıda
yaşadığı için demoda aynı görünüm bileşeni ([`ProductPageView`](../apps/akilli-market-web/src/components/shop/ProductPageView.tsx))
tarayıcıda dolduruluyor.

## Sunucu durumu ve önbellek

- **Akıllı Market vitrini:** ürün sayfası her istekte taze veriyle sunucuda çiziliyor; SSS gibi az değişen
  bölümler 60 saniye önbellekte kalıyor. Satıcı bir ürünü değiştirdiğinde `commerce-api`,
  [`/api/revalidate`](../apps/akilli-market-web/src/app/api/revalidate/route.ts) ucunu çağırıyor ve
  `revalidatePath` ana sayfayı ve o ürünün sayfasını yeniliyor. Ayşe'nin Müşteri Sesi modülü de satıcının
  yayınladığı yorum cevabını vitrine bu yolla anında taşıyor.
- **Sepet:** Zustand deposu sunucudaki sepetin bir kopyası. Adet artırırken arayüz önce kendini güncelliyor,
  sonra sunucunun döndürdüğü satırla birleştiriyor.
- **ZekAI alıcı verisi:** kayıtlı analizler, karar odaları ve kombinler Zustand depolarında; kaynak her zaman
  API. Karşılaştırma kuyruğu bilinçli olarak yalnızca bellekte duruyor; sayfa yenilenince boşalıyor.
- **Tamamlanmış analiz:** arayüz, biten bir analizi `localStorage`'da da tutuyor; aynı sayfaya geri dönüldüğünde
  akışı yeniden oynatmadan sonucu gösteriyor.

## Canlı akışı göstermek

Analiz, kombin, karşılaştırma ve simülasyon cevapları SSE ile parça parça geliyor. Arayüz `fetch` ile bir
`ReadableStream` açıp satırları okuyor, her `data:` satırını JSON olarak çözüyor ve adımı tamamlıyor.

- **Analiz:** [`AnalysisLoadingView`](../apps/zekai-platform-web/src/components/platform/AnalysisLoadingView.tsx)
  React Flow ile danışman → piyasa kontrolü → karar düğümlerini çiziyor; bir düğüm yalnızca kendi sonucu
  geldiğinde tamamlanıyor, sahte bir ilerleme çubuğu yok. Son rapor geldikten sonra akışın görülebilmesi için
  sonuç ekranı 8 saniye sonra açılıyor.
- **Simülasyon:** her müşteri geldiğinde ürün kartının o müşterinin baktığı bölümü (fiyat, yorumlar, kargo…)
  vurgulanıyor ve kişinin iç sesi balon olarak çıkıyor.
- **Kombin:** ürünler bir 3B figürün üzerine (baş, bilek, ayak gibi bölgelere) yerleştiriliyor; skorlar akış
  sırasında canlı güncelleniyor.

Bu okuma kodu dört dosyada tekrar ediyor; ortak bir yardımcıya taşımak yol haritamda.

## Tasarım dili

| | Akıllı Market | ZekAI |
|---|---|---|
| Vurgu rengi | Turuncu `#FF6000` | Lime `#C1F25D` (koyu temada `#ADFF41`) |
| Yazı tipi | Sistem yazı tipi | Plus Jakarta Sans |
| Karakter | Tanıdık bir pazar yeri: yoğun ürün ızgarası, belirgin fiyat | Sakin bir çalışma alanı: geniş boşluk, yuvarlak kartlar, tek vurgu rengi |

Karar rozetleri renkle ve metinle birlikte anlatılıyor: yeşil "Alabilirsin", sarı "Dikkatli İlerle", kırmızı
"Alternatife Bak". Renk körlüğünde de anlam metinde kalıyor.

## Mobil

18 Mayıs'ta bütün ekranlardan bir mobil uyum turu geçtim. Seller Studio telefonda yan menü yerine altta sabit bir
sekme çubuğu kullanıyor; tanıtım sayfası ve market tek sütuna iniyor. Demo rozeti, telefonda ekranların kendi alt
düğmelerinin üstüne binmesin diye küçük bir düğmeye dönüşüyor.

## Erişilebilirlik

Radix tabanlı bileşenler klavye ve ekran okuyucu desteğini kendisi getiriyor; ikon düğmelerinin bir kısmında
`aria-label` var. Bunun dışında sistematik bir erişilebilirlik denetimi yapmadık; kontrast ve odak sırası
kontrolleri yol haritamda.

## Bilinen borçlar

- Bazı bileşenler çok büyük: [`SellerDrafts.tsx`](../apps/zekai-platform-web/src/components/seller-studio/SellerDrafts.tsx)
  1.348 satır, `SellerSimulation.tsx` 750 satır. Hackathon hızında büyüdüler.
- `zekai-platform-web` içinde iki kilit dosyası var: Vercel `pnpm-lock.yaml`'ı, Docker imajı `package-lock.json`'ı
  kullanıyor. İkisi kolayca ayrışabiliyor; bugün `package-lock.json` bu yüzden senkron değildi ve düzelttim.
- `recharts` ve `react-hook-form` bağımlılık listesinde ama hiçbir dosyada kullanılmıyor.
- Frontend Dockerfile'ları üretim derlemesi değil, geliştirme sunucusu (`npm run dev`) çalıştırıyor.
- Arayüz yalnızca Türkçe; çoklu dil desteği yok.
