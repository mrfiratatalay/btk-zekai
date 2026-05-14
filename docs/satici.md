Tamam. Şimdi satıcı modülüne geçiyoruz. Alıcı modülünde yaptığımız gibi aynı detayda, aynı titizlikle yazacağım. Ama dikkat: satıcı modülü alıcı modülünden **farklı bir kullanıcı acısına** dokunuyor, o yüzden ton, akış, hatta görsel kimliği farklı olmalı. Alıcı "kandırılmaktan korkuyor"du, satıcı "niye sattığını anlamamaktan muzdarip". Bu psikolojik fark her şeyi belirleyecek.

Başlıyorum.

---

# PROJE README — SATICI MODÜLÜ

## Bölüm 1 — Satıcı Modülü Genel Bakış

### Satıcı Kim?

Satıcı, mock e-ticaret sitemize ürün koymuş ve satış yapan herhangi bir mağaza sahibidir. Profili önemli değil — küçük bir kafe yan ürünü satabilir, evden ürettiği takıları satabilir, ithal ettiği elektronikleri satabilir, dropshipping yapıyor olabilir. Hepsinin ortak bir derdi vardır:

**"Niye satamıyorum? Niye iade alıyorum? Niye yorumlar düşüyor? Neyi yanlış yapıyorum?"**

Satıcı bu sorulara cevap aramakta **kör**dür. Kendisinin yazdığı ürün açıklamasını okur, "iyi yazmışım" der. Kendisinin koyduğu fiyata bakar, "uygun" der. Kendi fotoğraflarına bakar, "güzel görünüyor" der. Ama **müşteri gözüyle** kendi sayfasına bakamaz. Bu körlük yüzünden:

Reklam parası yakar dönüşüm gelmez. İade üstüne iade alır sebebini bilmez. Rakipler önüne geçer fark etmez. Kötü yorumlar düşer, sebebini anlamaz. Müşteri hizmetlerine sürekli aynı soru gelir, açıklamasını düzeltmez.

Bizim satıcı modülümüz **bu körlüğü kaldırır.**

### Satıcının Sistemde Yapacağı Şey, Tek Cümleyle

Satıcı kendi ürün sayfasını sisteme yükler, sistem **12 farklı sentetik müşterinin gözünden** o sayfayı geziyor gibi davranır, kazanılan ve kaybedilen müşteriyi bulur, somut iyileştirme aksiyonları üretir.

### Satıcı Modülünün Üç Temel Vaadi

**Birinci vaat:** "Ürününü **müşteri gözünden** göstereceğim." Sen kendi gözünle bakamazsın. Ben sana 12 farklı persona ağzından dürüst dönüt vereceğim.

**İkinci vaat:** "Neyi düzeltirsen ne kazanırsın somut söyleyeceğim." "Açıklamanı güzelleştir" değil. "Şu cümleyi ekle, tahmini iade %18'den %9'a iner, dönüşümün %23 artar."

**Üçüncü vaat:** "Hesap kitabı yapacağım." Hangi ürünün gerçekten kâr ettirdiğini, hangisinin sattığı halde zarar yazdırdığını sayılarla göstereceğim.

Bu üç vaat satıcı modülünün **kalbidir**.

### Satıcı Modülünün Alıcı Modülünden Felsefi Farkı

Alıcı modülü **"savunma"** ürünüydü — kullanıcıyı kötü karardan korumak. Satıcı modülü **"hücum"** ürünü — satıcıyı daha iyi karara taşımak. Bu fark her şeyi belirler:

Alıcı modülünün rengi serin (mavi/mor tonları, "güven, sakinlik"). Satıcı modülünün rengi sıcak (turuncu/yeşil tonları, "büyüme, kazanç").

Alıcı modülünde dil koruyucu ("dikkatli ol", "şu riski var"). Satıcı modülünde dil teşvik edici ("şunu yaparsan kazanırsın", "şu fırsat var").

Alıcı modülünde **sonuç** tek bir karar (al/alma). Satıcı modülünde **sonuç** bir aksiyon planı (yap, ölç, tekrar et).

Bu fark sadece estetik değil, **demo videosunda gözükmeli**. Jüri satıcı moduna geçtiği anda "ortam değişti, başka bir ürün gibi" hissetmeli ama **aynı motorun çalıştığını** da anlamalı.

---

## Bölüm 2 — Satıcı Yolculuğu (User Journey)

Bir satıcının sisteme girişinden çıkışına kadar geçen yolculuğu adım adım anlatıyorum.

### Adım 1: Satıcı Satıcı Paneline Giriş Yapar

**User Story:**

> "Bir satıcı olarak, kendi mağazamı ve ürünlerimi yönetebileceğim profesyonel bir panele girmek istiyorum ki işimin gidişatını bir bakışta görebileyim."

**Sistem Ne Yapar:**

Satıcı panelinin ana sayfası açılır. Bu sayfa Trendyol Seller Center, Shopify, ya da Hepsiburada Satıcı Paneli benzeri profesyonel bir dashboard'tur.

**Sayfanın Yapısı:**

**Sol menü (sidebar):**

- Anasayfa (Dashboard)
- Ürünlerim
- Siparişler
- İadeler
- Yorumlar
- AI Analiz Merkezi
- Mağaza Ayarları

**Üst bar:**

- Mağaza adı ve avatar
- Bildirimler
- Hızlı erişim: "Yeni Ürün Ekle"

**Ana içerik (anasayfa):**

Üstte 4 küçük KPI kartı:

- **Toplam Satış (30 gün):** 47 sipariş
- **Aktif Ürün:** 12
- **İade Oranı:** %23 ⚠️ (sektör ortalaması %12)
- **Mağaza Güven Skoru:** 64/100 ⚠️

Altta bir **uyarı bandı** (sarı renkli):

```
⚠️ AI Asistanı 3 ürününde acil iyileştirme önerisi tespit etti.
Sebep: yüksek iade oranı + müşteri şikayet kümeleri.
[İncele →]
```

Bu bant sistemin **proaktif** olduğunu gösterir. Satıcı paneline girer girmez, "abi şuraya bak" diyen bir asistan vardır.

