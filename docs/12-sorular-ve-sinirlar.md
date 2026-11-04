# Sorular ve sınırlar

Bu sayfayı mülakattan önce hızlıca tekrar etmek için yazdım. Önce bana sorulabilecek soruları ve kısa
cevaplarımı, sonra projenin bilinen sınırlarını ve bir sonraki adımda neyi hangi sırayla düzelteceğimi topladım.

## Olası mülakat soruları

### Mimari

**Bu bir mikroservis mimarisi mi?**
Tam olarak değil. İki ayrı ürün (Akıllı Market ve ZekAI) ve ZekAI'ın kullandığı bir yapay zekâ servisi var. Her
ürün kendi veritabanının sahibi ve birbirleriyle yalnızca HTTP üzerinden konuşuyorlar. Ayırmamın sebebi ölçek
değil, sahiplik: bir pazar yeri ile ona bağlanan satıcı aracı gerçekte de iki ayrı şirketin sistemi olur. Mesaj
kuyruğu ya da servis keşfi yok. Ayrıntı: [Mimari](03-mimari.md#neden-iki-ayrı-ürün).

**Neden AI servisi Python, API'ler .NET?**
Gemini için kullandığımız Google GenAI SDK'sı ve ADK Python'da. İş kuralları, kimlik ve veri tarafında ise EF Core
migration'ları ve tip güvenli DTO'larla .NET'i kullandık. Tarayıcı AI servisini hiç görmüyor; her şey `zekai-api`
üzerinden geçiyor. Bedeli iki dil, iki bağımlılık zinciri ve iki ayrı Docker imajı.

**İki servis arasındaki tutarlılığı nasıl sağlıyorsun?**
Bugün sıraya güveniyorum: `zekai-api` önce kendi kaydını yazıyor, sonra `commerce-api`'ye istek atıyor. İkinci
adım başarısız olursa iki taraf bir süre farklı kalabilir. Doğrusu bir outbox tablosu ve yeniden deneyen bir arka
plan işi; uç noktaların da tekrar çağrılmaya dayanıklı (idempotent) olması. Ayrıntı: [Veritabanı](04-veritabani.md).

### Yapay zekâ

**Kararı neden modele bırakmadın?**
Model aynı soruya iki kez farklı cevap verebilir ve "neden?" sorusuna güvenilir bir cevap vermez. Model yalnızca
skor ve kanıt üretiyor; kararı açık eşiklerle çalışan saf bir fonksiyon veriyor. Böylece aynı skorlar her zaman aynı
kararı veriyor ve ekrandaki gerekçe, kararı doğuran kuralın kendisi oluyor. Ayrıntı:
[Yapay zekâ hattı](07-yapay-zeka.md#1-model-skor-üretir-kararı-kod-verir).

**Yedi ajandan tek çağrıya inince kalite düştü mü?**
Bunu sistematik olarak ölçmedim; elimde bir değerlendirme seti yok. Kararı maliyet, gecikme ve hata noktası
sayısına bakarak verdim: yedi çağrı yerine bir, gerekirse iki. Doğru yol, gerçek ürün ve ihtiyaç çiftlerinden
küçük bir değerlendirme seti kurup iki hattı aynı set üzerinde karşılaştırmak olurdu.

**Önbelleği nasıl geçersiz kılıyorsun?**
Geçersiz kılmıyorum; anahtarı, sonucu değiştiren her şeyden türetiyorum. Analiz anahtarında ürünün parmak izi var
(fiyat, stok, başlık, açıklama, puan, yorum sayısı). Ürün değişince anahtar da değişiyor ve eski kayıt kendiliğinden
kullanılmaz hâle geliyor. Bedeli, süresi dolan kayıtları temizleyen bir iş olmadığı için tabloların büyümesi.

**Gemini kotası dolarsa ne oluyor?**
Satıcı araçları örnek bir cevap dönüyor ve onu `_mock: true` ile işaretliyor; arayüz sarı bir uyarı gösteriyor.
Alıcı analizi ise örnek cevap uydurmuyor, açık bir hatayla bitiyor; çünkü uydurulmuş bir "Alabilirsin" bir satın
almayı etkiler. Bilinen eksik: yedek cevaplar da taslak olarak saklanabiliyor.

**Yorumlar modele giriyor; prompt injection riski yok mu?**
Var. Yorumlar kullanıcı içeriği ve bir yorum talimat içerebilir. Riski iki şey sınırlıyor: model şemaya bağlı JSON
dışında bir şey dönemiyor ve kararı model değil kod veriyor; kötü niyetli bir yorum en fazla skorları
etkileyebilir. Bunun dışında özel bir savunmam yok. Yapılacak ilk şey, uç skorları ve kanıtı olmayan uyarıları
kodda yakalamak olurdu.

### Veri ve iş kuralları

**Paket indiriminde yuvarlama hatası olabilir mi?**
Olabilir. Toplam indirim yuvarlanıyor, sonra her ürünün payı ayrı ayrı yuvarlanıyor. Fiyatı 100,10 TL olan iki
ürünlük bir pakette %5 indirim 10,01 TL; her ürünün payı 5,005 TL ve C#'ın varsayılan yuvarlaması ikisini de
5,00'a indiriyor. Müşteri 10,01 yerine 10,00 TL indirim alıyor. Çözüm, kalan kuruşu son satıra yazmak.
Kod: [`CartService.UpsertBundleItem`](../services/commerce-api/src/ZekAI.Infrastructure/Services/CartService.cs).

**Aynı anda iki kişi son ürünü alırsa?**
Bugün ikisi de alabilir; stok düşümünde eşzamanlılık kontrolü yok. İki çözüm düşünürdüm: satıra PostgreSQL'in
`xmin` sürüm kolonuyla iyimser kilit koyup çakışan siparişi `409` ile reddetmek ya da stoğu
`UPDATE ... WHERE Stock >= adet` ile tek sorguda düşmek. Ayrıntı: [Güvenlik](06-guvenlik.md#bilinen-eksikler).

**Ürün kimliği neden GUID değil de slug?**
Alıcı ZekAI'a bir ürün linki yapıştırıyor; linkin son parçası ürünü bulmaya yetiyor, ek bir arama gerekmiyor.
Bedeli, başlık değişse de slug'ın aynı kalması. Ayrıntı: [Veritabanı](04-veritabani.md#1-ürün-kimliği-okunur-bir-slug).

### Güvenlik

**JWT ile API anahtarı aynı başlıkta; bu güvenli mi?**
Ayrımı token'ın biçimi yapıyor: noktalı token JWT doğrulayıcısına, noktasız token API anahtarı doğrulayıcısına
gidiyor. Anahtarları biz ürettiğimiz için bu bugün güvenli. Asıl zayıflık başka: anahtarlar veritabanında düz metin
duruyor. Yalnızca özetini saklamak gerekiyor. Ayrıntı: [Güvenlik](06-guvenlik.md#mağaza-bağlantısı-satıcının-api-anahtarı).

**Token'lar neden `localStorage`'da?**
Hackathon hızında en kısa yol oydu. Bir XSS açığı token'ı okuyabilir. Doğrusu HttpOnly çerez ve kısa ömürlü erişim
token'ı; bu ve diğer eksikler [Güvenlik](06-guvenlik.md#bilinen-eksikler) sayfasındaki tabloda.

### Süreç

**İki kişilik ekipte işi nasıl böldünüz?**
Takım kaptanıydım. Mimariyi, alıcı tarafını ve Seller Studio'nun AI akışlarını ben yazdım; Ayşe satıcı paneli
yerleşimini, paket önerisi akışını, sosyal içerik çalışma alanını ve Müşteri Sesi modülünü yazdı. Ayşe'nin işleri
sekiz pull request olarak geldi; yedisini inceleyip birleştirdim. Ayrıntı: [Hikâye](01-hikaye.md#kim-ne-yaptı).

**Kodun bir kısmını yapay zekâyla yazdın; kodu ne kadar biliyorsun?**
Kodun önemli bir kısmını yapay zekâyla (Claude Code) birlikte, kendi koyduğum kurallar altında yazdım. Mimariyi,
modele neyi bırakacağımızı ve kuralları ben belirledim; yapay zekâ yazımı hızlandırdı. Bu dokümanları yazarken her
iddiayı koddan yeniden doğruladım ve bulduğum eksikleri gizlemedim.

**Test neden yok? İlk neyi test ederdin?**
Hackathon haftasında özelliklere öncelik verdik ve test yazmadık; bu bir eksik. İlk olarak saf fonksiyonları test
ederdim: karar motoru, fiyat adaleti, iade riski ve paket fiyatlaması (yuvarlama dahil). Aynı test vakalarını
demodaki TypeScript portuna da koştururdum; iki taraf ayrışırsa test kırılırdı. Sonra PostgreSQL'e karşı çalışan
entegrasyon testleri: kimlik (JWT ve API anahtarı), sepet ve sipariş.

**Baştan yapsan neyi farklı yapardın?**
Kurallara ilk günden test yazardım, sırları yalnızca ortam değişkeninden okurdum ve hattı yedi ajandan bire
indirmeden önce bir değerlendirme seti kurardım. Servis sınıflarını da büyümeden bölerdim.

## Bilinen sınırlar

| Sınır | Ayrıntı |
|---|---|
| Test yok | Hiçbir kural otomatik olarak korunmuyor. |
| Büyük dosyalar | Migration'lar hariç 35 kaynak dosyası 300 satırı geçiyor. En büyükleri seed verisi ([`DataSeeder.cs`](../services/commerce-api/src/ZekAI.Infrastructure/Seeders/DataSeeder.cs), 1.506 satır), `zekai-api` [`SellerService`](../services/zekai-api/src/ZekAI.Infrastructure/Services/SellerService.cs) (1.401), [`SellerDrafts.tsx`](../apps/zekai-platform-web/src/components/seller-studio/SellerDrafts.tsx) (1.348) ve `commerce-api` `SellerService` (1.089). |
| Güvenlik eksikleri | Düz metin sırlar ve anahtarlar, rol kontrolü olmayan uç noktalar, istek sınırı yok; on iki maddelik tablo [Güvenlik](06-guvenlik.md#bilinen-eksikler) sayfasında. |
| Servisler arası tutarlılık | Ortak transaction ya da outbox yok; bir yayın yarıda kalırsa iki taraf bir süre farklı kalabilir. |
| Yedek cevaplar önbellekte | Kota dolduğunda dönen örnek cevaplar da taslak olarak saklanabiliyor; Gemini düzeldikten sonra aynı istek yedeği geri getirebiliyor. |
| Paket puanlayıcısındaki sabit bonus | `commerce-api` puanlayıcısı sunumda öne çıksın diye beş ürün çiftine +18/+20 ekliyor; demodaki port da aynı bonusu taşıyor. Gerçek bir mağazada olmaması gereken bir kısayol. |
| Paket indiriminde kuruş farkı | Paylar ayrı yuvarlandığı için toplam indirim bir kuruş sapabiliyor. |
| ADK'nin ölü yolu | Yedi ajanlı eski hat [`buyer_agent/agent.py`](../services/ai-service/buyer_agent/agent.py) içinde duruyor ve `zekai-api` üzerinden çağrılabiliyor; arayüz kullanmıyor. |
| Bellek içi önbellekler | `ai-service` önbellekleri servis yeniden başlayınca kayboluyor ve birden fazla kopya arasında paylaşılmıyor. |
| Paket sürümleri | İki API de .NET 10'u hedefliyor, ama `commerce-api` EF Core 10, `zekai-api` EF Core 9 paketleriyle çalışıyor. |
| Kullanılmayan altyapı | Docker imajı ve `init.sql` pgvector'ü kuruyor ama hiçbir tablo vektör kullanmıyor. |
| Migration uyarısı kapalı | `commerce-api` açılışta `PendingModelChangesWarning` uyarısını bastırıyor. |
| Demo sınırları | Kural tabanlı danışman dili anlamıyor; iki demo sitesi birbirinden habersiz; katalog seed'den bir kez üretildi. Ayrıntı: [Yayın stratejisi](09-yayin-stratejisi.md#bedeli). |
| Arayüz borçları | SSE okuma kodu dört dosyada tekrar ediyor; kullanılmayan bağımlılıklar ve iki kilit dosyası var; arayüz yalnızca Türkçe. Ayrıntı: [Arayüz ve tasarım](08-arayuz-ve-tasarim.md#bilinen-borçlar). |
| Ölçüm yok | Yük testi yapmadık; performans hakkında ölçülmüş bir sayı veremiyorum. |

## Yol haritası

Öncelik sırasıyla:

1. **Testler.** Karar motoru, skor fonksiyonları ve paket fiyatlaması için tablo tabanlı birim testleri; aynı
   vakaları demodaki TypeScript portunda da koşturmak.
2. **Güvenliğin hızlı kazanımları.** Sırları yalnızca ortamdan okumak; yenileme token'ının ve API anahtarının
   yalnızca özetini saklamak; `zekai-api` satıcı uçlarına rol kontrolü; AI uçlarına istek sınırı; vitrin yenilemeyi
   yalnızca sunucudan tetiklemek; ADK geliştirici arayüzünü kapatmak.
3. **Eşzamanlılık.** Stokta iyimser kilit ve çakışan siparişe `409`; çakışmayan sipariş numarası.
4. **Tutarlılık.** Pazar yerine yayın için outbox ve yeniden deneme.
5. **Temizlik.** ADK yolunu kaldırmak; yedek cevapları taslak önbelleğinin dışında tutmak; önbellek tablolarını
   temizleyen bir iş; paket puanlayıcısındaki sabit bonusu kaldırmak; tek kilit dosyası.
6. **Yeniden yapılanma.** `SellerService` ve `SellerDrafts.tsx`'i bölmek; ortak bir SSE okuyucu; RFC 9457 Problem
   Details ve genel bir hata yakalayıcı.
7. **Kuruş farkı.** Paket indiriminde kalan kuruşu son satıra yazmak.
