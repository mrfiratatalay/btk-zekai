# Yayın stratejisi: sunucu masrafı olmadan her zaman açık bir demo

## Problem

Yarışma haftasında sistemi şöyle yayına almıştık:

| Parça | Nerede |
|---|---|
| İki Next.js arayüzü | Vercel |
| `commerce-api`, `zekai-api`, `ai-service` | Render, ücretsiz katman (Frankfurt) |
| PostgreSQL | Render, ücretsiz katman |

Ücretsiz katmanın iki sorunu var: hareketsiz kalan servis uykuya geçiyor ve ilk istek uzun sürüyor; ücretsiz
veritabanının da bir kullanım süresi var. Altı ay sonra arayüzler hâlâ açıktı, ama üç servis de `503` dönüyordu.
Projeme bakan bir İK uzmanı giriş ekranında kalıyordu. Üç servisi ve bir veritabanını bütün yıl açık tutmak ise
yeni mezun biri için gereksiz bir masraf.

## İki kanal

Projeyi iki farklı okuyucu için iki ayrı yoldan sunmaya karar verdim:

| Kanal | Kimin için | Ne |
|---|---|---|
| **Canlı demo** | İK ve projeye hızlıca bakmak isteyen herkes | Vercel'de, tarayıcıda çalışan, tek tıkla girilen demo |
| **Kod ve gerçek sistem** | Yazılımcılar | GitHub'daki kod, bu dokümanlar, Docker ile tek komut ve gerçek sistemin çalıştığı kısa bir video |

## Demo nasıl çalışıyor?

İki arayüzde de bütün ağ çağrıları tek bir fonksiyondan geçiyor:

```ts
export async function transport(input: string, init?: RequestInit): Promise<Response> {
  if (process.env.NEXT_PUBLIC_DATA_MODE !== "api") {
    const { demoFetch } = await import("@/demo/handler");
    return demoFetch(input, init);
  }
  return fetch(input, init);
}
```

- `NEXT_PUBLIC_DATA_MODE=api` ile derlenen sürüm gerçek API'lere gidiyor. Koşul derleme anında sabit olduğu için
  bu derlemede demo kodu pakete hiç girmiyor.
- Diğer her derleme (Vercel) isteği [`demoFetch`](../apps/zekai-platform-web/src/demo/handler.ts)'e veriyor.
  `demoFetch` aynı URL'yi ve aynı `RequestInit`'i alıyor ve gerçek bir `Response` döndürüyor: aynı durum kodları,
  aynı `{ message }` hata gövdesi, aynı JSON alanları. API istemcisinin hata işleme, 401'de token yenileme ve 204
  kodu iki modda da aynı satırlardan geçiyor.
- SSE uç noktaları için demo, içinde zamanlanmış olaylar akan bir `ReadableStream` döndürüyor. Arayüzdeki SSE
  okuyucu bunun bir demo olduğunu bilmiyor; iptal sinyaline (`AbortSignal`) de uyuyor.

| | Akıllı Market demosu | ZekAI demosu |
|---|---|---|
| Klasör | [`src/demo`](../apps/akilli-market-web/src/demo) | [`src/demo`](../apps/zekai-platform-web/src/demo) |
| Karşıladığı API | `commerce-api` | `zekai-api` ve arayüzün doğrudan çağırdığı `commerce-api` yolları |
| Giriş kartları | Alıcı (Burak), satıcı (Mehmet) | Satıcı (bağlı mağazasıyla Mehmet), alıcı (kayıtlarıyla Burak) |
| Kod | 1.253 satır | 2.350 satır |

### Veri

- Ürünler, yorumlar ve mağazalar `commerce-api`'nin [`DataSeeder`](../services/commerce-api/src/ZekAI.Infrastructure/Seeders/DataSeeder.cs)
  sınıfından üretilmiş bir JSON dosyasından geliyor: 48 ürün, 204 yorum, 8 mağaza. Demo ile gerçek sistem aynı
  kataloğu gösteriyor.
- Tarihler sabit değil; demo ilk açıldığı gün "bugüne" göre hesaplanıyor: yorumlar "12 gün önce", sipariş "2 gün
  önce". Demo hiç eskimiş görünmüyor.
