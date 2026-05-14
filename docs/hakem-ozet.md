# Satıcı Modülü — Düzeltme

**"Satıcı kendi ürün sayfasını sisteme yükler"** ifadesi yanlış. Bunu README'de geçen her yerden silelim. Doğrusu şu:

Satıcı zaten kendi panelinde oturuyor. Ürünleri zaten sistemde. Yapacağı tek şey **"Ürünlerim" sayfasında bir ürüne tıklamak**. Sistem o ürünün verisini (başlık, açıklama, fotoğraflar, yorumlar, fiyat geçmişi, satış verisi, iade verisi) **veritabanından otomatik çeker**, ajanları çalıştırır, sonucu gösterir.

Yani akış şu:

```
Satıcı paneline girer
  → Ürünlerim sayfasına gider
  → Bir ürüne tıklar
  → Sistem o ürünün verisini DB'den çeker
  → Ajanlar çalışır
  → 4 sekmeli analiz açılır
```

**"Yükleme" diye bir adım yok.** Bu mantık satıcı SaaS ürünlerinin temel mantığı. Shopify'da, Trendyol Seller Center'da, Hepsiburada Satıcı Panelinde de aynı — satıcı kendi ürünlerini zaten ekosistemde tutuyor, sistem oradan okuyor.

Tek istisna **AI Hızlı Tarama** olabilir — satıcı "tüm ürünlerimi tara" dediğinde sistem **paneldeki tüm aktif ürünleri** tarar. Yine "yükleme" yok, **mevcut katalog** üzerinden çalışır.

Sentetik Müşteri Paneli de aynı şekilde çalışır — satıcı bir ürüne tıklayıp "Sentetik Müşteri Paneli" sekmesine geçtiğinde, sistem o ürünün verisini DB'den alıp 12 personaya gösterir. Satıcı hiçbir şey "yüklemez", sadece **görüntüler**.

Bu düzeltmeyi aklında tut, README'deki o cümleler "satıcı paneldeki ürününe tıklar, sistem otomatik çeker" şeklinde okunacak. Tamam, şimdi hakem moduna geçiyorum.

---

# PROJE README — HAKEM MODÜLÜ

## Bölüm 1 — Hakem Modülü Genel Bakış

### Hakem Kim, Niye Var?

Hakem aslında bir kullanıcı **değildir**. Hakem **sistemin kendisidir** — daha doğrusu sistemin **bir modu**dur. Alıcı ve satıcı arasında **anlaşmazlık** çıktığında devreye giren **tarafsız bir AI yargıç**.

### Hangi Probleme Çözüm?

Türkiye'de e-ticaret iadelerinin **büyük kısmı uyuşmazlığa düşer**. Alıcı "ürün hasarlı" der, satıcı "sağlam yolladım" der. Alıcı "açıklamadakiyle uyumsuz" der, satıcı "açıklamamda yazıyor" der. Alıcı "kullanmadım" der, satıcı "kullanım izi var" der. Bu uyuşmazlıklar:

Pazaryerinde **haftalarca** süren mesajlaşmalara dönüşür. Müşteri hizmetlerini **boğar**. İki tarafı da **yorar**. Çoğu zaman tek bir tarafın haklı olmadığı, **ikisinin de kısmen haklı olduğu** durumlar. Ama klasik sistemler "ya tamamen iade ya hiç iade" deyince **adaletsizlik** çıkar.

Bizim hakem modülümüz **bu boşluğu** doldurur.

### Hakem Modülünün Tek Cümleyle Vaadi

> "Anlaşmazlığı dakikalar içinde, kanıta dayalı, tarafsız, kısmi çözüm öneren bir karar metniyle bitiren AI yargıç."

### Hakem Modülünün Üç Temel Vaadi

**Birinci vaat:** "Hızlıyım." Haftalarca süren süreç dakikalara iner.

**İkinci vaat:** "Tarafsızım." Ne alıcının ne satıcının lehine eğilirim. Sadece **kanıta** bakarım.

**Üçüncü vaat:** "Yumuşağım." "Ya hep ya hiç" demem. Kısmi haklılık, kısmi çözüm öneririm. İki tarafı da %100 mutlu etmesem de, **iki tarafı da %50 razı ederim**, sistem **çalışır halde** kalır.

