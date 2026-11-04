# Yapay zekâ hattı: Gemini'yi kontrollü kullanmak

ZekAI'ın bütün ürünü yapay zekâ üzerine kurulu. Bu yüzden projedeki en önemli mühendislik sorusu "modeli nasıl
çağırırım?" değil, "modele neyi bırakırım, neyi bırakmam?" oldu. Bu sayfada verdiğim cevapları anlatıyorum.

## Neler yapay zekâyla çalışıyor?

[`ai-service`](../services/ai-service) 12 uç nokta sunuyor; varsayılan model `gemini-2.5-flash-lite`.

| Uç nokta | Ne üretiyor | Not |
|---|---|---|
| `/buyer/analyze` | Uyum, güven, fiyat ve iade skorları, kanıtlı uyarılar | SSE; gerekirse Google Arama ile piyasa kontrolü |
| `/buyer/kombin-analyze` | Birden çok ürünün birlikte uyumu | SSE |
| `/buyer/compare-verdict` | 2-3 analiz arasında kazanan ve gerekçe | SSE |
| `/seller/ai-content` | Başlık, açıklama, özellik maddeleri | Simülasyon sonucunu girdi olarak alabiliyor |
| `/seller/simulate`, `/seller/simulate-stream` | Beş müşteri profilinin kararı ve gerekçesi | Akışlı sürüm kişi kişi gönderiyor; yedek model `gemini-2.5-flash` |
| `/seller/social-content` | Instagram, TikTok ve X metinleri | |
| `/seller/ai-image`, `/seller/ai-images` | Stüdyo, kutu açma ve kullanım görselleri | `gemini-3.1-flash-image-preview` |
| `/seller/bundle-recommend` | Tamamlayıcı ürünlere anlamsal uyum puanı | |
| `/seller/customer-voice` | Yorum cevap taslakları ve SSS önerileri | |
| `/seller/seo` | Anahtar kelime ve meta önerileri | Uç nokta hazır, arayüzde kullanılmıyor |

## 1. Model skor üretir, kararı kod verir

**Problem.** Bir dil modeli aynı soruya iki kez farklı cevap verebilir. Kodda bunun izi var: puanlama
modülünün açıklaması, fiyat adaleti ve iade riski gibi oynak skorların "aynı girdiyle tekrar çalıştırıldığında
aynı değeri versin diye" kodda hesaplandığını söylüyor. Bir satın alma kararını bu oynaklığa bırakmak istemedim;
üstelik kararın gerekçesini kullanıcıya açıklayabilmeliydik.

