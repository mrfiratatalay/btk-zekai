# İş kuralları

Bu sayfada sistemin "ne zaman neye izin verdiğini" ve skorların nasıl hesaplandığını topladım. Formüller
koddan; örnek tablolardaki sayıları da aynı formüllerle elle hesapladım.

## Paket (birlikte sat) indirimi

Satıcı bir ana ürünle tamamlayıcı bir ürünü paket olarak satabiliyor. İndirim paketin toplamı üzerinden
hesaplanıyor ve iki ürüne **fiyatlarıyla orantılı** paylaştırılıyor:

```text
indirim       = yuvarla(toplam × yüzde / 100, 2)
ürünün payı   = yuvarla(indirim × ürün fiyatı / toplam, 2)
ürünün fiyatı = ürün fiyatı − ürünün payı
```

Örnek: seed verisindeki "Günlük Teknoloji Paketi", %5 indirim.

| Ürün | Fiyat | İndirim payı | Paket içi fiyat |
|---|---|---|---|
| Premium Bluetooth Kulaklık | 1.015,00 | 50,75 | 964,25 |
| MagSafe uyumlu telefon kılıfı | 399,00 | 19,95 | 379,05 |
| **Toplam** | **1.414,00** | **70,70** | **1.343,30** |

**Neden orantılı?** İndirim tek bir ürüne yazılsaydı, o ürün iade edildiğinde hangi tutarın geri ödeneceği
belirsiz kalırdı. Her sipariş satırı kendi indirimini taşıdığı için satır bazında iade ve raporlama doğru kalıyor.
Kod: [`CartService.UpsertBundleItem`](../services/commerce-api/src/ZekAI.Infrastructure/Services/CartService.cs),
[`BuyerService.AddBundleOrderItem`](../services/commerce-api/src/ZekAI.Infrastructure/Services/BuyerService.cs).

Kurallar:

- İndirim yüzdesi 0 ile 50 arasında olmalı.
- Paket yayına alınırken iki ürünün de stoğu olmalı; vitrinde yalnızca iki ürünü de yayında ve stokta olan
  yayınlanmış paketler görünüyor.
- Bir ürün çiftine aynı anda tek aktif paket kurulabiliyor (veritabanındaki kısmi unique index).
- Sepette paket iki satır olarak duruyor ve iki satır her zaman aynı adeti taşıyor. Paketin bir satırı
  silinirse diğeri de siliniyor; paket ürünleri tek tek güncellenemiyor.