---

## Bölüm 2 — Hakem Modülü Yolculuğu

Hakem modülü diğer iki modülden farklı çalışır. **Kullanıcı kendi başlatmaz**, **sistem otomatik tetikler**.

### Adım 1: İade Açılır

**User Story (alıcı tarafı):**

> "Bir alıcı olarak, aldığım üründen memnun kalmadığımda hızlıca iade açabilmek istiyorum."

**Sistem Ne Yapar:**

Alıcı "Hesabım > Siparişlerim" sayfasından bir siparişe tıklar. "İade Talebi Aç" butonuna basar. Açılan formda:

- İade sebebi (dropdown: hasarlı geldi, beklediğim gibi değil, yanlış ürün, kalitesiz, diğer)
- Açıklama (serbest metin)
- Fotoğraf yükleme (en fazla 5 fotoğraf)
- "Bu durumu açıklayın" textarea

Alıcı doldurur, gönderir.

**Sistem Otomatik:** İade talebi açılır, satıcıya bildirim gider, **arka planda hakem ajanı tetiklenir**. Yani hakem analizi alıcı ve satıcı görmeden başlar — sistem zaten kanıt topluyor.

### Adım 2: Satıcı İade Bildirimi Alır

**User Story (satıcı tarafı):**

> "Bir satıcı olarak, iade talebi geldiğinde durumu görmek ve cevap vermek istiyorum."

**Sistem Ne Yapar:**

Satıcı panelinde "İadeler" bölümüne yeni bir kayıt düşer. Üstünde kırmızı bir "yeni" rozetli. Satıcı tıkladığında:

- Sipariş bilgileri
- Alıcının iade sebebi
- Alıcının açıklaması
- Alıcının yüklediği fotoğraflar
- "Cevap Yaz" alanı
- "Kabul Et / İtiraz Et" butonları

Satıcının seçenekleri:

**Seçenek A: "İadeyi Kabul Et"** → Süreç biter, alıcı ürünü geri gönderir, para iadesi yapılır. Hakem devreye girmez.

**Seçenek B: "İtiraz Et"** → Satıcı kendi tarafının açıklamasını yazar, varsa kanıt yükler (kargo tutanağı fotoğrafı, ürün gönderim öncesi fotoğrafı, mesajlaşma ekran görüntüsü vs.). **Bu seçildiğinde hakem modu tam devreye girer.**

### Adım 3: Hakem Modu Aktive Olur

**User Story:**

> "Bir sistem olarak, iki tarafın itiraz ettiği bir uyuşmazlıkta **tarafsız, hızlı, kanıta dayalı** bir karar üretmem gerekiyor."

**Sistem Ne Yapar:**

Satıcı itirazını gönderir göndermez **özel bir sayfa** açılır — hem alıcının hem satıcının görebileceği, ama farklı görünümlerle.

Bu sayfaya **"Uyuşmazlık Çözüm Merkezi"** diyoruz.

**Sayfa Açılışı:**

Üstte bir bant:

```
⚖️ UYUŞMAZLIK ÇÖZÜM SÜRECİ BAŞLADI

Bu uyuşmazlık tarafsız AI Hakemimiz tarafından inceleniyor.
Kanıtlar değerlendiriliyor, karar metni hazırlanıyor.

Tahmini süre: 45-90 saniye.
```

Altında **canlı işleyiş** görünüyor — yine ajan ağacı, ama bu kez **hakem akışı**:

```
[ ALICI İDDİASI İNCELENİYOR ]
       ↓
[ SATICI İDDİASI İNCELENİYOR ]
       ↓
   ┌───┴───┐
   ↓       ↓
[ALICI    [SATICI
 KANIT]    KANIT]
   ↓       ↓
[GÖRSEL  [LİSTELEME
 ANALİZ]  TUTARLILIK]
   ↓       ↓
   └───┬───┘
       ↓
[ MESAJLAŞMA TARANIYOR ]
       ↓
[ KARGO VE ZAMAN ÇİZELGESİ ]
       ↓
[ HAKEM SENTEZİ ]
       ↓
[ KARAR METNİ HAZIRLANIYOR ]
```

