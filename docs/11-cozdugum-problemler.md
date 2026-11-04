# Çözdüğüm problemler

Bu sayfada projedeki en öğretici problemleri kısa hikâyeler olarak topladım. Her birinde önce problemi, sonra
çözümü ve neden o çözümü seçtiğimi anlatıyorum. Ayrıntılar ilgili dokümanlarda ve kodda.

## 1. Bir mağazaya bağlanmak için önce bir mağaza yazmak

**Problem.** ZekAI'ın asıl değeri satıcının ürünlerini okuyup iyileştirmek. İlk prototipte "mağaza" ZekAI'ın
içinde sahte bir veri katmanıydı; entegrasyon diye gösterdiğimiz şey aslında bir fonksiyon çağrısıydı.

**Çözüm.** Mağazayı kendi veritabanı ve kimlik sistemi olan bağımsız bir ürüne, Akıllı Market'e ayırdım. ZekAI
ona yalnızca HTTP üzerinden, satıcının API anahtarıyla bağlanıyor.

**Neden böyle.** Gerçek bir satıcı aracı pazar yerinin veritabanını göremez; API'sine bağlanır. Bu ayrım bize
gerçek entegrasyon sorularını erkenden sordurdu: anahtar nasıl verilir, bağlantı nasıl kesilir, iki taraf nasıl
tutarlı kalır. Bedeli iki kimlik sistemi ve iki veritabanı. Ayrıntı: [Mimari](03-mimari.md#neden-iki-ayrı-ürün).

## 2. Aynı başlıkta iki tür kimlik

**Problem.** `commerce-api`'yi iki tür istemci çağırıyor: Akıllı Market'in kendi arayüzü (kullanıcı JWT'siyle) ve
ZekAI (satıcının API anahtarıyla). İkisi de `Authorization: Bearer ...` başlığını kullanıyor.

**Çözüm.** Bir "policy scheme" token'ın biçimine bakıyor: içinde nokta varsa JWT doğrulayıcısına, yoksa API
anahtarı doğrulayıcısına yönlendiriyor. Anahtarla gelen istek o satıcının kimliği ve `Seller` rolüyle
işleniyor; controller'lar iki yolu ayırt etmek zorunda kalmıyor.
Kod: [`Program.cs`](../services/commerce-api/src/ZekAI.Api/Program.cs), [`ApiKeyAuthHandler`](../services/commerce-api/src/ZekAI.Api/Auth/ApiKeyAuthHandler.cs).

**Neden böyle.** Ayrı bir başlık (`X-Api-Key`) da olurdu. Aynı başlıkta tutmak, ZekAI'ın pazar yerine sıradan bir
satıcı gibi istek atmasını sağladı ve satıcı controller'larında hiçbir değişiklik gerektirmedi. Bedeli, ayrımın
token biçimine dayanması: noktalı bir API anahtarı üretilirse yanlış yola gider. Anahtarları biz ürettiğimiz için
(`am_live_` ve GUID) bu bugün güvenli.

## 3. Yedi ajandan tek çağrıya

**Problem.** Alıcı analizinin ilk sürümü Google ADK ile kurulmuş yedi ajanlı bir hattı; kombin analizi de beş
ayrı Gemini çağrısı yapıyordu. Her analiz yedi çağrının maliyetini, gecikmesini ve hata ihtimalini taşıyordu.

**Çözüm.** Yarışmanın son günü iki hattı da yeniden yazdım: tek bir yapılandırılmış "danışman" çağrısı, yalnızca
danışman isterse Google Arama ile piyasa kontrolü ve sonunda kodla verilen karar. Kombin beş çağrıdan bire indi.

**Neden böyle.** Uzman ajanların hepsi aynı girdiye (ürün, yorumlar, ihtiyaç) bakıyordu; tek bir yapılandırılmış
çağrı aynı alanları tek seferde doldurabiliyor. Bedeli, her konuya daha derin bakan uzman ajanları kaybetmek. Ayrıntı: [Yapay zekâ hattı](07-yapay-zeka.md#2-gerektiği-kadar-çağır).

## 4. Satın alma kararını modele bırakmamak

**Problem.** Model aynı soruya iki kez farklı cevap verebilir ve "neden?" sorusuna güvenilir bir cevap vermez.

**Çözüm.** Model yalnızca skor ve kanıt üretiyor; "Alabilirsin / Dikkatli İlerle / Alternatife Bak" kararını
açık eşiklerle çalışan saf bir fonksiyon veriyor. Ekrandaki "Neden bu sonuç?" listesi kararı doğuran kuralların
kendisi. Kod: [`decision_engine.py`](../services/ai-service/buyer/decision_engine.py).

**Neden böyle.** Aynı skorlar her zaman aynı kararı veriyor ve kural motoru modelden bağımsız test edilebilir.
Bedeli, eşiklerin veriyle değil sezgiyle seçilmiş olması.

## 5. Aynı soruya iki kez para ödememek

**Problem.** Alıcı aynı ürünü aynı ihtiyaçla tekrar açtığında ya da satıcı aynı ürün için tekrar içerik
istediğinde Gemini'ye yeniden gidiliyordu.

**Çözüm.** Her pahalı çıktıyı girdisinin SHA-256 özetiyle saklıyorum. Analiz anahtarında ürünün parmak izi var:
fiyat, stok, başlık, açıklama, puan ve yorum sayısı. Ürün değişince anahtar da değişiyor; önbelleği temizleyen
ayrı bir kod yok. Kod: [`BuyerService`](../services/zekai-api/src/ZekAI.Infrastructure/Services/BuyerService.cs).

**Neden böyle.** "Önbelleği ne zaman temizlemeli?" sorusunu sormak yerine anahtarı, sonucu değiştiren her şeyden
türettim. Bedeli, temizlenmeyen önbellek tablolarının zamanla büyümesi.

## 6. Kota dolduğunda kullanıcıyı kandırmamak

**Problem.** Gemini'nin ücretsiz katmanında kota çabuk doluyor ya da model geçici olarak cevap veremiyor. Bu
durumda satıcı ekranları boş bir hatayla kalabiliyordu.

**Çözüm.** Satıcı araçları kota ya da geçici hatada örnek bir cevap dönüyor, ama onu `_mock: true` ile
işaretliyor; arayüz bunu görünce sarı bir uyarı gösteriyor. Alıcı analizi ise örnek cevap uydurmuyor, açık bir
hatayla bitiyor.

**Neden böyle.** Bir satıcının örnek bir başlığı görmesi zararsız; bir alıcının uydurulmuş bir "Alabilirsin"
görmesi değil. Bedeli, yedeklerin de önbelleğe girebilmesi; bunu [sınırlara](12-sorular-ve-sinirlar.md#bilinen-sınırlar)
yazdım.

## 7. Uzun AI cevabını beklemeden göstermek

**Problem.** Bir analiz iki model çağrısı içerebiliyor. Boş bir ekranda beklemek, ürünün "çalışmıyor" gibi
görünmesine yol açıyordu.

**Çözüm.** AI servisi her adımda bir Server-Sent Event gönderiyor. `zekai-api` akışı satır satır tarayıcıya
aktarıyor ve aradan son raporu yakalayıp önbelleğe yazıyor. Tarayıcı, `POST` gövdesi ve `Authorization`
başlığı gerektiği için `EventSource` yerine `fetch` ile bir `ReadableStream` okuyor.
Kod: [`BuyerController.AnalyzeBuyer`](../services/zekai-api/src/ZekAI.Api/Controllers/BuyerController.cs).

**Neden böyle.** Akış tek yönlü; WebSocket gereksiz karmaşıklık olurdu. Bedeli, kopan bağlantının otomatik
olarak devam etmemesi.

## 8. Paket indirimini kuruşu kuruşuna paylaştırmak

**Problem.** "İkisini birlikte al, %5 indirim" kampanyasında indirim hangi ürüne yazılacak? Tek ürüne yazılırsa
o ürün iade edildiğinde hesap bozulur.

**Çözüm.** İndirimi iki ürüne fiyatlarıyla orantılı paylaştırıyoruz; her sepet ve sipariş satırı kendi
indirimini taşıyor. Sepette paket, adedi her zaman eşit iki bağlı satır; biri silinirse ikisi birden siliniyor.
Bir ürün çiftine aynı anda tek aktif paket kurulabiliyor; bunu arşivlenmiş paketleri hariç tutan kısmi bir
unique index sağlıyor. Paketin satıcı tarafındaki akışını ve Gemini önbelleğini Ayşe yazdı.
Formül ve örnek: [İş kuralları](05-is-kurallari.md#paket-birlikte-sat-indirimi).

## 9. Satıcının değişikliğini vitrine anında taşımak

**Problem.** Akıllı Market'in ürün sayfasındaki yorumlar 30, SSS bölümü 60 saniye Next.js'in veri önbelleğinde
kalıyor. Satıcı bir yoruma cevap ya da yeni bir SSS yayınladığında alıcı bir dakikaya kadar eski sayfayı
görebiliyordu.

**Çözüm.** `commerce-api` her ürün değişikliğinden sonra Akıllı Market'in `/api/revalidate` ucunu çağırıyor;
Next.js ana sayfayı ve o ürünün sayfasını yeniden üretiyor. Ayşe'nin Müşteri Sesi modülü de yayınlanan yorum
cevaplarını bu yolla anında vitrine taşıyor.
Kod: [`revalidate/route.ts`](../apps/akilli-market-web/src/app/api/revalidate/route.ts).

**Neden böyle.** Bölümleri önbelleksiz yapmak yerine önbelleği değişiklik anında geçersiz kılmak, hem hızlı
sayfa hem taze veri veriyor. Bedeli, yenileme sırrının istemci koduna da gömülmüş olması
([Güvenlik](06-guvenlik.md#bilinen-eksikler)).

## 10. Ölü bir canlı demoyu tarayıcıya taşımak

**Problem.** Yarışmadan altı ay sonra Render'daki servisler `503` dönüyordu; canlı sitede kimse giriş yapamıyordu.

**Çözüm.** İki arayüzün bütün ağ çağrılarını tek bir `transport` fonksiyonuna topladım ve Vercel derlemesinde
bu fonksiyonu aynı sözleşmeyi tarayıcıda karşılayan bir demo katmanına bağladım. Kurallar üretim kodunun portu,
veri seeder'dan üretilmiş katalog. Ayrıntı: [Yayın stratejisi](09-yayin-stratejisi.md).

**Neden böyle.** Sunucu kiralamadan her zaman açık bir demo, gerçek koda dokunmadan. Bedeli, kuralların iki yerde
yaşaması.

## 11. Türkçe yorumlarda "ama" sorunu

**Problem.** Demonun kural tabanlı danışmanını ilk yazdığımda kulaklık analizinde "mikrofon yorumlarda olumlu,
ses kalitesinde şikâyet var" dedi; gerçek tam tersiydi. Sebep şu yorumdu: "Müzik dinlemek için harika, ama online
toplantılarda mikrofon biraz zayıf kalıyor." Cümle düzeyinde bakınca iki yargı birbirine karışıyordu; "fena
değil" ifadesindeki "değil" de olumsuz sayılıyordu.

**Çözüm.** Yorumları "ama, ancak, fakat" ile yan cümlelere bölüyorum ve her yan cümleye yalnızca tek bir konu
geçiyorsa o konuya kanıt sayıyorum. İpucu listesini de gerçek yorumlara bakarak düzelttim. Aynı gün ikinci bir
hata buldum: bir ofis sandalyesi "müzik ve toplantı" ihtiyacında 54 uyum alıp bir kulaklığı geçiyordu. Artık
ihtiyacın hiçbir konusu üründe ya da yorumlarında geçmiyorsa uyum en fazla 35 oluyor.
Kod: [`engine-buyer.ts`](../apps/zekai-platform-web/src/demo/engine-buyer.ts), [`text.ts`](../apps/zekai-platform-web/src/demo/text.ts).

**Neden böyle.** Kural tabanlı bir motor dili anlamaz; ancak gerçek veriyle sınanınca nerede yanıldığı görünür.
Bu iki hatayı ekran görüntülerini hazırlarken sonuçları okuyarak buldum. Bedeli, motorun hâlâ ironiyi ve listede
olmayan konuları görememesi.

## 12. Ekranda duran sahte rakamlar

**Problem.** Demoyu denetlerken simülasyon önizlemesinde bir tutarsızlık gördüm: her ürün, gerçek puanı ve yorum
sayısı ne olursa olsun "4.7 puan, 128 değerlendirme, yarın kargo, 2 yıl garanti" gösteriyordu. Yarışma haftasında
tasarımı doldurmak için yazılmış yer tutucu değerlerdi, ama ekranda gerçek veri gibi duruyorlardı. Tanıtım
sayfası da artık var olmayan sekiz ajanlı hattı anlatıyordu.

**Çözüm.** Önizleme artık ürünün kendi puanını, yorum sayısını, kargo metnini ve özelliklerindeki garanti
bilgisini gösteriyor; bilgi yoksa "Garanti bilgisi yok" yazıyor. Tanıtım metnini gerçek hatla hizaladım, var
olmayan sayfalara giden alt bilgi bağlantılarını ve hiçbir şey yapmayan Google/Apple giriş düğmelerini kaldırdım.
Sonra arayüzde sabit yazılmış başka bir rakam kalıp kalmadığını taradım.
Kod: [`SellerSimulation.tsx`](../apps/zekai-platform-web/src/components/seller-studio/SellerSimulation.tsx),
[`ZekaiLanding.tsx`](../apps/zekai-platform-web/src/components/landing/ZekaiLanding.tsx).

**Neden böyle.** Bu rakamlar demoyu daha dolu gösteriyordu; ama projeye bakan biri bir tanesinin sahte olduğunu
fark ederse ekrandaki diğer sayılardan da şüphelenir. "Ekrandaki her sayı ya veriden gelir ya da hiç
gösterilmez" kuralını bu yüzden koydum. Bedeli, az yorumlu ürünlerde önizlemenin daha sade görünmesi.