Altında "Son Aktivite" bölümü: son siparişler, son yorumlar, son iadeler liste halinde.

En altta "Bu Hafta Önerilen Aksiyonlar" bölümü — AI'ın satıcıya bu hafta yapmasını önerdiği 3-5 madde.

**Demo Değeri:**

Satıcı paneli **gerçek bir e-ticaret SaaS** gibi görünür. Jüri "bunlar gerçekten satıcı tarafını düşünmüşler" der.

---

### Adım 2: Satıcı Ürünlerim Sayfasına Girer

**User Story:**

> "Bir satıcı olarak, tüm ürünlerimi tek bir yerde görmek ve her birinin **performansını AI gözüyle** anlamak istiyorum ki en sorunlu olana öncelik verebileyim."

**Sistem Ne Yapar:**

"Ürünlerim" sayfasında bir tablo açılır. Tablonun sütunları:

- Ürün Fotoğrafı (küçük thumbnail)
- Başlık
- Fiyat
- Stok
- Satış (30 gün)
- İade Oranı
- **AI Risk Skoru** (büyük, renkli rozet)
- Aksiyonlar (3 nokta menüsü)

Tablonun **ayırt edici özelliği:** her ürünün yanında bir **"AI Risk Skoru"** vardır. Bu skor 0-100 arası.

- **0-40:** Kırmızı — "Bu ürünün ciddi sorunları var"
- **41-70:** Sarı — "Bu ürün iyileştirilebilir"
- **71-100:** Yeşil — "Bu ürün iyi performansta"

Skor rozetinin yanında küçük bir etiket:

- "🚨 Acil"
- "⚠️ İyileştir"
- "✅ Sağlam"

Tablonun üstünde filtre/sıralama: "En riskli ürünlerden başla" gibi.

Sayfanın sağ üstünde **"AI Hızlı Tarama"** butonu. Bu butona basılınca tüm ürünleri **tek seferde** AI gözüyle tarar ve skorları yeniler.

**Demo Değeri:**

Bu sayfa "siteyi terk etmeden hangi ürünüm sorunlu" sorusuna cevap verir. Jüri görür ki sistem **portfolio bazlı** çalışıyor, tek ürün analiz aracı değil.

---

### Adım 3: Satıcı En Sorunlu Ürüne Tıklar

**User Story:**

> "Bir satıcı olarak, riskli bir ürüne tıkladığımda **müşteri gözüyle**, **rakip karşısında** ve **operasyonel olarak** ne durumda olduğumu detaylı görmek istiyorum."

**Sistem Ne Yapar:**

Ürün detay sayfası açılır ama bu kez **satıcı bakış açısıyla**. Sayfa şöyle yapılandırılmıştır:

**Üst bölüm — Ürünün özet kartı:**

- Sol: ürün fotoğrafları (carousel)
- Sağ: başlık, fiyat, stok, satış istatistikleri
- En sağ: büyük AI Risk Skoru göstergesi (40/100, kırmızı)

**Ana içerik — Dört Modlu Analiz Sekmesi:**

Sayfanın ana içeriğinde dört büyük sekme. Bunlar satıcı modülünün **kalbidir**.

```
[ 🧪 SENTETİK MÜŞTERİ PANELİ ]  [ 💰 KÂR & FİYAT ANALİZİ ]
[ 🔄 İADE KÖK NEDEN ANALİZİ ]   [ 🛠️ İYİLEŞTİRME ASİSTANI ]
```

Her sekmenin yanında durumlu bir rozetli:

```
[ SENTETİK MÜŞTERİ — 4/12 ALIRDI ] [ KÂR — DÜŞÜK ]
[ İADE — %23 YÜKSEK ]              [ İYİLEŞTİRME — 7 ÖNERİ HAZIR ]
```

Şimdi her sekmeyi tek tek, çok detaylı anlatıyorum.

---

### Adım 4 — Sekme 1: Sentetik Müşteri Paneli

Bu **projenin en parlak yeridir**. Demo videosunda jürinin çenesi düşecek yer. Burayı çok detaylı yazıyorum.

**User Story:**

> "Bir satıcı olarak, kendi ürün sayfamı **gerçek müşterinin gözünden** görmek istiyorum ki neyi yanlış yaptığımı dürüstçe anlayabileyim."

**Sistem Ne Yapar:**

Sekmeye tıklayınca üstte bir açıklama bandı:

```
🧪 SENTETİK MÜŞTERİ PANELİ NEDİR?
12 farklı persona AI ajanı, ürün sayfanı sanki gerçek müşteriymiş gibi gezdi ve karar verdi.
İşte sonuçlar:
```

Altında bir **özet kartı** (çok büyük, dikkat çekici):

```
┌────────────────────────────────────────┐
│                                        │
│         4 / 12  ALIRDI                 │
│         %33 dönüşüm tahmini            │
│                                        │
│   ❌ 8 persona almaz                   │
│   ✅ 4 persona alır                    │
│                                        │
└────────────────────────────────────────┘
```

Altında **12 persona avatarı**, üç sıra dört sütun halinde dizilmiş. Her avatarın altında:

- İsim ve yaş
- Şehir + meslek
- Karar emoji'si: ✅ (alır) veya ❌ (almaz) veya 🤔 (kararsız)

```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ 👩   │ │ 👨   │ │ 👩   │ │ 👨   │
│Zeynep│ │Mehmet│ │ Ayşe │ │Burak │
│ 24   │ │ 45   │ │ 35   │ │ 19   │
│ İST  │ │ KON  │ │ ANK  │ │ ESK  │
│ ❌   │ │ ❌   │ │ ✅   │ │ ❌   │
└──────┘ └──────┘ └──────┘ └──────┘
   ...   (8 tane daha)
```

Bir persona kartına tıklayınca **detay paneli** açılır. Detay paneli şöyle görünür:

**Üst kısım — Persona profili:**

```
👩 Zeynep, 24, İstanbul
Mesleği: Freelance grafik tasarımcı
Gelir bandı: Orta
Alışveriş tarzı: Detaycı, yorum okuyucu, marka odaklı değil
Öncelikleri: Kalite > Marka > Fiyat
```