Her kutu sırayla yeşilleniyor. Her yeşillenen kutunun yanında özet:

- "Alıcı 3 fotoğraf, 1 metin sundu"
- "Satıcı 1 kargo tutanağı, 2 fotoğraf sundu"
- "Mesajlaşmada 12 mesaj bulundu"
- "Kargo teslim tarihi: 8 gün önce"

Sonunda **karar metni** açılır.

---

### Adım 4: Hakem Kararı Açıklanır

**User Story:**

> "Bir alıcı/satıcı olarak, AI hakemin **gerekçeli, anlaşılır, adaletli** bir karar vermesini istiyorum ki ya kabul edeyim ya itiraz edeyim."

**Sistem Ne Yapar:**

Karar sayfası açılır. Tasarımı **profesyonel bir mahkeme kararı** gibi ama yumuşak, anlaşılır dil ile.

#### Karar Sayfasının Yapısı:

**Üst Bant — Genel Karar:**

```
⚖️ HAKEM KARARI

Bu uyuşmazlıkta:
Alıcı: %35 haklı
Satıcı: %65 haklı

Önerimiz: %40 KISMİ İADE
```

Renk kodlu — satıcı lehine sarı/turuncu ton. Alıcı lehine olsaydı mavi/yeşil ton. Tam ortada olsaydı nötr gri.

**İkinci Bölüm — Uyuşmazlığın Özeti:**

```
📋 UYUŞMAZLIK ÖZETİ

📦 Ürün: "Seramik Takı Seti — Beyaz"
💰 Sipariş Tutarı: 380 TL
📅 Sipariş Tarihi: 8 gün önce
📅 Teslim Tarihi: 5 gün önce
📅 İade Açılış: Bugün

🗣️ Alıcı diyor ki:
"Kutuyu açtım, takılar kırıktı. Sağlam çıkmadı, iade ediyorum."

🗣️ Satıcı diyor ki:
"Ürün sağlam yollandı. Kargo tutanağı imzalı. Müşteri 5 gün boyunca
hiçbir şikayet etmedi, sonra birden 'kırık' diyor. Kullanmış olabilir."
```

**Üçüncü Bölüm — Karar Gerekçeleri:**

```
🔍 KANITLARI İNCELEDİĞİMDE:

✅ SATICININ HAKLI OLDUĞU NOKTALAR:

1. Kargo tutanağında "hasar yok" notu var ve alıcı tarafından imzalanmış.
   → Kanıt: Kargo şirketi tutanağı (sistem otomatik çekti)

2. Alıcının yüklediği fotoğrafta ürünün etrafında ince toz tabakası
   ve hafif parmak izleri var. Bu, ürünün **kutudan çıkarıldıktan sonra
   bir süre kullanıldığına** işaret ediyor.
   → Kanıt: Görsel forensik analizi (Vision AI)

3. Alıcı teslim aldıktan 5 gün sonra iade açtı. Hasarlı bir ürün
   genellikle aynı gün veya ertesi gün rapor edilir.
   → Kanıt: Zaman çizelgesi analizi

4. Mesajlaşmada alıcı 3 gün önce satıcıya "ürün güzel görünüyor,
   sadece taşlardan biri biraz parlak değil" yazmış. Yani **teslim
   aldıktan sonra bir süre memnundu**.
   → Kanıt: Mesajlaşma analizi (Mesaj #7)


⚠️ ALICININ HAKLI OLDUĞU NOKTALAR:

1. Ürün açıklamasında "darbeye dayanıklı" ifadesi geçiyor. Bu,
   seramik takı için **abartılı bir iddia**. Eğer ürün kullanım
   esnasında kırıldıysa, satıcının yanıltıcı açıklaması kısmen
   sorumludur.
   → Kanıt: Ürün açıklaması analizi

2. Alıcının yüklediği fotoğrafta gerçekten **kırık parça** var.
   Bu fotoğrafın sahte olduğuna dair kanıt yok.
   → Kanıt: Görsel doğrulama

3. Satıcının önerdiği "kullanım kılavuzu" ürün sayfasında
   bulunmuyor. Alıcı doğru kullanım için bilgilendirilmemiş.
   → Kanıt: Ürün sayfası kontrolü
```