**Çözüm.** Görevleri ayırdım. Gemini yalnızca dört skor (uyum, güven, fiyat adaleti, iade riski) ile kanıtlı
uyarılar ve güçlü yönler üretiyor. Prompt'ta açıkça yazıyor: "Final kararı verme; skor, uyarı ve güçlü sinyal
üret. Karar kod tarafında verilecek." Kararı [`decision_engine.py`](../services/ai-service/buyer/decision_engine.py)
içindeki saf bir fonksiyon, açık eşiklerle veriyor; fiyat adaleti ve iade riski de modelden değil,
[`scoring_engine.py`](../services/ai-service/buyer/scoring_engine.py) içindeki formüllerden geliyor. Eşikler:
[İş kuralları](05-is-kurallari.md#alıcı-kararı-karar-motoru).

**Neden.** Aynı skorlar her zaman aynı kararı veriyor. Ekrandaki "Neden bu sonuç?" listesi, kararı doğuran
kuralın kendisi; uydurulmuş bir açıklama değil. Kural motoru modelden bağımsız test edilebilir.

**Bedeli.** Eşikleri veriyle değil, ürün sezgisiyle seçtim. Modelin sezebileceği bazı ince durumlar
(ör. "puanı düşük ama bu kullanıcı için ideal") kuralların içinde kayboluyor.

## 2. Gerektiği kadar çağır

**Problem.** Alıcı analizinin ilk sürümü Google ADK ile kurulmuş yedi ajanlı bir hattı: ihtiyacı anlayan bir
ajan, ardından paralel çalışan dört uzman (ürün gerçekliği, yorum madenciliği, fiyat ve iade riski), sonra
sentez ve doğrulama ajanları. Kombin analizi de beş ayrı Gemini çağrısı yapıyordu. Her analiz yedi çağrı
demekti: maliyet, gecikme ve hata noktası yedi katına çıkıyordu.

**Çözüm.** Yarışmanın son günü iki hattı da yeniden yazdım:

1. **Danışman:** ürünü, ihtiyacı ve en fazla 12 yorumu tek bir yapılandırılmış çağrıda değerlendiriyor.
2. **Piyasa kontrolü:** yalnızca danışman `needs_market_check: true` derse, Google Arama ile ikinci bir çağrı.
   Prompt bunun ne zaman gerektiğini sayıyor: kullanıcı net bir bütçe söylediyse, fiyat kritikse ya da daha iyi
   bir alternatif ihtimali kararı değiştirecekse.
3. **Karar motoru:** kod.

Kombin de aynı şekilde beş çağrıdan bire indi. Kod: [`buyer_router.py`](../services/ai-service/buyer/buyer_router.py),
[`kombin_router.py`](../services/ai-service/buyer/kombin_router.py).

**Bedeli.** Uzman ajanların her biri kendi konusuna daha derin bakabiliyordu; tek danışman daha genel. ADK
tanımları [`buyer_agent/agent.py`](../services/ai-service/buyer_agent/agent.py) içinde hâlâ duruyor ve
`zekai-api` üzerinden çağrılabiliyor, ama arayüz artık onları kullanmıyor. Bu ölü yolu temizlemek yol haritamda.

## 3. Yapılandırılmış çıktı, her iki yönde sınırlar

- Her çağrı `response_mime_type="application/json"` ve bir Pydantic şemasıyla yapılıyor; model serbest metin
  dönemiyor. Skorlar `0-100`, uyarılar en fazla 5, alternatifler en fazla 2, metinler karakter sınırlı.
- Model şemaya uymayan bir cevap verirse kullanıcıya açık bir hata gidiyor: "Gemini beklenen JSON raporu
  üretmedi." Yarım rapor gösterilmiyor.
- Girdi de sınırlı: en fazla 25 yorum, yorum başına 2.000 karakter, açıklama 5.000 karakter. Uzun bir yorum
  listesi faturayı ve gecikmeyi şişiremiyor.
- `temperature` 0,2. Piyasa prompt'unda ayrıca "Kaynak URL boş kalabilir ama uydurma URL yazma" kuralı var.

## Önbellek: aynı soruya iki kez para ödememek

Pahalı her çıktı, girdisinin özetiyle birlikte saklanıyor. Aynı girdi tekrar gelirse Gemini'ye gidilmiyor.

| Çıktı | Önbellek anahtarı | Nerede | Ömür |
|---|---|---|---|
| Ürün analizi | SHA-256(kullanıcı, ürün, normalize edilmiş ihtiyaç, ürün parmak izi) | `zekai_db.AnalysisCaches` | 7 gün |
| İçerik, sosyal, SEO, simülasyon | Ürün imzası ve isteğin özeti (`InputHash`) | Taslak ve çıktı tabloları | Arşivlenene kadar |
| Paket önerisi | Satıcının ürün listesinin özeti | `BundleRecommendationCaches` | 7 gün |
| Simülasyon, kombin, görsel | İsteğin özeti | `ai-service` belleği | 24 saat, 128-256 kayıt |

Analiz anahtarındaki **ürün parmak izi** fiyatı, stoğu, başlığı, açıklamayı, puanı ve yorum sayısını içeriyor.
Satıcı fiyatı değiştirdiğinde ya da yeni bir yorum geldiğinde anahtar kendiliğinden değişiyor; ayrı bir "önbelleği
temizle" kodu gerekmiyor. Kod: [`BuyerService`](../services/zekai-api/src/ZekAI.Infrastructure/Services/BuyerService.cs).

**Bedeli.** Bellek içi önbellekler servis yeniden başlayınca kayboluyor ve birden fazla kopya arasında
paylaşılmıyor. Veritabanındaki önbellek tablolarını temizleyen bir iş yok; süresi dolan kayıtlar birikiyor.

## Hata, kota ve yedek cevap

- **Anahtar yok:** AI uç noktaları `503` ve "GOOGLE_API_KEY tanımlı değil" mesajı dönüyor.
- **Kota ya da geçici hata** (`429`, `500`, `502`, `503`, `504`, zaman aşımı): satıcı araçları örnek bir cevap
  dönüyor ve onu `_mock: true` ile işaretliyor. Arayüz bunu görünce sarı bir uyarı gösteriyor: "Demo modu — AI
  kapasitesi geçici olarak doldu. Bu analiz gerçek Gemini verisi değil." Kullanıcı sahte bir cevabı gerçek
  sanmıyor.
- **Alıcı analizi yedek cevap uydurmuyor.** Karar bir satın almayı etkilediği için Gemini cevap veremezse akış
  açık bir hata olayıyla bitiyor. Piyasa kontrolü başarısız olursa analiz eldeki verilerle devam ediyor ve bunu
  akışta söylüyor.

Bilinen bir eksik: yedek cevaplar da aynı girdi özetiyle taslak olarak saklanıyor (kaynağı `mock` olarak
işaretli). Önbellek araması kaynağa bakmadığı için Gemini düzeldikten sonra aynı istek yedek cevabı geri
getirebiliyor. Paket önerisi önbelleği yedekleri hariç tutuyor; taslaklar için de aynısı yapılmalı.

## Canlı akış (SSE)

Bir analiz iki model çağrısı içerebiliyor ve her biri için 45 saniyelik bir zaman aşımı var. Kullanıcıyı boş bir
ekranla bekletmek yerine her adım bittiğinde bir olay gönderiyoruz: `buyer_advisor`, `market_check`, `decision`.

- **Neden SSE?** Akış tek yönlü; WebSocket'in çift yönlü bağlantısına gerek yok. Düz HTTP olduğu için vekil
  sunuculardan geçiyor; `X-Accel-Buffering: no` başlığıyla ara katmanların tamponlaması kapatılıyor.
- **Vekil:** `zekai-api` cevabı `ResponseHeadersRead` ile açıyor ve satır satır tarayıcıya aktarıyor; aradan
  `final_rapor` olayını yakalayıp önbelleğe yazıyor. Tarayıcı AI servisini hiç görmüyor.
- **Okuma:** Arayüz `EventSource` yerine `fetch` ve `ReadableStream` kullanıyor, çünkü istek bir gövde ve
  `Authorization` başlığı taşıyan bir `POST`.

**Bedeli.** Otomatik yeniden bağlanma yok; bağlantı koparsa analiz baştan başlıyor (önbellekte tamamlanmış bir
sonuç varsa oradan dönüyor). Uzun açık bağlantılar ücretsiz barındırma katmanlarının zaman aşımlarına takılabiliyor.

## Müşteri simülasyonu

Beş profil sabit: bütçe odaklı, kalite arayan, yorumlara bakan, hızlı karar veren ve tasarım odaklı. Her
profilin önemsediği bir "odak alanı" var (fiyat, özellikler, yorumlar, kargo, görseller). Model her profil için
karar, gerekçe, baktığı alanlar, satıcıya öneri ve kısa bir iç ses üretiyor; arayüz bunu ürün kartının o
alanını vurgulayarak canlandırıyor. Simülasyonun sonucu **İçerik Düzenle** ekranına girdi olarak gidebiliyor:
"Simülasyona göre AI ile düzenle" vazgeçen müşterilerin gerekçelerini yanıtlayan bir içerik istiyor.

## Tarayıcı içi demoda yapay zekâ

Canlı demoda Gemini yok. Onun yerine [kural tabanlı bir danışman](../apps/zekai-platform-web/src/demo/engine-buyer.ts)
çalışıyor: ihtiyaç metnindeki konuları (mikrofon, pil, beden, montaj gibi) sabit bir listeden buluyor, yorumları
"ama/ancak" ile ayrılan yan cümlelere bölüyor ve her yan cümlenin olumlu mu olumsuz mu olduğunu basit ipuçlarıyla
belirliyor. Her uyarı, kaynağı olan yorum cümlesini alıntılıyor. Karar motoru, fiyat adaleti, iade riski, kombin
ve paket puanlaması ise üretimdeki kodun [TypeScript portu](../apps/zekai-platform-web/src/demo/engine-decision.ts);
yani demodaki kararlar gerçek sistemle aynı kurallardan çıkıyor. Bu motor Gemini kadar anlamıyor; sınırlarını
[Sorular ve sınırlar](12-sorular-ve-sinirlar.md) sayfasında yazdım.