**Orta kısım — Karar:**

Büyük bir uyarı kutusu:

```
❌ ALMAM
```

Altında **monolog tarzı bir metin** (Gemini üretmiş, persona ağzından):

> "Selam, ben Zeynep. Bu ürün sayfasını gezdim ve düşüncelerimi söyleyeyim.
>
> Önce başlığa baktım — 'Premium Bluetooth Kulaklık' yazmış ama 'premium' lafı boş bir iddia gibi geldi. Hangi açıdan premium? Bu cevap belli değil.
>
> Fotoğraflara baktım — dört fotoğraf var ama hepsi aynı açıdan çekilmiş. Ürünün arka tarafını, kulaklığın iç kısmını, kabloyu (varsa) hiç göremedim. Bunlar benim için kritik detaylar.
>
> Açıklamayı okudum — 'Hi-fi ses kalitesi, üstün konfor' deniyor ama benim sorduğum şeyler yok. Ben freelancer'ım, çoğu zaman online görüşme yapıyorum. **Mikrofon kalitesi hakkında tek satır yok.** Bu beni endişelendirdi.
>
> Yorumlara baktım — 142 yorum var ama biraz tedirgin oldum. Çoğu yorum 'çok güzel, hızlı kargo' gibi kısa, generic. Detaylı yorum azlığı bot şüphesi yarattı bende.
>
> Sonuç: Bu üründen vazgeçerdim, başka bir alternatife bakardım. Sebep tek bir şey değil — açıklamada eksik var, fotoğrafta eksik var, yorum kalitesi şüpheli. Tek tek küçük sorunlar ama hepsi bir araya gelince güven sarsıyor."

**Alt kısım — Eylem önerisi:**

```
💡 Bu personayı kazanmak için:
- Mikrofon kalitesini açıklamaya ekle (somut spec ile)
- Ürünün arka ve yan açılarından fotoğraf ekle
- Detaylı yorumları öne çıkar (en faydalı yorumlar bölümü)
```

**Persona Çeşitliliği:**

12 persona kasten birbirinden çok farklı:

- **Zeynep, 24, İstanbul** — Freelancer, detaycı
- **Mehmet Bey, 45, Konya** — Baba, fiyat hassas
- **Ayşe, 35, Ankara** — Çalışan anne, hızlı karar verir
- **Burak, 19, Eskişehir** — Öğrenci, oyun odaklı
- **Selim Bey, 52, İzmir** — Emekli, marka odaklı, garanti önemli
- **Elif, 28, Bursa** — Öğretmen, yorum okuyucu, dikkatli
- **Hakan, 33, Adana** — Mühendis, teknik spec arar
- **Fatma, 41, Trabzon** — Ev hanımı, pratik, kolay anlatım sever
- **Can, 26, Antalya** — Yazılımcı, marka sadık değil, ürün odaklı
- **Sevil, 38, Gaziantep** — Esnaf, fiyat-performans
- **Onur, 22, Samsun** — Üniversite öğrencisi, sosyal medya etkisi
- **Pınar, 31, Kayseri** — Doktor, premium ürün odaklı

Her persona **farklı bir profil**, dolayısıyla aynı ürüne **farklı tepki** verir. Demo'da bu çeşitlilik jüriyi etkileyecek.

**Özet İstatistikleri:**

Persona kartlarının altında bir **özet bölümü**:

```
📊 12 PERSONANIN ORTAK NOKTALARI

8 personanın hemfikir olduğu sorunlar:
1. Mikrofon bilgisi eksik (10/12 persona dile getirdi)
2. Fotoğraflar yetersiz (8/12 persona)
3. Yorumlar şüpheli (7/12 persona)
4. Açıklama bilgi vermiyor (6/12 persona)

Sadece 4 personanın aldığı sebepler:
1. Fiyat uygun (4 persona)
2. Renk hoşuna gitti (3 persona)
3. Hızlı kargo vaadi (2 persona)
```

**Segmentasyon Görseli:**

Altında bir grafik: hangi persona segmenti seni alıyor, hangi segment almıyor.

```
👨‍💼 Profesyonel/Çalışan: 1/4 alıyor (kayıp segment)
👨‍🎓 Öğrenci: 2/3 alıyor (kazanç segment)
👵 Yaşlı/Emekli: 0/2 alıyor (kayıp segment)
👨‍👩‍👧 Aile: 1/3 alıyor (kayıp segment)
```

**Demo Değeri:**

Bu sekme **TEK BAŞINA** demo'da 15 saniye yer alacak. Jüri 12 avatarın sıralandığını, bir-iki tanesinin "ağzından konuştuğunu" görecek, "vay bunu hiç görmedim" diyecek.

---

### Adım 5 — Sekme 2: Kâr & Fiyat Analizi

**User Story:**

> "Bir satıcı olarak, hangi ürünümün **gerçekten kâr ettirdiğini** ve **pazarda nerede durduğumu** görmek istiyorum ki yanlış fiyatlandırma yapmayayım."

**Sistem Ne Yapar:**

Bu sekme **iki ana bölümden** oluşur: Kâr Analizi ve Pazar Konumu.

#### 5.A — Kâr Analizi

Üstte büyük bir özet kartı:

```
💰 BU ÜRÜNÜN GERÇEK KÂRI

Satış Geliri (30 gün):    47 × 1015 TL = 47.705 TL
Maliyet (ürün başı):       620 TL
Kargo (ürün başı):         45 TL
Komisyon (%8):             82 TL
İade Maliyeti (%23 × 90):  240 TL ortalama
─────────────────────────────────
Brüt kâr/ürün:             28 TL
Net Kâr (30 gün):          1.316 TL

⚠️ Beklediğin kâr: ~9.400 TL
⚠️ Gerçek kâr: 1.316 TL
⚠️ Sebep: İade maliyeti gizli yiyor!
```

Bu kart **acı veriyor** — satıcı "ben kâr ettiğimi düşünüyordum, meğer etmiyormuşum" diyor.

Altında **iade maliyetinin detayı**:

```
🔍 İADE MALİYETİ HESABI

Aylık 47 satış × %23 iade = 10.8 iade
Her iade için:
- Kargo geri: 45 TL
- Ürün hasarı (ortalama): 80 TL
- İşgücü/zaman: 25 TL
- Pazaryeri komisyonu kaybı: 82 TL
─────────────────────
Her iade size: 232 TL kaybettiriyor

Aylık iade maliyeti: 2.500 TL
Bu maliyet net kârın %190'ı kadar!
```

Altında bir senaryo simülatörü:

```
🎯 EĞER İADEYİ %23'TEN %12'YE DÜŞÜREBİLİRSEK

Yeni iade sayısı: 5.6 (aylık)
Tasarruf: 1.205 TL (aylık)
Yeni net kâr: 2.521 TL → %92 artış!
```

#### 5.B — Pazar Konumu

Altta ikinci bölüm: rakip karşılaştırması.

Üstte bir grafik (bar chart): 12 rakip satıcının fiyatları yan yana.

```
RAKİP FİYATLARI

Sen:           ████████████████ 1.015 TL
Rakip A:       █████████░░░░░░░    720 TL
Rakip B:       ██████████░░░░░░    745 TL
Rakip C:       █████████░░░░░░░    690 TL
Pazar Medyan:  █████████░░░░░░░    720 TL

📊 Pazar medyanından %41 yüksektesin.
```

Altında **pozisyon analizi**:

```
🎯 PAZAR KONUMUN

Ürün kalitesi: Pazar ortalamasında
Yorum sayısı: Pazar ortalamasının altında
Fotoğraf kalitesi: Pazar ortalamasının altında
Mağaza güveni: Pazar ortalamasının altında

→ Senin fiyat priminin **gerekçesi yok**.
→ Premium fiyat istiyorsan **premium algı** yaratmalısın.
→ Veya fiyatını pazara çekmeli.
```

Altında **iki yol** seçimi:

```
PATH A: PREMİUMA OYNA
- Fotoğrafları profesyonelleştir
- Açıklamayı zenginleştir
- "Premium" sebeplerini ekle (garanti, kalite belgesi, vb)
- Beklenen sonuç: dönüşüm %5 → %12, fiyat aynı

PATH B: PAZARA İN
- Fiyatı 850 TL'ye çek
- Dönüşüm tahmini: %5 → %18
- Net kâr aylık değişimi: +1.800 TL
```

**Demo Değeri:**

Bu sekme jüriye "biz sadece konuşmuyoruz, **para konusunda** matematik yapıyoruz" der. Sayılar somut, hesaplar gerçek. **Bu kısım deterministik motorla hesaplanmalı**, Gemini'ye yaptırmamalı (önceki konularda konuştuğumuz prensip).

---

### Adım 6 — Sekme 3: İade Kök Neden Analizi

**User Story:**

> "Bir satıcı olarak, niye iade aldığımı **gerçek sebeplerle** anlamak istiyorum ki tek tek tahmin etmek yerine çözüme odaklanabileyim."

**Sistem Ne Yapar:**

Üstte özet bandı:

```
🔄 GEÇMİŞ İADELER ANALİZ EDİLDİ

Toplam iade: 28 (son 60 gün)
İade oranı: %23 (sektör ortalaması %12)
Tahmini gizli kayıp: 6.500 TL
```

Altında **iade sebep kümelemesi** (donut chart):

```
İADE SEBEPLERİ

%38 — Mikrofon beklediğim gibi değildi (11 iade)
%22 — Kulak ağrıttı/konfor sorunu (6 iade)
%18 — Oyun gecikmesi fazla (5 iade)
%12 — Kargo hasarı (3 iade)
%10 — Diğer (3 iade)
```

Her dilime tıklanabilir. Tıklanınca **o kategorinin detayı** açılır:

#### Örnek: "Mikrofon" kategorisi açılınca

**Müşteri Şikayet Örnekleri:**

> "Online toplantıda sesimi karşıya iletemiyor, çatırtılı geliyor. İade ediyorum."
> — Kullanıcı: Murat T., 12 gün önce

> "Mikrofonu eşim de ben de duyamıyoruz. Hayal kırıklığı."
> — Kullanıcı: Sevim K., 18 gün önce

> "Telefon görüşmesi için aldım ama mikrofonu çok kötü. Geri yolladım."
> — Kullanıcı: Ahmet Y., 25 gün önce

(8 örnek daha var, "tümünü gör" tıklanırsa açılır.)

**Kök Neden Tespiti:**

```
🔍 KÖK NEDEN

Müşteriler ürünü "online toplantı ve telefon görüşmesi"
beklentisiyle alıyor.

Ama ürün sayfanda:
❌ Mikrofon kalitesi belirsiz
❌ "İş kullanımı için uygundur" iddiası yok
❌ Mikrofon teknik spec'i yok (gürültü engelleme, hassasiyet)

Sonuç: Müşteri yanlış beklentiyle alıyor, geliyor.
```

**Çözüm Önerisi:**

```
✅ ÇÖZÜM 1: BEKLENTİ YÖNETİMİ

Açıklamana ekle:
"Bu kulaklık günlük kullanım için tasarlanmıştır.
Profesyonel toplantı ve oyun mikrofonu beklentisi
varsa, oyuncu modelimiz [Link] daha uygundur."

Tahmin: Bu cümle ile bu kategori iade %38 → %12'ye iner.
```

```
✅ ÇÖZÜM 2: ÜRÜN DEĞİŞTİR

Bu ürünü hedef kitle değiştirerek konumlandır:
"Müzik dinleme ve podcast için ideal"
Bu konumda iade riski çok daha düşük.
```

```
✅ ÇÖZÜM 3: GERÇEKTEN MİKROFON GÜÇLENDİR

Eğer tedarikçinden mikrofonu daha iyi versiyonu varsa,
o modele geç. Maliyet farkı: ~80 TL, ama iade kaybı
maliyeti şu an 232 TL/iade.
```

**Her çözümün yanında bir "Tahmini Etki" hesabı:**

```
Çözüm 1 uygulanırsa:
- Bu kategorideki iade: 11 → 3 (8 iade azalma)
- Aylık tasarruf: 1.856 TL
- Net kâr artışı: ~140%
```