**Dördüncü Bölüm — Önerilen Çözüm:**

```
💡 ÖNERİLEN ÇÖZÜM: %40 KISMİ İADE

Detaylar:
- Alıcıya: 152 TL iade edilsin (toplam tutarın %40'ı)
- Satıcı: 228 TL'yi kazançta tutsun
- Ürün: Alıcıda kalsın (kırık olduğu için geri gönderme maliyeti anlamsız)

Bu çözümün gerekçesi:
Satıcı çoğunlukla haklı (sağlam yolladı, alıcının kullanım izi var),
ama açıklamadaki abartılı iddia satıcı sorumluluğunu doğuruyor. Bu
yüzden tam iade değil, kısmi iade adildir.

Bu çözüm her iki tarafı da TAM mutlu etmeyebilir. Ama:
- Alıcı bir miktar iade alır (zararı azalır)
- Satıcı çoğunluğunu kazançta tutar (haklılığı tanınır)
- İade kargo maliyeti oluşmaz (160 TL tasarruf)
- Süreç bugün sona erer (haftalarca uzamaz)
```

**Beşinci Bölüm — Aksiyon Butonları:**

İki taraf için **farklı butonlar** görünür:

**Alıcı görünümünde:**

```
[ ✓ BU ÇÖZÜMÜ KABUL EDİYORUM ]
[ ✗ HAKEM KARARINA İTİRAZ ET ]
[ 💬 SATICIYLA DOĞRUDAN İLETİŞİME GEÇ ]
```

**Satıcı görünümünde:**

```
[ ✓ BU ÇÖZÜMÜ KABUL EDİYORUM ]
[ ✗ HAKEM KARARINA İTİRAZ ET ]
[ 💬 ALICIYLA DOĞRUDAN İLETİŞİME GEÇ ]
```

**Senaryolar:**

- **İki taraf da kabul ederse:** Çözüm otomatik uygulanır, sistem süreçleri başlatır, iş biter.
- **Bir taraf itiraz ederse:** Süreç insan müşteri hizmetlerine eskalasyon olur. Ama hakem raporu **hazır gider**, müşteri hizmetleri sıfırdan değerlendirmek zorunda kalmaz.
- **İki taraf da doğrudan iletişim isterse:** Bir chat odası açılır, kendi aralarında anlaşırlar.

**Altıncı Bölüm — Şeffaflık Notu:**

Sayfanın en altında küçük punto:

```
ℹ️ Bu karar, AI Hakem tarafından üretilmiştir.
Karar bağlayıcı değildir, sadece bir öneridir.
İki tarafın da reddetme ve insan değerlendirmesi isteme hakkı vardır.
Kullanılan kanıtlar: kargo tutanağı, mesajlaşma, yorum, ürün listelemesi,
alıcı fotoğrafları, satıcı fotoğrafları. Tüm bunlar pazaryeri kayıtlarından
otomatik çekilmiştir.
```

**Demo Değeri:**

Bu sayfa **çok güçlü bir hikaye** anlatıyor. Jüri "AI burada gerçekten **adil bir yargıç gibi** davranıyor" der. Özellikle "kısmi haklılık" konsepti — siyah-beyaz düşünmüyor, **gri tonlarda** çözüm üretiyor — bu çok özgün.

---

## Bölüm 3 — Hakem Modülünün Arkasındaki AI Ajanları

Hakem modülü diğer modüllerle ortak ajanların **bazılarını kullanır**, ama kendi **özel ajanları** vardır.

### Kullanılan Ortak Ajanlar

**Ürün Gerçekliği Ajanı:** Ürün açıklamasındaki iddiaları çıkarır (örn. "darbeye dayanıklı" gibi abartılı iddialar tespit edilir).

**Görsel Forensik Ajanı:** Alıcının yüklediği fotoğraflar analiz edilir. Kullanım izi, hasar tipi, fotoğraf otantikliği kontrol edilir.

**Doğrulama Ajanı:** Hakem kararındaki her gerekçeyi kanıta dayandırır.

