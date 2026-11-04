# ZekAI dokümanları

Bu klasörde ZekAI'ı kendi anlatımımla, ayrıntısıyla açıklıyorum: projenin bir hackathon haftasında nasıl
doğduğunu, hangi problemi nasıl çözdüğümüzü ve her teknik kararın arkasındaki gerekçeyi. Her kararın bedelini
de yazdım; çünkü bence bir kararı anlatmanın yarısı, neyden vazgeçtiğini söyleyebilmek.

## Nereden başlamalı?

| Kimsin? | Önerdiğim sıra |
|---|---|
| Projeye ilk kez bakıyorsun, teknik ayrıntı istemiyorsun | [Hikâye](01-hikaye.md) → [Demo turu](02-demo-turu.md) |
| Yazılımcısın, mimariyi ve kodu merak ediyorsun | [Hikâye](01-hikaye.md) → [Mimari](03-mimari.md) → [Yapay zekâ hattı](07-yapay-zeka.md) → [Çözdüğüm problemler](11-cozdugum-problemler.md) |
| Mülakattan önce hızlıca göz atacaksın | [Çözdüğüm problemler](11-cozdugum-problemler.md) → [Sorular ve sınırlar](12-sorular-ve-sinirlar.md) |
| Projeyi kendi makinende çalıştıracaksın | [Çalıştırma ve API](10-calistirma-ve-api.md) |

## Bütün dokümanlar

| # | Doküman | İçinde ne var |
|---|---|---|
| 01 | [Hikâye](01-hikaye.md) | HackAthon'26 haftası, ekip ve roller, yarışmadan sonra ne yaptım, önce/sonra tablosu |
| 02 | [Demo turu](02-demo-turu.md) | Teknik bilgi gerektirmeyen 5 dakikalık tur ve demo ile gerçek sistemin farkları |
| 03 | [Mimari](03-mimari.md) | İki ürün, üç servis, katmanlar ve bir isteğin yolculuğu |
| 04 | [Veritabanı](04-veritabani.md) | İki ayrı veritabanı, şema, veritabanında korunan kurallar, migration'lar |
| 05 | [İş kuralları](05-is-kurallari.md) | Paket indirimi, sipariş, yorum, karar motoru, fiyat adaleti, iade riski ve kombin formülleri |
| 06 | [Güvenlik](06-guvenlik.md) | İki ayrı JWT, satıcı API anahtarı, sırlar, hata biçimi ve bilinen eksikler |
| 07 | [Yapay zekâ hattı](07-yapay-zeka.md) | Gemini'yi maliyet kontrollü kullanmak: tek çağrı, deterministik karar, önbellek, yedek cevap |
| 08 | [Arayüz ve tasarım](08-arayuz-ve-tasarim.md) | İki Next.js uygulaması, durum yönetimi, SSE okuma, tasarım dili, mobil |
| 09 | [Yayın stratejisi](09-yayin-stratejisi.md) | Sunucu masrafı olmadan canlı demo: iki kanal, tarayıcı içi demo katmanı |
| 10 | [Çalıştırma ve API](10-calistirma-ve-api.md) | Kurulum, ortam değişkenleri, örnek isteklerle API |
| 11 | [Çözdüğüm problemler](11-cozdugum-problemler.md) | Problem, çözüm ve gerekçe biçiminde on iki kısa hikâye |
| 12 | [Sorular ve sınırlar](12-sorular-ve-sinirlar.md) | Olası mülakat soruları, bilinen sınırlar ve yol haritası |

## Okurken bilmen gerekenler

- Kod, sınıf ve değişken adları İngilizce; arayüz metinleri ve bu dokümanlar Türkçe. İngilizce sürüm:
  [docs/en](en/README.md).
- Bağlantılar doğrudan ilgili kaynak dosyaya gider; bir iddiayı okuduğunda kodunu da açıp bakabilesin istedim.
- Bu dokümanlardaki her sayıyı koddan saydım. Hackathon haftasında yazdığımız bazı dosyalar 300 satırın çok
  üstünde; bunu [sınırlar](12-sorular-ve-sinirlar.md#bilinen-sınırlar) bölümünde açıkça yazdım. Bugün eklediğim
  demo katmanı ve bu dokümanlar 300 satırın altında.