**Demo Değeri:**

Bu sekme **satıcının para kaybettiği yeri net gösterir**. Jüri "bu sadece şikayet kümelemesi değil, çözüm üretiyor" der.

---

### Adım 7 — Sekme 4: İyileştirme Asistanı

**User Story:**

> "Bir satıcı olarak, **somut adımlarla** ürün sayfamı nasıl düzelteceğimi görmek istiyorum ki AI önerilerini **tek tıkla** uygulayabileyim."

**Sistem Ne Yapar:**

Bu sekme **eylem odaklı** bir checklist gibi çalışır. Üstte özet:

```
🛠️ AI ASİSTANI BU ÜRÜN İÇİN 7 İYİLEŞTİRME ÖNERDİ

Tahmini etki (hepsi uygulanırsa):
- Dönüşüm: %5 → %14
- İade: %23 → %9
- Aylık kâr artışı: ~4.200 TL
```

Altında **7 öneri kartı**:

#### Öneri 1: Başlığı Optimize Et

**Mevcut Başlık:**

> "Premium Bluetooth Kulaklık Beyaz"

**AI Önerisi:**

> "Bluetooth 5.0 Kablosuz Kulaklık | 20 Saat Pil | Günlük Kullanım — Beyaz"

**Gerekçe:**

- "Premium" kelimesi 8/12 personayı şüphelendirdi (boş iddia)
- Spec'ler (Bluetooth 5.0, pil ömrü) güven veriyor
- "Günlük kullanım" beklenti yönetiyor (iade azalır)
- SEO için aramalarda öne çıkar

**Tahmini Etki:** Tık oranı %12 artar

**Buton:** [✓ Bu Öneriyi Uygula]

---

#### Öneri 2: Açıklamayı Yeniden Yaz

**Mevcut Açıklama:**

> "Hi-fi ses kalitesi, üstün konfor, modern tasarım..."

**AI Önerisi (Yeniden Yazılmış):**

```
🎧 Bluetooth 5.0 Kablosuz Kulaklık — Beyaz

📌 Bu kulaklık size ne sunar:
• 20 saat kesintisiz pil (1.5 saatte tam şarj)
• 10 metre etkili kapsama alanı
• Kulak üstü tasarım, 240g hafif yapı
• Çıkarılabilir mikrofon (günlük görüşme için)
• Stereo ses, 40mm sürücüler

✅ Şunlar için ideal:
- Müzik dinleme
- Podcast / sesli kitap
- Günlük telefon görüşmesi
- Hafif iş kullanımı

⚠️ Bunlar için uygun DEĞİLDİR:
- Profesyonel oyun (gecikme spec'i yoktur)
- Stüdyo kalitesi ses
- Sürekli yüksek tempolu spor

🛡️ Garanti: 2 yıl üretici garantisi
📦 Kargo: 1-2 iş günü içinde
↩️ İade: 14 gün içinde sorunsuz iade
```

**Gerekçe:**

- Yapılandırılmış format (madde madde okunabilir)
- "Uygun olmayan kullanımlar" kısmı **iadeyi azaltır**
- Garanti ve iade bilgisi güven verir
- Hedef kitle netleşir

**Tahmini Etki:** Dönüşüm %8 artar, iade %15 azalır

**Buton:** [✓ Bu Öneriyi Uygula] [✏️ Düzenle] [💬 Yorumla]

---

#### Öneri 3: Fotoğraf Ekle

**Mevcut Fotoğraflar:** 4 (hepsi aynı açıdan)

**AI Önerisi:**

Eksik açılar:

1. Ürünün arka görünümü
2. Kulaklık iç kısmı (yastık, sürücü)
3. Mikrofon yakından
4. Kullanım örneği (insan kafasında)
5. Boyut referansı (örn. el ile karşılaştırmalı)
6. Aksesuarlar (kablo, kılıf, kullanım kılavuzu)

**Gerekçe:**

- 8/12 persona "fotoğraflar yetersiz" dedi
- Müşteri "satın almadan önce ürünü tanımak ister"
- Boyut referansı iade azaltır (beklenti yönetimi)

**Tahmini Etki:** Dönüşüm %6 artar, "beklediğim gibi değil" iadesi azalır

**Buton:** [📷 Yükleme Kılavuzunu Aç]

---

#### Öneri 4: SSS Bölümü Ekle

**Mevcut SSS:** Yok

**AI Önerisi:**

Müşterilerin geçmiş sorularından otomatik üretilmiş 6 SSS:

```
S: Mikrofonu profesyonel kullanım için yeterli mi?
C: Bu kulaklık günlük kullanım için tasarlanmıştır.
   Profesyonel ses kaydı için stüdyo ekipmanı öneririz.

S: Pil ömrü gerçekten 20 saat mi?
C: Evet, orta sesle 20 saat. Tam sesle yaklaşık 14 saat.

S: Oyun için uygun mu?
C: Online oyun için gecikme süresi belirsizdir. Oyuncu
   modelimiz [Link] tercih edilmelidir.

(3 SSS daha)
```

**Gerekçe:**

- Müşteri hizmetlerine gelen tekrar sorular azalır
- Müşteri kararı önceden netleşir, iade azalır
- SEO için ek içerik