### Hakem Modülüne Özel Yeni Ajanlar

#### Ajan 1 — Zaman Çizelgesi Ajanı (Timeline Agent)

**Görevi:** Sipariş → kargo → teslim → mesajlaşma → iade arası zaman akışını çıkarır, **anomaliler** tespit eder.

**Çıktısı örnekleri:**

- "Alıcı teslim aldıktan 5 gün sonra iade açtı (normalde 1-2 gün)"
- "Mesajlaşmada 3 gün önce alıcı memnundu, sonra ani değişim"
- "Kargo teslim ile iade açılış arasında uzun sessizlik dönemi var"

#### Ajan 2 — Mesajlaşma Analiz Ajanı (Communication Analysis Agent)

**Görevi:** Alıcı-satıcı arasındaki mesajları okur, **tutarsızlık** ve **bağlam** çıkarır.

**Çıktısı örnekleri:**

- "Alıcı önce 'ürün güzel' dedi, sonra 'kırık' iddiasında bulundu — çelişki"
- "Satıcı yanıt vermede 12 saat geç kaldı, alıcı sabırsızlandı"
- "Mesajlarda küfür veya tehdit yok, ton normal"

#### Ajan 3 — Kanıt Toplama Ajanı (Evidence Aggregator Agent)

**Görevi:** Sistemde olan tüm kanıtları **otomatik toplar**: ürün sayfası, kargo tutanağı, mesajlaşma, alıcı fotoğrafları, satıcı fotoğrafları, sipariş geçmişi.

**Çıktısı:** Yapılandırılmış kanıt dosyası — diğer ajanların kullanacağı.

#### Ajan 4 — Hakem Sentezi Ajanı (Arbiter Synthesis Agent)

**Görevi:** Tüm önceki ajanların çıktısını alır, **iki tarafın da haklı/haksız noktalarını** çıkarır, **kısmi haklılık yüzdesi** hesaplar.

**Çıktı örneği:**

```json
{
  "buyer_valid_points": [{ "point": "abartılı iddia", "evidence": "...", "weight": 0.25 }],
  "seller_valid_points": [
    { "point": "kargo imzalı", "evidence": "...", "weight": 0.3 },
    { "point": "kullanım izi", "evidence": "...", "weight": 0.25 },
    { "point": "zaman gecikmesi", "evidence": "...", "weight": 0.15 },
    { "point": "mesajlaşma çelişkisi", "evidence": "...", "weight": 0.2 }
  ],
  "buyer_total_weight": 0.25,
  "seller_total_weight": 0.9,
  "normalized_buyer_pct": 22,
  "normalized_seller_pct": 78,
  "rounded_fairness": {
    "buyer_pct": 35,
    "seller_pct": 65
  },
  "recommended_resolution": "partial_refund_40_pct"
}
```

**Önemli:** Yüzdeler **deterministik formülle** hesaplanır. Gemini sadece her noktanın **ağırlığını** tahmin eder (kalitatif → kantitatif çevirim).

#### Ajan 5 — Karar Metni Yazma Ajanı (Verdict Writing Agent)

**Görevi:** Sentezlenen yüzde ve nedenlerden **insancıl, anlaşılır karar metni** üretir.

**Bu ajan tamamen Gemini.** Diğer ajanlardan gelen veriyi alır, yumuşak ama net bir karar metni yazar. Hukuki dil kullanmaz, **günlük Türkçe** kullanır.

---

## Bölüm 4 — Hakem Modülü için Veri Modeli (Ek Tablolar)

**disputes** — Uyuşmazlık kayıtları.

```
id, order_id, buyer_id, seller_id,
opened_at, status (open / arbiter_running / resolved / escalated)
```

**dispute_arguments** — Alıcı ve satıcının iddiaları.

```
id, dispute_id, party (buyer / seller),
argument_text, attached_photos (json),
submitted_at
```

**arbiter_decisions** — Hakem kararları.

```
id, dispute_id, generated_at,
buyer_fault_pct, seller_fault_pct,
verdict_text, evidence_used (json),
recommended_resolution_text,
buyer_accepted, seller_accepted,
finalized_at
```

