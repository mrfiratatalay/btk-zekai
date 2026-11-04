# Hikâye: bir hackathon haftası, sonra vitrin

## Yarışma

ZekAI'ı **HackAthon'26** için geliştirdik. Yarışma BTK Akademi, Google ve Girişimcilik Vakfı'nın ortak
etkinliğiydi; tema e-ticaret odaklı bir yapay zekâ uygulamasıydı. Takım arkadaşım **Ayşe Mandıralı** ile iki
kişilik bir takımdık ve **takım kaptanı bendim**. Derece almadık; bu repo, o hafta yazdığımız sistemin kendisi.

Repo 12 Mayıs 2026'da açıldı; asıl iş 14-19 Mayıs arasındaki altı günde yapıldı. Yarışma bitene kadar git
geçmişinde 75 commit vardı: 60'ı benim, 15'i Ayşe'nin. Ayşe'nin işleri sekiz pull request olarak geldi; yedisini inceleyip birleştirdim.

## Fikir

E-ticaretin iki tarafında aynı soru var: **"Bu ürün gerçekten işe yarar mı?"**

- **Alıcı** ürünü sepete atarken ihtiyacına uyup uymadığını, fiyatının makul olup olmadığını ve yorumların ne
  dediğini tek tek okuyamıyor. Sonuç: pişmanlık ve iade.
- **Satıcı** ziyaretçinin neden satın almadan çıktığını bilmiyor. Başlık mı eksik, fiyat mı yüksek, yorumlara
  cevap mı verilmemiş?

ZekAI iki tarafa da yapay zekâyla destek veriyor. Alıcı bir ürün linkini yapıştırıp ihtiyacını kendi
cümleleriyle yazıyor; ZekAI ürünü, yorumları ve fiyatı birlikte değerlendirip "Alabilirsin", "Dikkatli İlerle"
ya da "Alternatife Bak" diyor. Satıcı ise mağazasını bağlıyor; ürün sayfasını beş farklı müşteri profiline
"gezdiriyor", içeriğini, görselini ve sosyal medya metnini yeniletiyor, birlikte satılacak paketler kuruyor ve
yorumlara cevap taslakları alıyor.

Bir entegrasyonu göstermek için entegre olunacak bir mağaza gerekiyordu. Bu yüzden ikinci bir ürün yazdık:
**Akıllı Market**, Trendyol ya da Hepsiburada gibi düşünülmüş küçük bir pazar yeri. Kendi veritabanı, kendi
kullanıcıları ve kendi satıcı paneli var. ZekAI ona dışarıdan, satıcının pazar yerinden aldığı API anahtarıyla
bağlanıyor; gerçek bir SaaS ürününün bir pazar yerine bağlandığı gibi. Ayrıntısı: [Mimari](03-mimari.md).

## Hafta nasıl geçti

| Gün | Ne oldu (commit mesajlarından) |
|---|---|
| 14 Mayıs | İlk market prototipi; alıcı analizi ve alternatifler; Ayşe'nin satıcı paneli düzeni |
| 15 Mayıs | ZekAI ve market olarak iki ayrı arayüz; alıcı karar merkezi; AI düzenleme ve simülasyonlu Seller Studio |
| 16 Mayıs | Market, bağımsız bir e-ticaret servisi oldu; `commerce-api` ve `zekai-api` ayrıldı, Docker Compose geldi; iade modülünü kapsamdan çıkardım; AI istekleri `zekai-api` üzerinden geçmeye başladı |
| 17 Mayıs | Sosyal medya içerik üreticisi; tanıtım sayfası ve koyu tema |
| 18 Mayıs | Vercel ve Render'a yayın; bütün ekranlarda mobil uyum; Gemini hatalarında yedek cevap ve hata aktarımı; tam ekran müşteri simülasyonu |
| 19 Mayıs | Ayşe'den paket önerileri, sosyal içerik çalışma alanı ve Müşteri Sesi; benden alıcı analizinde ve kombinde Gemini çağrılarının azaltılması, karşılaştırma kararı ve veritabanında saklanan taslaklar |

## Kim ne yaptı

Git geçmişinden doğrulayarak yazıyorum:

- **Ben (Fırat Atalay, takım kaptanı):** sistemi iki ürüne ve üç servise ayırdım; alıcı tarafını (ürün analizi,
  karar merkezi, karşılaştırma, kombin) ve Seller Studio'nun AI düzenleme, görsel üretimi, simülasyon ve taslak
  akışlarını yazdım; Gemini maliyetini düşüren değişiklikleri yaptım; Vercel ve Render yayınını kurdum; pull
  request'leri inceleyip birleştirdim.
- **Ayşe Mandıralı:** satıcı panelinin yan menü ve yerleşimini, Windows başlatma betiklerini, paket önerisi
  akışını ve Gemini önbelleğini, sosyal içerik çalışma alanını ve Müşteri Sesi modülünü yazdı; yarışma teslimi
  için ilk dokümanları hazırladı.

Kodun önemli bir kısmını yapay zekâyla (Claude Code) birlikte, kendi koyduğum kurallar altında yazdım.

## Yarışmadan sonra

Yarışmanın üzerinden altı ay geçti. Arayüzler Vercel'de hâlâ açıktı ama arkadaki üç servis Render'ın ücretsiz
katmanındaydı; uyumuş ve veritabanının süresi dolmuştu. Projeye bakan biri giriş ekranından öteye geçemiyordu.
Bu repoyu portfolyoma koyarken şunları yaptım:

1. **Tarayıcıda çalışan bir demo kurdum.** İki arayüz de artık backend olmadan, aynı API sözleşmesiyle
   tarayıcıda çalışıyor. Her rol tek tıkla, şifresiz giriyor. Ayrıntı: [Yayın stratejisi](09-yayin-stratejisi.md).
2. **Ekranda doğru olmayan şeyleri temizledim.** Tanıtım sayfası hâlâ "8 ajan" diyordu; oysa hattı yarışmanın
   son günü tek bir Gemini çağrısına ve deterministik bir karar motoruna indirmiştim. Simülasyon önizlemesi her
   ürün için sabit "4.7 puan, 128 değerlendirme, yarın kargo" gösteriyordu. Giriş sayfasında hiçbir şey
   yapmayan Google ve Apple düğmeleri vardı. Hepsini düzelttim ya da kaldırdım.
3. **Repoyu temizledim.** Şablon artıklarını, takip edilen derleme çıktılarını ve hiçbir yerden kullanılmayan
   dosyaları çıkardım.
4. **Bu dokümanları yazdım.** Yarışma teslimindeki dokümanlar o haftanın hâlini anlatıyordu ve bazı iddiaları
   koddan geride kalmıştı. Örneğin mağaza bağlantısının "şifreli" saklandığı yazıyordu; kodda şifreleme yok.
   Bu sürümde her iddiayı koddan doğruladım ve eksikleri saklamadım.

## Kendime koyduğum kurallar

- **Uydurma veri yok.** Ekranda görünen her sayı ya veriden hesaplanıyor ya da hiç gösterilmiyor.
- **Demo gerçek sistemi değiştirmez.** Demo katmanı yalnızca taşıma katmanında devreye giriyor; gerçek API
  derlemesinde pakete bile girmiyor.
- **Eksik dürüstçe yazılır.** Test yok, bazı servis dosyaları çok büyük, bazı sırlar düz metin. Bunları
  [Güvenlik](06-guvenlik.md) ve [Sınırlar](12-sorular-ve-sinirlar.md) sayfalarında tek tek yazdım.

## Önce ve sonra

| | Yarışma sonu (Mayıs 2026) | Bugün |
|---|---|---|
| **Canlı demo** | Arayüzler Render'daki servislere bağlı; servisler uyuyunca giriş yok | Tarayıcıda çalışan demo; her rol tek tıkla |
| **Tanıtım metni** | "8 AI ajan" | Gerçek hat: danışman → gerekirse piyasa kontrolü → karar motoru |
| **Simülasyon önizlemesi** | Her üründe sabit 4.7 puan ve 128 yorum | Ürünün kendi puanı, yorum sayısı, kargosu ve garantisi |
| **Giriş sayfası** | Çalışmayan Google/Apple düğmeleri | Her rol için tek tıkla giriş kartı |
| **Repo** | Şablon dosyaları, `tsbuildinfo`, kullanılmayan tipler | Temiz; yalnızca çalışan kod |
| **Dokümanlar** | Yarışma teslimi; bazı iddialar eskimiş | Koddan doğrulanmış 12 doküman, Türkçe ve İngilizce |
