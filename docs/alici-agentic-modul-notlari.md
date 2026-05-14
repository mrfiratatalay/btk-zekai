# Alici Modulu Agentic Calisma Notlari

## Hedef

Alici modulu, mock e-commerce katalogundaki urunleri gercek Google ADK workflow'u ile analiz eder. Mock olan kisim urun katalogudur; analiz motoru ADK + Gemini ajanlaridir.

## Veri Sozlesmesi

Her urun sadece kart bilgisi tasimaz. `Product.analysisEvidence` alani agentic workflow icin kanit paketidir:

- `reviews`: temsilci musteri yorumlari, puan, dogrulanmis satin alma, tarih, etiketler
- `visualNotes`: studyo/musteri fotograf sayisi, tutarlilik notlari, gorsel red flag'ler
- `priceHistory`: fiyat gecmisi ve pazar medyani
- `market`: adil fiyat araligi ve alternatif saticilar
- `returnReasons`: urune ozel iade sebepleri ve kanit aciklamasi
- `sellerSignals`: magaza puani, kargo skoru, yanit suresi, risk notlari

Bu alanlar hem kullaniciya urun sayfasinda gosterilir hem de ADK payload'una gonderilir. Bu sayede UI ile ajanlarin gordugu veri ayni kaynaktan gelir.

## Runtime Akisi

1. Kullanici urun sayfasinda ihtiyacini yazar.
2. Frontend `buildAgentMessage` ile urun + evidence datasini `ANALYSIS_INPUT` JSON'una donusturur.
3. Frontend ADK session yoksa once session olusturur.
4. `/run_sse` ile `buyer_agent` workflow'u calisir.
5. Agent event'leri loading ekranindaki node durumlarini ilerletir.
6. `final_rapor` geldiginde skorlar ve final tavsiye ADK ciktisiyla guncellenir.
7. Ayni urun + ayni ihtiyac tekrar acilirsa sonuc localStorage cache'ten okunur. Bu, demo sirasinda Gemini kotasini gereksiz tuketmeyi azaltir.

## Kotu Durum Davranisi

- Backend kapaliysa frontend eski demo analizine fallback yapar, ekran bos kalmaz.
- Gemini `429 RESOURCE_EXHAUSTED` dondururse sebep genellikle gunluk free-tier quota'dir. Yeni API key veya kota bekleme gerekir.
- ADK bazi JSON cevaplarini code fence icinde dondurebilir; frontend parser bunu temizler.

## Tamamlanan Alici Kontrolleri

- Urun sayfasinda yorumlar kullaniciya gorunur.
- Urun sayfasinda fiyat gecmisi gorunur.
- Urun sayfasinda iade sebepleri gorunur.
- Urun sayfasinda gorsel kanit notlari gorunur.
- Urun sayfasinda pazar karsilastirmasi gorunur.
- Satici puani hard-coded degil, evidence datasindan gelir.
- ADK payload'u artik ham rating/reviewCount seviyesinde degil, kanitli urun paketi tasir.
- Frontend build ve TypeScript kontrolu gecmektedir.