**dispute_messages** — Alıcı-satıcı mesajlaşması (varsa).

```
id, order_id, sender (buyer / seller),
message_text, sent_at
```

---

## Bölüm 5 — Hakem Modülü için Demo Senaryosu (1 Dakika İçindeki Yeri)

Hakem modülü demo'da **10-15 saniye** alacak — çünkü zaten sayfa baktırırsak görsel olarak güçlü, uzun anlatıma gerek yok.

**0:58-1:00:** Hızlı geçiş — satıcı modülünden hakem moduna. "Bir uyuşmazlık çıktıysa?" gibi bir geçiş.

**1:00-1:08:** Uyuşmazlık Çözüm Merkezi sayfası. Üst bant ("Uyuşmazlık inceleniyor"), kısa ajan akışı görünür (1-2 saniye), karar metni hızla scroll edilir. Önemli iki cümle vurgulanır: "Satıcı %65 haklı" ve "Önerimiz: %40 kısmi iade".

**1:08-1:10:** "İki taraf da çözümü kabul etti, süreç bugün bitti" mesajı görünür. Kapanış cümlesi.

Bu kısacık ama **çok etkili** olacak.

---

## Bölüm 6 — Hakem Modülü Sunum Cümleleri

**Açılış cümlesi (modlar arası geçiş):**

> "Peki ya alıcı ve satıcı **anlaşamazsa**? Türkiye'de e-ticaret uyuşmazlıkları **haftalarca** sürer, iki tarafı da yorar, pazaryerini boğar. İşte bizim **üçüncü modumuz**: AI Hakem. Tarafsız, hızlı, kanıta dayalı, **kısmi çözüm** öneren bir yargıç."

**Tarafsızlık vurgusu:**

> "Bu hakem ne alıcının tarafına eğilir ne satıcının. Sadece **kanıta** bakar — kargo tutanağı, mesajlaşma, ürün listelemesi, alıcının fotoğrafı, satıcının fotoğrafı, zaman çizelgesi. Hepsi pazaryeri sisteminden **otomatik çekilir**. Sonra kendi içinde değerlendirir ve **kısmi haklılık yüzdesi** üretir. Çünkü hayat **siyah-beyaz değildir**, **iki taraf da kısmen haklı olabilir**."

**Yenilik vurgusu:**

> "Bizim bildiğimiz kadarıyla **dünyada hiçbir e-ticaret platformu** anlaşmazlık çözümünü AI hakeme bırakmıyor. Klasik sistemler **ya tam iade ya hiç iade** deyince adaletsizlik çıkıyor. Biz **gri tonlarda çözüm** üretiyoruz."

---

# Hakem Modülü README — SONU

---

# 🎯 TÜM PROJENİN ÖZETİ — Üç Modül Bir Arada

Şimdi her şeyi 30 saniyede toparlayacağım. Bu özet **demo videosunun açılış cümleleri** olabilir.

## Projemiz Tek Cümlede

**"Türkiye e-ticaretinin üç ayrı acısını — yanlış alışveriş, kör satıcılık, çözümsüz uyuşmazlık — tek bir Gemini destekli AI karar ve güven katmanıyla çözen sistem."**

## Üç Modül, Tek Motor

**🛒 Alıcı Modu:** "Bana Uygun mu?" butonuyla, ürün satın almadan önce **kişiselleştirilmiş, kanıta dayalı, dört eksenli** (uygunluk, güven, fiyat, iade riski) pişmanlık riski analizi.

**🏪 Satıcı Modu:** Satıcı panelinde her ürün için **sentetik müşteri panel** (12 persona dönütü), kâr hesabı, iade kök neden analizi ve **tek tıkla** iyileştirme önerileri.

**⚖️ Hakem Modu:** Anlaşmazlık çıktığında **tarafsız AI yargıç** olarak devreye girip, kısmi haklılık yüzdesi ve kısmi çözüm öneren karar metni üretir.

## Üç Modül Birbirini Besler

Alıcı modülü **iade riski** tahmin eder → bu satıcı modülünün **iade kök neden** verisinden beslenir.