- Demo verisi tarayıcının `localStorage`'ında. Yazma isteği verinin bir kopyası üzerinde çalışıyor ve yalnızca
  istek başarıyla biterse kaydediliyor; gerçek API'deki transaction gibi, yarıda kalan bir sipariş stoğu
  düşürmüyor.
- **Demoyu sıfırla** düğmesi demo verisini ve oturumu silip seed'e dönüyor.

### Kurallar

Demonun kuralları uydurma değil; üretimdeki kodun portu:

| Kural | Kaynak |
|---|---|
| Karar motoru, fiyat adaleti, iade riski | [`decision_engine.py`](../services/ai-service/buyer/decision_engine.py), [`scoring_engine.py`](../services/ai-service/buyer/scoring_engine.py) |
| Kombin bütçe dengesi, genel skor, satın alma sırası | [`kombin_router.py`](../services/ai-service/buyer/kombin_router.py) |
| Paket fiyatlaması, sepet, sipariş, yorum kuralları | `commerce-api` servisleri |
| Paket önerisi puanlaması | `commerce-api` içindeki deterministik puanlayıcı |
| Önbellek anahtarı (kullanıcı, ürün, ihtiyaç, parmak izi) | `zekai-api` `BuyerService` |

Yapay zekânın yerini alan danışman ise kural tabanlı: ihtiyaçtaki konuları yorum cümleleriyle eşleştiriyor ve
her uyarıda kaynak yorumu alıntılıyor. Ayrıntı: [Yapay zekâ hattı](07-yapay-zeka.md#tarayıcı-içi-demoda-yapay-zekâ).

## Ekranda açıkça "demo"

- Akıllı Market'te her sayfanın üstünde "Canlı demo. Değişiklikler yalnızca bu tarayıcıda saklanır; gerçek ödeme
  ya da kargo yoktur." bandı ve **Demoyu sıfırla** düğmesi var.
- ZekAI'da her ekranın köşesinde **Canlı demo** rozeti duruyor; geniş ekranda "veriler bu tarayıcıda, AI
  cevapları kural tabanlı demo motorundan" açıklamasını da gösteriyor.
- Demoyu kurarken iki modda da yanlış olan şeyleri düzelttim: tanıtım sayfasındaki "8 ajan" metnini, simülasyon
  önizlemesindeki sabit "4.7 puan, 128 değerlendirme" değerlerini ve hiçbir şey yapmayan Google/Apple giriş
  düğmelerini.

## Vercel

- İki Vercel projesi (`akilli-market`, `zekai`) bu repoya bağlı; `main`'e her push iki siteyi yeniden yayınlıyor.
  Pull request'ler için önizleme ortamı açılıyor.
- Projelerde `NEXT_PUBLIC_DATA_MODE` tanımlı değil, bu yüzden Vercel derlemesi demo modunda çıkıyor. Vercel'de
  hiçbir ayarı değiştirmek gerekmedi.

## Gerçek sistem

Gerçek sistem için Docker yeterli: `docker compose up --build` PostgreSQL'i, iki API'yi ve AI servisini açıyor;
arayüzler `NEXT_PUBLIC_DATA_MODE=api` ile `npm run dev` olarak çalışıyor. Adımlar:
[Çalıştırma ve API](10-calistirma-ve-api.md).

## Bedeli

- **İki kaynak.** İş kuralları hem gerçek kodda hem demonun portunda yaşıyor. Gerçek kod değişip port
  güncellenmezse iki mod farklı davranır. Bunu azaltmak için portların her birine kaynak dosyayı yazdım.
- **Demo yapay zekâsı gerçek değil.** Kural tabanlı danışman dili anlamıyor; listede olmayan bir konuyu ya da
  ironiyi göremiyor.
- **İki site birbirinden habersiz.** Gerçek sistemde ZekAI'dan yayınlanan içerik Akıllı Market'e anında
  yansıyor; demoda iki site farklı adreslerde, farklı tarayıcı depolarında çalıştığı için bu bağ yok.
- **Katalog bir kez üretildi.** JSON'u seeder'dan tek seferlik bir dönüştürücüyle ürettim ve dönüştürücüyü repoya
  koymadım; seed değişirse katalog da yeniden üretilmeli.
- **Kod büyüdü.** İki uygulamaya toplam yaklaşık 3.600 satır demo kodu eklendi; her dosya 300 satırın altında.