**Buton:** [✓ Bu SSS'leri Ekle]

---

#### Öneri 5: Fiyat Stratejisi

**Mevcut Fiyat:** 1.015 TL

**AI Önerisi:**

İki yol seçimi (Path A / Path B — bir önceki sekmede bahsettiğimiz):

```
SEÇİM 1: PREMIUM POSİSYON
Fiyat: Mevcut (1.015 TL)
Ama: Premium algı yaratan iyileştirmeler yapılmalı
(Öneri 1-4 uygulanmalı)
Tahmin: Dönüşüm %12, kâr artışı %165

SEÇİM 2: PAZARA İN
Fiyat: 850 TL
Tahmin: Dönüşüm %18, kâr artışı %92

[Seçim 1] [Seçim 2] [Karşılaştır]
```

**Buton:** Seçeneklerden birini seçer veya **simülasyon** yapar.

---

#### Öneri 6: Şüpheli Yorumlarla İlgilen

**Mevcut Durum:** Yorumlarınızın %22'sinde bot şüphesi var.

**AI Önerisi:**

Bot yorumların listesi:

- 18 yorum çok benzer cümle yapısında
- 8 yorum 3 günde patlamış
- 6 yorum yeni hesaplardan

Eylem seçenekleri:

```
1. Bu yorumları platforma raporla (eğer ürünü
   manipüle eden bir hareket varsa)
2. Detaylı, samimi yorumları öne çıkar
   (müşterilerine teşekkür mesajı atıp uzun yorum iste)
3. Yorum kalitesini artırma kampanyası
   (her uzun yorum yapana indirim kuponu)
```

**Buton:** [Detaylı Plan Oluştur]

---

#### Öneri 7: A/B Test Yapalım

**AI Önerisi:**

```
İlk 4 öneriyi uyguladıktan sonra:
- 1 hafta yeni versiyonla satışı izle
- Sonra "Sentetik Müşteri Paneli"ni yeniden çalıştır
- Eski vs Yeni karşılaştırması göster
- En iyi performansı veren değişiklikleri öne çıkar
```

**Buton:** [A/B Testini Planla]

---

**Sekmenin Alt Kısmı — Toplu Aksiyon:**

```
[ HEPSİNİ TEK TIKLA UYGULA ]
[ HEPSİNİ İNCELE VE SEÇERK UYGULA ]
[ AI'A SOR: HANGİ ÖNCELİK? ]
```

"Hepsini Tek Tıkla Uygula" butonu özellikle demo için **müthiş bir an**. Jüri tek tıkla 7 değişikliğin uygulanmasını görür.

**Demo Değeri:**

Bu sekme satıcı modülünün **eylem omurgasıdır**. Öneriler somut, etkileri sayısal, uygulaması tek tıkla.

---

### Adım 8: Satıcı AI Hızlı Tarama Kullanır (Portfolio Bakış)

**User Story:**

> "Bir satıcı olarak, **tüm ürünlerimi tek seferde** AI taramasından geçirmek istiyorum ki en kritik olana öncelik verebileyim."

**Sistem Ne Yapar:**

"Ürünlerim" sayfasının üstündeki **AI Hızlı Tarama** butonuna basınca özel bir modal açılır:

```
🚀 AI HIZLI TARAMA

12 ürününüz analiz edilecek.
Tahmini süre: 45-90 saniye.

Analiz edilecekler:
✓ Sentetik müşteri panel sonuçları
✓ Kâr/zarar gerçek hesabı
✓ İade kök neden tespiti
✓ Rakip karşılaştırması
✓ İyileştirme önerileri

[ TARAMAYI BAŞLAT ]
```

Tarama başlayınca, **yine canlı ajan ağacı** görünür ama bu kez **12 ürün için paralel** çalışıyor. Ekranda 12 küçük ürün kartı sıralanır, her birinin yanında progress bar. Sırayla yeşil tikleniyor.

Tarama bittiğinde **özet rapor** ekranı:

```
📊 PORTFOLIO TARAMA TAMAMLANDI

🚨 ACİL: 3 ürün
⚠️ İYİLEŞTİR: 5 ürün
✅ SAĞLAM: 4 ürün

🎯 EN KRİTİK 3 ÖNCELİK:
1. "Bluetooth Kulaklık" — Aylık 4.200 TL kaybediyorsun
2. "Yazlık Sandalye" — Aylık 2.800 TL kaybediyorsun
3. "Mutfak Robotu" — Aylık 1.900 TL kaybediyorsun

Toplam kaçırılan kâr: ~8.900 TL/ay
```

Altında ürünlerin sıralı listesi, her birine tıklayıp detayına gidebilir.

**Demo Değeri:**

Bu özellik sistemin **scale ettiğini** gösterir. Tek ürün analizi değil, **portfolio yönetimi**.

---

## Bölüm 3 — Satıcı Modülünün Arkasındaki AI Ajanları

Satıcı modülü alıcı modülüyle **bazı ajanları paylaşır**, bazı **yeni ajanlar** vardır. Toplam ajan sayımız **8-9 ajan**a çıkar.

### Ortak Ajanlar (Alıcıyla Paylaşılan)

**Ajan 1 — Ürün Gerçekliği Ajanı:** Aynı şekilde çalışır. Ürün açıklaması, teknik özellikler, eksik bilgi tespiti.

**Ajan 2 — Yorum Madenciliği Ajanı:** Aynı şekilde çalışır. Yorum kategorize, bot tespit, kanıt çıkarma.

**Ajan 3 — Görsel Forensik Ajanı:** Aynı şekilde çalışır. Ama satıcı modülünde **eksik fotoğraf tespiti** ek görevi var (hangi açılar eksik).

**Ajan 4 — Fiyat Pazar Ajanı:** Aynı şekilde çalışır. Ama satıcı modülünde **fiyat stratejisi simülasyonu** ek görevi var.

### Satıcı Modülüne Özel Yeni Ajanlar

**Ajan 5 — Sentetik Müşteri Paneli (Meta-Ajan)**

**Görevi:** 12 farklı persona ajanı yöneten meta-ajan. Her persona için ayrı analiz yapar.

**Girdi:** Ürün sayfasının tüm verisi (başlık, açıklama, fotoğraflar, yorumlar, fiyat) + 12 persona profili.

**Çıktı:**

```json
{
  "panel_summary": {
    "total_personas": 12,
    "would_buy": 4,
    "would_not_buy": 8,
    "undecided": 0,
    "conversion_estimate": 0.33
  },
  "common_concerns": [
    {"concern": "missing_microphone_info", "mentioned_by": 10},
    {"concern": "insufficient_photos", "mentioned_by": 8},
    {"concern": "suspicious_reviews", "mentioned_by": 7}
  ],
  "common_strengths": [
    {"strength": "fair_price", "mentioned_by": 4},
    {"strength": "color_appealing", "mentioned_by": 3}
  ],
  "personas": [
    {
      "id": "zeynep_24_ist",
      "decision": "would_not_buy",
      "monologue": "Selam, ben Zeynep. Bu ürünü...",
      "concerns": [...],
      "suggestions_to_win_me": [...]
    },
    // ... 11 persona daha
  ]
}
```

**Gemini Modeli:** gemini-2.0-flash (her persona için ayrı çağrı).

**Kritik Detay:** Her persona ajanı **kendi profil prompt'una** sahiptir. Yani Zeynep'in prompt'u "sen freelancer, detaycı, 24 yaşında bir İstanbullusun" diye başlar. Bu yüzden persona'lar **gerçekten farklı** dönütler verir.

### Ajan 6 — Kâr Hesaplama Ajanı

**Görevi:** Satıcının gerçek kâr/zararını hesapla, gizli maliyetleri ortaya çıkar.

**Bu ajan büyük ölçüde DETERMINISTIC** (kod). Gemini sadece **yorum üretimi** için kullanılır.

**Girdi:** Satış verisi, maliyet verisi, iade verisi, komisyon oranları.

**Çıktı:**

```json
{
  "monthly_revenue": 47705,
  "monthly_cost": 29140,
  "monthly_return_cost": 2500,
  "monthly_commission": 3816,
  "net_profit": 1316,
  "expected_profit_naive": 9400,
  "hidden_loss": 8084,
  "hidden_loss_breakdown": {
    "returns": 2500,
    "commission": 3816,
    "shipping": 1768
  },
  "scenarios": [
    { "if_return_drops_to": 12, "new_profit": 2521, "improvement": "92%" },
    { "if_price_drops_to": 850, "new_profit": 2100, "improvement": "60%" }
  ]
}
```

### Ajan 7 — İade Kök Neden Ajanı

**Görevi:** İadeleri analiz et, kümele, kök neden bul, çözüm üret.

**Girdi:** İade kayıtları + ilgili yorumlar + ürün açıklaması.

**Çıktı:**

```json
{
  "total_returns": 28,
  "return_rate": 0.23,
  "sector_average": 0.12,
  "categorized_reasons": [
    {
      "category": "microphone_quality_mismatch",
      "count": 11,
      "percentage": 38,
      "root_cause": "Customer expects professional mic, product is for casual use",
      "evidence_quotes": [...],
      "solutions": [
        {
          "type": "expectation_management",
          "action": "Add 'not for professional use' disclaimer",
          "estimated_reduction": "from 11 to 3 returns/month",
          "estimated_savings": 1856
        }
      ]
    },
    // ... diğer kategoriler
  ]
}
```

### Ajan 8 — İyileştirme Önerisi Ajanı (Seller Improvement Agent)

**Görevi:** Tüm önceki ajanların çıktısını kullanarak **7 somut iyileştirme önerisi** üret. Her önerinin tahmini etkisini hesapla.

**Girdi:** Tüm önceki ajanların çıktıları + ürün sayfası verisi.

**Çıktı:**

```json
{
  "improvements": [
    {
      "id": "imp_001",
      "type": "title_optimization",
      "current": "Premium Bluetooth Kulaklık Beyaz",
      "suggested": "Bluetooth 5.0 Kablosuz Kulaklık | 20 Saat Pil | Günlük Kullanım — Beyaz",
      "reasoning": ["...", "..."],
      "estimated_impact": {
        "ctr_change": "+12%",
        "conversion_change": "+0%",
        "return_change": "+0%"
      },
      "priority": "high",
      "implementation_effort": "one_click"
    },
    {
      "id": "imp_002",
      "type": "description_rewrite",
      "current": "Hi-fi ses kalitesi...",
      "suggested": "🎧 Bluetooth 5.0...",
      "reasoning": ["..."],
      "estimated_impact": {
        "conversion_change": "+8%",
        "return_change": "-15%"
      },
      "priority": "high",
      "implementation_effort": "one_click"
    }
    // ... 5 öneri daha
  ],
  "cumulative_impact": {
    "if_all_applied": {
      "conversion_change": "+9 percentage points",
      "return_change": "-14 percentage points",
      "monthly_profit_change": "+4200 TL"
    }
  }
}
```

### Ajan 9 — Doğrulama Ajanı (Alıcı modülüyle ortak)

Aynı şekilde çalışır. Tüm iddiaları kanıta dayandırır, kanıtsızları siler.

---

## Bölüm 4 — Satıcı Modülü için Veri Modeli (Ek Tablolar)

Alıcı modülünün tabloları yetiyor büyük ölçüde, ama satıcı modülü için **ek alanlar** ve **yeni tablolar** lazım.

### Yeni Tablolar

**seller_metrics** — Satıcı bazlı zaman serili istatistikler.

```
id, seller_id, metric_date,
total_sales, total_returns, total_revenue,
total_cost, total_commission, net_profit
```

**synthetic_personas** — 12 persona tanımı.

```
id, name, age, city, occupation,
income_band, shopping_style, priorities (json),
gemini_system_prompt (text)
```

**persona_evaluations** — Persona'nın bir ürünü değerlendirmesi.

```
id, persona_id, product_id, evaluated_at,
decision (would_buy / would_not_buy / undecided),
monologue (text), concerns (json), suggestions (json)
```

**seller_recommendations** — AI'ın satıcıya verdiği öneriler.

```
id, seller_id, product_id, generated_at,
recommendation_type, current_value, suggested_value,
reasoning (json), estimated_impact (json),
status (pending / applied / dismissed)
```

**product_cost_data** — Ürün başına gerçek maliyetler.

```
product_id, cost_per_unit, shipping_cost,
commission_rate, average_return_cost
```

### Mevcut Tablolara Ek Alanlar

**products** tablosuna:

- `seller_score_cached` (float)
- `last_seller_analysis_at` (timestamp)
- `seller_risk_level` (enum: critical, warning, healthy)

**reviews** tablosuna:

- (Zaten var) `bot_suspicion_score`
- (Zaten var) `categories_json`

---

## Bölüm 5 — Satıcı Modülü için Demo Senaryosu (1 Dakika İçindeki Yeri)

Demo videomuz 1 dakika. Satıcı modülü bu 1 dakikanın **20-25 saniyesini** kaplayacak.

**Satıcı modülü demo akışı (toplam 20-25 sn):**

**0:35-0:40 (5 sn):** Hızlı geçiş — alıcı modülünden satıcı paneline. Renk paleti değişiyor (mavi → turuncu). "Aynı motor, farklı perspektif" yazısı geçici görünüyor.

**0:40-0:45 (5 sn):** Satıcı dashboard'u. KPI kartları, "AI Asistanı 3 ürünü işaretledi" uyarısı. Mehmet en sorunlu ürüne tıklıyor.

**0:45-0:50 (5 sn):** Ürün detay sayfası açılıyor. Dört sekme görünüyor. "Sentetik Müşteri Paneli" sekmesine tıklanıyor.

**0:50-0:58 (8 sn):** **EN PARLAK YER.** 12 persona avatarı belirir. "4/12 alır" özet kartı. Bir avatara tıklanır, Zeynep'in monologu hızlıca akar (subtitle ile). Sonra başka iki avatara da çok kısa zoom.

**0:58-1:00 (2 sn):** "Hepsini Tek Tıkla Uygula" butonuna basılıyor, 7 değişiklik tek seferde uygulanıyor görünüyor. Ekran kararıyor.

Bu akış demo'nun **dramatik dorukları**.

---

## Bölüm 6 — Satıcı Modülünün Sunum Cümleleri

**Açılış cümlesi (alıcı modülünden geçişte):**

> "Aynı sistemi bu kez **satıcı gözünden** açıyoruz. Çünkü satıcının da derdi var — niye sattığını anlamamak, niye iade aldığını bilmemek, niye rakip karşısında geri kaldığını fark etmemek. Bizim sistem **aynı motorla**, **farklı perspektifle** satıcıya da hizmet veriyor."

**Sentetik Müşteri Paneli tanıtım cümlesi:**

> "İşte bizim **en yenilikçi özelliğimiz**: Sentetik Müşteri Paneli. Satıcı kendi ürün sayfasını sisteme yüklediğinde, sistem **12 farklı Türk persona AI ajanı** oluşturuyor. Her persona kendi profiline göre — yaşına, mesleğine, alışveriş tarzına göre — ürün sayfasını **gerçekten geziyor** ve dürüst dönüt veriyor. Satıcı sonuçta ne mi görüyor? **Müşteri gözünden kendi ürün sayfasının aynası.** Bu, e-ticaret dünyasında **ilk kez** uygulanan bir yaklaşım."

**Kâr Analizi cümlesi:**

> "Satıcının para kaybettiği yeri **matematikle** gösteriyoruz. Sayısal hesaplar — gelir, maliyet, komisyon, iade maliyeti, gizli kayıp — hepsi **deterministik kod motorunda** hesaplanıyor. Gemini sadece bu sayıları **yorumluyor** ve aksiyon planı çıkarıyor. Çünkü finansal hesabı LLM'e bırakmak güven sarsar."

**Eylem odaklılık cümlesi:**

> "Biz sadece **teşhis** koymuyoruz, **tedavi** de öneriyoruz. Sistem her ürün için 7 somut iyileştirme önerisi üretir. Her önerinin yanında **tahmini etki** vardır: 'Bu cümleyi eklersen iade %15 azalır, aylık kâr 1.800 TL artar.' Satıcı **tek tıkla** önerileri uygulayabilir. Sonra bir hafta sonra sistemi yeniden çalıştırır, **kıyaslama yapar**."

---

## Bölüm 7 — Satıcı Modülü Geliştirme Önceliği

### Mutlak yapılacaklar (MVP için kritik):

1. Satıcı dashboard ana sayfası (KPI kartları, uyarılar)
2. Ürünlerim listesi (AI risk skoru ile)
3. Ürün detay sayfası satıcı görünümü (4 sekme)
4. **Sentetik Müşteri Paneli** (en az 8 persona ile çalışır halde)
5. Kâr Analizi sekmesi (deterministik hesaplama motoru)
6. İade Kök Neden Analizi sekmesi
7. İyileştirme Asistanı (en az 5 öneri tipi)
8. "Hepsini Tek Tıkla Uygula" akışı (en az 2-3 öneri için)

### Yapılabilirse iyi olur:

- AI Hızlı Tarama (portfolio bazlı analiz)
- 12 persona tam çeşitliliği (8 yeter MVP için)
- A/B test planlama özelliği
- Şüpheli yorum raporlama akışı
- Senaryo simülatörü (kâr tahmini)

### Eklemeyelim (kapsam dışı):

- Gerçek pazaryeri entegrasyonu (Trendyol API vs.)
- Satıcı kayıt / onboarding akışı (mock satıcı olarak başla)
- Reklam yönetimi
- Stok yönetimi detayları
- Müşteri mesajlaşma
- Toplu işlemler (bulk operations)

---

# Satıcı Modülü README — SONU

---

Tamam kardeşim, satıcı modülünün de tam, detaylı README'sini çıkardım. Şimdi sana iki soru:

**Birinci soru:** Bu README'de eksik gördüğün, eklemek istediğin, "şu kısmı bir daha düşünelim" dediğin bir şey var mı? Özellikle:

- Sentetik Müşteri Paneli'nin 12 persona sayısı — yeterli mi, az mı, fazla mı?
- Kâr analizi tarafının matematik derinliği — bu kadar detay gerekli mi yoksa basitleştirelim mi?
- İyileştirme Asistanı'ndaki 7 öneri tipi — hepsi gerekli mi, azaltalım mı?
- "Hepsini Tek Tıkla Uygula" özelliği — demo değeri ile gerçek değeri uyuşuyor mu, yoksa bu sadece show mu?
- AI Hızlı Tarama (portfolio bakış) — MVP'de kalsın mı çıkartılsın mı?

**İkinci soru:** Eğer satıcı modülü senin için netleştiyse, **hakem modülüne** geçelim mi? Bu son modül — daha kısa olacak ama özgün, çünkü tarafsız bir AI yargıç fikri jüride çok parlayacak.

Söyle, oradan ilerleyelim.