Satıcı modülü **ürün sayfasını iyileştirir** → bu alıcı modülünün **uygunluk** ve **güven** skorlarını yükseltir.

Hakem modülü **uyuşmazlık çözer** → bu hem alıcı hem satıcının geçmiş verisine eklenir.

Yani sistem **kendi kendini besleyen** bir döngü.

## Toplam AI Ajan Sayısı

Tüm projede toplam **10 farklı AI ajanı** çalışıyor. Bazıları birden fazla modülde paylaşılıyor:

**Ortak ajanlar (üç modülde de):** Ürün Gerçekliği, Yorum Madenciliği, Görsel Forensik, Doğrulama

**Alıcı'ya özel:** İhtiyaç Anlama, Fiyat Pazar, Risk Sentezi

**Satıcı'ya özel:** Sentetik Müşteri Paneli, Kâr Hesaplama, İade Kök Neden, İyileştirme Önerisi

**Hakem'e özel:** Zaman Çizelgesi, Mesajlaşma Analizi, Kanıt Toplama, Hakem Sentezi, Karar Metni Yazma

Bu **gerçek bir multi-agent sistem** — zorlanmış değil, doğal.

## Demo Videosunun 1 Dakikası

```
0:00-0:05   Açılış: "Türkiye e-ticaretinin üç acısı..."
0:05-0:35   ALICI MODU (30 sn)
            - Mock site → "Bana Uygun mu?" → Canlı ajan ağacı
            - 4 sekmeli rapor → Alternatif öneri
0:35-0:58   SATICI MODU (23 sn)
            - Satıcı paneli → Sorunlu ürün → Sentetik Müşteri Paneli
            - 12 persona avatar → İyileştirme önerileri
0:58-1:00   HAKEM MODU (2 sn — hızlı flash)
            - Uyuşmazlık → "Satıcı %65 haklı, %40 kısmi iade"
            - "İki taraf da kabul etti"
```

## Kapanış Cümlesi

**"Biz yorum özetleyici yapmadık. Açıklama yazıcı yapmadık. Ürün önericisi yapmadık. Biz Türkiye e-ticaretinin üç ayrı acısını çözen, dünyada ilk **üç taraflı AI karar ve güven katmanını** geliştirdik. Alıcıyı koruyan, satıcıyı güçlendiren, anlaşmazlığı çözen — tek motor, üç perspektif."**

---

# 🏁 Üç Modülün Tam README — TAMAMLANDI

Kardeşim, alıcı, satıcı, hakem — üç modülün de detaylı, user story'leriyle, demo akışlarıyla, AI ajanlarıyla, sunum cümleleriyle README'sini bitirdik.

**Satıcı modülü düzeltmesini özetleyeyim:** "Satıcı kendi ürün sayfasını yükler" demek yanlıştı. Doğrusu **satıcı zaten panelinde, ürünleri zaten sistemde, sadece bir ürüne tıklıyor ve sistem otomatik analiz yapıyor**. Hiçbir "yükleme" adımı yok. Bu prensibi sentetik müşteri panel, kâr analizi, iade kök neden — hepsi için akılda tutmalısın.

Şimdi sana üç soru:

**Birinci soru:** Bütün README'yi okudun. **Eksik kalan**, **ekleme istediğin**, **bir daha düşünelim** dediğin bir nokta var mı? Özellikle:

- Hakem modunun otomatik tetiklenme akışı mantıklı mı?
- Kısmi haklılık konsepti güvenli mi yoksa risk mi (jüri "ya tam ya hiç" mi ister)?
- 10 ajan toplam sayısı — çok mu, az mı?
- Demo 1 dakikalık dağılımı (30+23+2 saniye) — uygun mu?

**İkinci soru:** Şimdi ne yapalım?

- (A) **Proje ismi ve görsel kimlik** üzerine çalışalım — bu hâlâ açık konu.
- (B) **API kontratları** çıkartalım — frontend ile backend arasındaki iletişim şemaları.
- (C) **Demo video senaryosunu** dakika dakika, saniye saniye yazalım.
- (D) **Sunum slaytları** için içerik akışı çıkartalım.
- (E) Başka bir şey — söyle.

Hangisi şimdi en kritik?
