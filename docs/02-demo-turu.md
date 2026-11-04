# Demo turu: ZekAI'ı 5 dakikada tanı

Bu sayfayı teknik bilgi gerektirmeden ZekAI'ı gezmek isteyenler için yazdım. Özellikle işe alım sürecinde
projeme bakan İK uzmanlarının, hiçbir şey kurmadan her modülü deneyebilmesini istedim.

## Neye bakıyorsun?

İki site var ve ikisi birlikte bir hikâye anlatıyor:

- **[ZekAI](https://zekai-platformm.vercel.app):** asıl ürün. Alıcıya "bu ürünü alayım mı?" sorusunda, satıcıya
  "ürünüm neden satmıyor?" sorusunda yapay zekâyla yardım eden platform.
- **[Akıllı Market](https://akilli-markett.vercel.app):** ZekAI'ın bağlandığı küçük bir pazar yeri. Trendyol ya
  da Hepsiburada gibi düşün: ürünler, sepet, sipariş ve satıcı paneli burada.

## Nasıl girilir?

1. [zekai-platformm.vercel.app/login](https://zekai-platformm.vercel.app/login) adresini aç.
2. **Satıcı olarak gir** ya da **Alıcı olarak gir** kartına bas. Kayıt, şifre ya da kurulum gerekmez.
3. Her ekranın sağ altında **Canlı demo** rozeti ve **Demoyu sıfırla** düğmesi durur.

Yaptığın her şey yalnızca kendi tarayıcında saklanır. Kimsenin verisini bozamazsın; istediğin an başlangıç
durumuna dönebilirsin.

## Satıcı turu: Mehmet Kaya, Mehmet Elektronik

Mehmet'in Akıllı Market'teki mağazası ZekAI'a bağlı; 12 ürünü hazır.

| # | Nereye git | Ne göreceksin | Arkasında ne var |
|---|---|---|---|
| 1 | **Ürünlerim** | Mağazadaki 12 ürün. "Premium Bluetooth Kulaklık Beyaz"ı aç. | Ürünler pazar yerinin API'sinden, satıcının API anahtarıyla okunur. |
| 2 | **Müşteri Simülasyonu** | Beş farklı müşteri (bütçe odaklı Elif, kalite arayan Mert, yorumları okuyan Zeynep, hızlı karar veren Burak, tasarıma bakan Derya) ürün sayfasını sırayla inceliyor; kimin aldığını, kimin neden vazgeçtiğini görürsün. | Her kişi sayfanın kendi önemsediği kısmına bakar: fiyat, teknik özellik, yorumlar, kargo ya da görseller. |
| 3 | **İçerik Düzenle** | **AI ile İçerik Üret**'e bas: yeni başlık, kısa ve uzun açıklama, özellik maddeleri. **Stüdyo**, **Kutu Açma** ve **Kullanım** düğmeleri ürün görseli üretir. | Üretilen içerik bir taslak olarak saklanır; aynı ürün için tekrar istersen kayıtlı taslak döner. |
| 4 | **Birlikte Sat** | **Kampanya Önerisi Üret** ile kulaklıkla birlikte satılabilecek ürünler ve indirimli paket önerisi. | Paket indirimi, iki ürüne fiyatlarıyla orantılı paylaştırılır. |
| 5 | **Müşteri Sesi AI** | **AI ile Analiz Et**: her yoruma bir cevap taslağı ve yorumlardan çıkarılmış Sık Sorulan Sorular. **Yayınla** ile cevap yoruma eklenir. | Şikâyet içeren yorumlar "cevap gerekli" diye işaretlenir. |
| 6 | **Sosyal Medya İçeriği** | Ton (profesyonel, samimi, mizahi), amaç ve platform seç; Instagram, TikTok ve X için metinler. | Taslaklar saklanır; bir tanesi ürünün aktif içeriği olarak işaretlenebilir. |
| 7 | **Kayıtlarım** | Bütün AI taslakları ve çıktıları; geri yükle, arşivle, yayınla. | Pahalı AI çıktıları bir kez üretilip yeniden kullanılır. |

## Alıcı turu: Burak Yılmaz

Burak bir haftadır ZekAI kullanıyor: dört kayıtlı analizi, bir karar odası ve bir kombini var.

| # | Nereye git | Ne göreceksin | Arkasında ne var |
|---|---|---|---|
| 1 | **Dashboard** | Ürün linkini yapıştırdığın arama çubuğu. Örnek: `https://akilli-markett.vercel.app/product/kulaklik-anker-soundcore-q45` | Link, pazar yerindeki ürün sayfasının adresi. |
| 2 | **İhtiyacını yaz** | "Uzun yolculuklarda müzik dinleyeceğim, pil ömrü önemli, bütçem 2.000 TL" gibi bir cümle yaz. | İhtiyaç serbest metin; menüden seçim yok. |
| 3 | **Analiz akışı** | Adımlar canlı ilerler: ürün ve ihtiyaç değerlendirmesi, gerekirse piyasa kontrolü, karar. | Sonuç sunucudan parça parça (canlı akış) gelir. |
| 4 | **Karar** | Alabilirsin, Dikkatli İlerle ya da Alternatife Bak; altında "Neden bu sonuç?" ve yorumlardan alıntılanmış kanıtlar. | Kararı yapay zekâ değil, açık eşiklerle çalışan bir kural motoru verir. |
| 5 | **Kaydedilenler** | Dört kayıtlı analiz; her birinde durum (Düşünüyorum, Karşılaştırıyorum, Fiyat Bekleniyor) ve not. | |
| 6 | **Karşılaştır** | Kaydedilenler'de iki kulaklığın **Karşılaştır** düğmesine bas, sonra ihtiyacını yazıp karşılaştır. | Kazanan ürün ve her ürün için tek cümlelik gerekçe. |
| 7 | **Karar Odaları** | "Ev ofisi kurulumu": 15.000 TL bütçeli bir alışveriş projesi ve ona bağlı analizler. | |
| 8 | **Kombinler** | "Sabah koşusu kombini": ayakkabı, saat ve kılıfın birlikte değerlendirmesi, kombin skoru ve satın alma sırası. | |

## Akıllı Market turu

[akilli-markett.vercel.app/login](https://akilli-markett.vercel.app/login) adresinde de iki kart var:

- **Alıcı olarak gir (Burak Yılmaz):** Bir ürün aç, **Paket Fırsatları**'ndaki "Günlük Teknoloji Paketi"ni sepete
  ekle; sepette indirimin iki ürüne paylaştırıldığını gör. Siparişi tamamla; **Siparişlerim**'de yoldaki
  siparişi **Teslim Aldım** ile kapat. Aldığın bir ürüne yorum yazarsan yorumun yanında doğrulanmış alım işareti çıkar.
- **Satıcı olarak gir (Mehmet Kaya):** Ürünleri listele, yeni ürün ekle ya da düzenle. Panelde ZekAI'a bağlanmak
  için kullanılan API anahtarı da görünür.

## Bu demo gerçek sistemin kendisi mi?

Canlı demo, arayüzlerin tarayıcıda çalışan bir sürümü. Gerçek sistem iki ASP.NET Core API'si, bir Python yapay
zekâ servisi ve PostgreSQL ile çalışıyor. Bunları sürekli açık tutmak para gerektirdiği için herkesin projeyi her
an deneyebilmesi adına bu demo modunu kurdum. Demo, gerçek API'lerle birebir aynı istek ve cevap biçimini
kullanıyor; ekranlar iki modda da aynı kod. Ayrıntısı: [Yayın stratejisi](09-yayin-stratejisi.md).

Demo ile gerçek sistem arasındaki farklar:

- **Yapay zekâ cevapları.** Gerçek sistemde ürün analizini, içeriği ve müşteri simülasyonunu Google Gemini
  üretir. Demoda bunun yerine yorum cümlelerini konu konu eşleştiren kural tabanlı bir motor çalışır; her uyarı
  kaynağı olan yorumu alıntılar. Son kararı veren motor ise iki modda da aynı kurallar.
- **Piyasa kontrolü.** Gerçek sistem Google Arama ile Türkiye'deki fiyatlara bakar; demo, pazar yeri
  kataloğundaki benzer ürünlerle karşılaştırır.
- **Görsel üretimi.** Gerçek sistem Gemini ile yeni bir ürün çekimi üretir; demo ürünün kendi fotoğrafından
  tarayıcıda stüdyo, kutu açma ve kullanım kompozisyonları hazırlar.
- **İki site ayrı çalışır.** Gerçek sistemde ZekAI'dan yayınladığın içerik Akıllı Market'teki ürün sayfasına
  anında yansır. Demoda iki site farklı adreslerde, farklı tarayıcı depolarında çalıştığı için bu bağ yoktur.

Gerçek sistemi kendi bilgisayarında çalıştırmak için: [Çalıştırma ve API](10-calistirma-ve-api.md).