- C#'ta `Math.Round` varsayılan olarak "banker's rounding" yapıyor; tam yarım kuruşlarda sonuç çifte yuvarlanıyor.
  Paylar ayrı ayrı yuvarlandığı için iki payın toplamı, toplam indirimden bir kuruş eksik kalabiliyor; bunu
  [sınırlar](12-sorular-ve-sinirlar.md#bilinen-sınırlar) bölümüne yazdım.

## Sipariş

- İstemci yalnızca ürün kimliği ve adet gönderiyor; **fiyatı sunucu veritabanından alıyor**. Tarayıcıda
  değiştirilen bir fiyat siparişe yansımıyor.
- Stok, sipariş satırlarıyla aynı `SaveChanges` çağrısında düşülüyor; stok yetmezse sipariş hiç oluşmuyor.
- Sipariş numarası `ZK-<unix saniyesi>`. Durum `Pending` ile başlıyor; alıcı **Teslim Aldım** dediğinde
  `Delivered` oluyor. Yalnızca bekleyen sipariş teslim alınabiliyor.

## Yorum

| Kural | Kod |
|---|---|
| Yalnızca alıcı rolü yorum yazabilir | `[Authorize(Roles = "Buyer")]` |
| Satıcı kendi ürününe yorum yazamaz | `CreateReviewAsync` → `409` |
| Bir kullanıcı bir ürüne bir kez yorum yazar | `CreateReviewAsync` → `409` |
| Puan 1-5 aralığına sıkıştırılır | `Math.Clamp(rating, 1, 5)` |
| Kullanıcının o ürünü içeren bir siparişi varsa yorum "doğrulanmış alım" olur | `VerifiedPurchase` |
| Ürünün puanı ve yorum sayısı, kayıtlı yorumlardan hesaplanır | `ProductService` |

Son satır önemli: ürün tablosunda bir `Rating` kolonu var ama vitrine giden puan her seferinde yorumların
ortalamasından hesaplanıyor. Böylece elle girilmiş bir puan gerçek yorumlarla çelişemiyor.

## Alıcı kararı: karar motoru

ZekAI'ın kararını yapay zekâ değil, [`decision_engine.py`](../services/ai-service/buyer/decision_engine.py)
içindeki saf bir fonksiyon veriyor. Model yalnızca dört skor ve kanıtlı uyarılar üretiyor. Nedenini
[Yapay zekâ hattı](07-yapay-zeka.md) sayfasında anlattım.

| Eşik | Değer |
|---|---|
| Uyum "al" eşiği / "alma" eşiği | 70 / 40 |
| Güven "al" eşiği / "alma" eşiği | 60 / 35 |
| İade riski "al" üst sınırı / "alma" alt sınırı | %25 / %50 |
| "Alma" için yüksek güvenilirlikli uyarı sayısı | 2 |

1. **Alternatife Bak:** uyum < 40, güven < 35, iade riski > %50, en az 2 yüksek güvenilirlikli uyarı ya da en az
   1 yüksek güvenilirlikli daha iyi alternatif. Koşullardan biri yeter.
2. **Alabilirsin:** uyum ≥ 70, güven ≥ 60, iade riski ≤ %25 ve yüksek güvenilirlikli uyarı yok. Hepsi gerekir.
3. **Dikkatli İlerle:** geri kalan her durum.

Bileşik skor: `0,40 × uyum + 0,25 × güven + 0,20 × fiyat + 0,15 × (100 − iade riski)`.

Örnek (kodun kendi açıklamasındaki girdi): uyum 72, güven 64, fiyat 58, iade riski %22, uyarı yok.

| Hesap | Sonuç |
|---|---|
| Bileşik skor | 28,8 + 16,0 + 11,6 + 11,7 = **68** |
| "Alma" koşullarından biri var mı? | Hayır |
| "Al" koşullarının hepsi var mı? | 72 ≥ 70, 64 ≥ 60, 22 ≤ 25, uyarı yok: **Evet** |
| Karar | **Alabilirsin** |

Aynı girdiye iki yüksek güvenilirlikli uyarı eklenirse karar, skorlar değişmeden **Alternatife Bak** oluyor.

## Fiyat adaleti

Piyasa kontrolü en az iki fiyat adayı bulduğunda fiyat skoru adayların **medyanına** oranla hesaplanıyor:

| Fiyat / medyan | Skor | Değerlendirme |
|---|---|---|
| ≤ 0,75 | 90 | ucuz |
| 0,75 – 0,90 | 80'den 70'e doğrusal | ucuz |
| 0,90 – 1,10 | 70 − 150 × (oranın 1'den farkı) | makul |
| 1,10 – 1,30 | 45'ten 25'e doğrusal | pahalı |
| > 1,30 | 20 | pahalı |

İkiden az aday varsa danışmanın verdiği fiyat skoru kullanılıyor. Ortalama yerine medyan kullandım; tek bir
uç fiyat (örneğin yanlış eşleşmiş pahalı bir model) sonucu bozmasın diye.
Kod: [`calculate_price_fairness`](../services/ai-service/buyer/scoring_engine.py).

## İade riski

```text
risk = kategori baz riski
     + yorumlardaki iade/pişmanlık ifadeleri × 6   (en çok 24)
     + (70 − uyum) × 0,45                           (uyum 70'in altındaysa, en çok 22)
     + (60 − güven) × 0,35                          (güven 60'ın altındaysa, en çok 18)
     + yüksek güvenilirlikli uyarı × 6              (en çok 18)
```

Kategori baz riskleri: giyim %32, ayakkabı %35, aksesuar %24, ev %18, spor %20, elektronik %12, kitap %6 gibi;
listede olmayan kategori %18. Örnek: elektronik bir üründe uyum 56 ve bir yüksek güvenilirlikli uyarı varsa
`12 + 6,3 + 6 = 24,3`, yani %24. Kod: [`calculate_return_risk`](../services/ai-service/buyer/scoring_engine.py).

## Genel pişmanlık riski

Arayüz, kaydedilen analizlerde tek bir yüzde gösteriyor:
`100 − (uyum + güven + fiyat) / 3 + 0,35 × iade riski`. Yukarıdaki örnek için %43.
Kod: [`applyVerifiedReport`](../apps/zekai-platform-web/src/lib/adk/buyer-agent.ts).

## Kombin

Alıcı birden fazla ürünü bir hedef ve bütçeyle birlikte değerlendiriyor.

| Toplam / bütçe | Bütçe dengesi |
|---|---|
| ≤ 0,75 | 92 |
| ≤ 0,95 | 84 |
| ≤ 1,00 | 76 |
| ≤ 1,15 | 58 |
| ≤ 1,35 | 42 |
| > 1,35 | 25 |

- Genel skor: `0,42 × ihtiyaç uyumu + 0,34 × parça uyumu + 0,18 × bütçe dengesi + 0,06 × (100 − risk)`.
- Karar: 78 ve üstü **al**, 60-77 **düşün**, altı **alma**.
- Satın alma sırası: önce "ana" ürün, sonra tamamlayıcılar, en son opsiyoneller; aynı roldekiler uyuma göre
  azalan, sonra fiyata göre artan sırada.

Kod: [`kombin_router.py`](../services/ai-service/buyer/kombin_router.py).

## Paket önerisi

Gerçek sistemde aday ürünlere anlamsal uyum puanını Gemini veriyor; `zekai-api` en yüksek üç öneriyi alıyor ve
sonucu satıcının ürün listesinin özetine göre önbelleğe yazıyor. `commerce-api` içinde ise ilk sürümden kalan
deterministik bir puanlayıcı duruyor: kategori tamamlayıcılığı (8-35), ortak anahtar kelime (en çok 15), fiyat
oranı (2-20), stok (en çok 10) ve puan/yorum (en çok 15). Bu puanlayıcıda sunumda öne çıksın diye beş ürün
çiftine sabit bir bonus (+18/+20) eklemiştik; gerçek bir mağazada olmaması gereken bir kısayol olduğunu
[sınırlar](12-sorular-ve-sinirlar.md#bilinen-sınırlar) bölümünde de yazdım. Tarayıcı içi demo bu deterministik
puanlayıcının portunu kullanıyor.
