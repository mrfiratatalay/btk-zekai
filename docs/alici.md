---
---

# PROJE README — ALICI MODÜLÜ

## Bölüm 1 — Alıcı Modülü Genel Bakış

### Alıcı Kim?

Alıcı, online alışveriş yapan herhangi bir kullanıcıdır. Yaşı, mesleği, gelir seviyesi, alışveriş deneyimi farklı olabilir. Ama hepsinin ortak bir derdi vardır:

**"Bu ürünü alsam pişman olur muyum?"**

Klasik e-ticaret platformları bu soruyu cevaplamaz. Yıldız puanı gösterirler ama o puan herkese aynıdır. Yorumları gösterirler ama 500 yorumun hepsini okumak imkansızdır. Açıklamayı gösterirler ama açıklamanın yalan söyleyip söylemediğini bilemezler. Görseli gösterirler ama o görselin gerçek ürünü yansıtıp yansıtmadığını söyleyemezler.

Bizim alıcı modülümüz **tam bu boşluğu** doldurur.

### Alıcının Sistemde Yapacağı Şey, Tek Cümleyle

Alıcı bir ürüne girer, sisteme "ben bunu **neden** alacağım ve **neye** dikkat etmem gerekiyor" diye sorar, sistem ona **kendisine özel bir karar raporu** çıkarır.

### Alıcı Modülünün Üç Temel Vaadi

**Birinci vaat:** "Sana özel cevap vereceğim." Herkese aynı yıldız puanı değil. Senin kullanım senaryona göre **kişisel uygunluk skoru**.

**İkinci vaat:** "Sahte ne varsa yakalayacağım." Sahte yorum, sahte indirim, sahte fotoğraf, hayalet satıcı — hepsini analiz edeceğim, sana göstereceğim.

**Üçüncü vaat:** "Söylediğim her şeyin kanıtı olacak." Halüsinasyon yok. Her iddiamın altında bir veri, bir yorum, bir görsel, bir fiyat geçmişi olacak.

Bu üç vaat, alıcı modülünün **kalbidir**. Bütün özellikler bu üç vaade hizmet eder.

---

## Bölüm 2 — Alıcı Yolculuğu (User Journey)

Bir alıcının sisteme girişinden çıkışına kadar geçen yolculuğu **adım adım** anlatıyorum. Her adım bir user story olacak.

### Adım 1: Alıcı Mock E-Ticaret Sitemize Giriş Yapar

**User Story:**

> "Bir alıcı olarak, normal bir Trendyol/Hepsiburada gibi görünen bir e-ticaret sitesine girmek istiyorum ki tanıdık bir ortamda alışveriş yapayım."

**Sistem Ne Yapar:**

Ana sayfa açılır. Üstte arama çubuğu, kategoriler, sepet ikonu, kullanıcı menüsü vardır. Banner'lar, "öne çıkan ürünler", "günün fırsatları" gibi bölümler bulunur. Kategoriler: Elektronik, Giyim, Ev & Yaşam, Anne & Bebek, Kozmetik, Spor & Outdoor, Kitap, Mutfak, Oto Aksesuar, Kişisel Bakım.

**Alıcı Ne Görür:**

Tıpatıp Trendyol görünümünde bir e-ticaret sitesi. Hiçbir farklılık dikkat çekmez. Bu **kasten** böyledir. Çünkü sistemimizin gücü, tanıdık ortamın **üstüne ekstra bir akıl katmanı** koymaktır.

**Ekrandaki Tek Farklılık:**

Üst menüde küçük bir rozetle yazılı: "**AI Destekli Karar Asistanı Aktif**". Bu rozet, kullanıcıya bu sitenin sıradan bir mock site değil, **AI katmanı entegre** bir site olduğunu söyler.

---

### Adım 2: Alıcı Bir Ürüne Tıklar

**User Story:**

> "Bir alıcı olarak, ilgilendiğim ürüne tıkladığımda klasik bir e-ticaret ürün detay sayfası görmek istiyorum ki ürünü tanıyabileyim."

**Sistem Ne Yapar:**

Ürün detay sayfasını yükler. Sol tarafta büyük ürün görseli, altında küçük thumbnail'lar (4-6 fotoğraf). Sağ tarafta:

- Ürün başlığı
- Marka adı ve satıcı bilgisi (tıklanabilir, satıcı profiline gider)
- Fiyat (varsa indirim öncesi fiyat üstü çizili, indirim yüzdesi)
- Yıldız puanı ve toplam yorum sayısı
- Stok durumu
- "Sepete Ekle" butonu (büyük, turuncu)
- "Favoriye Ekle" butonu

Aşağı kaydırınca:

- Ürün açıklaması (uzun metin)
- Teknik özellikler tablosu
- Yorumlar bölümü
- Sık sorulan sorular
- Benzer ürünler

Bu sayfa **tam bir Trendyol klonu** gibi görünür.

**Ama bir fark vardır:** "Sepete Ekle" butonunun **hemen yanında**, aynı boyutta ama farklı renkte (mor/mavi tonlu, gradient'li) bir buton daha durur:

```
🤖 BANA UYGUN MU?
AI Karar Raporu Al
```

Bu buton **küçük değildir.** Sepete Ekle butonu kadar büyüktür. Yani sistem alıcıya şunu söyler: "Sepete eklemeden önce bir saniye dur, ben sana yardım edeyim."

**Bu buton bizim projemizin görsel imzasıdır.** Demo videosunda jüri en çok bu butonu hatırlayacak.

---

### Adım 3: Alıcı "Bana Uygun mu?" Butonuna Basar

**User Story:**

> "Bir alıcı olarak, sistemin bana yardım edebilmesi için kendi ihtiyacımı kendi kelimelerimle anlatabileceğim bir alana ihtiyacım var."

**Sistem Ne Yapar:**

Bir modal/popup açılır. Modal'ın başlığı: "**Bu ürünün sana uygun olup olmadığını birlikte anlayalım.**"

Modal'ın içinde:

**Üst bölüm:** Mini bir ürün özeti (küçük fotoğraf, başlık, fiyat). Alıcı hangi ürün için danıştığını net görsün.

**Orta bölüm:** Büyük bir metin alanı (textarea). Üstünde şu yazı:

> "Bu ürünü **ne için** almak istiyorsun? **Sana göre neye dikkat etmemiz** gerekiyor? Kendi cümlelerinle yaz, ne kadar detaylı yazarsan analizim o kadar isabetli olur."

Placeholder olarak örnekler dönüyor (her saniye değişen):

- "Annem için, hafif olsun, kolay temizlensin..."
- "Online toplantılar için, mikrofon kalitesi önemli..."
- "Çocuğum için, dayanıklı olsun, güvenli olsun..."
- "Spor salonu için, ağır kullanıma uygun olsun..."

**Alt bölüm (opsiyonel hızlı seçim):** Eğer kullanıcı yazma tembelliği yapıyorsa, hızlı seçim chip'leri var:

- Kendim için kullanacağım
- Hediye olarak alıyorum
- Bütçem sınırlı
- Kaliteye önem veririm
- Yoğun kullanım olacak
- İlk defa alıyorum, deneyimsizim

Bu chip'lere tıklayarak da girdi verebilir.

**Alt-alt bölüm:** Büyük bir buton: "**🚀 ANALİZ BAŞLAT**"

**Alıcı Ne Yapar:**

Kendi cümlesini yazar. Örnek: "Online ders ve oyun için bluetooth kulaklık arıyorum. Mikrofon iyi olsun, kulağımı acıtmasın, 1500 TL'yi geçmesin."

Sonra "Analiz Başlat" butonuna basar.

---

### Adım 4: Sistem Canlı Analiz Sürecini Gösterir

**User Story:**

> "Bir alıcı olarak, sistem bana 'analiz ediliyor, lütfen bekleyin' demek yerine, **gerçekten ne yapıldığını görmek istiyorum** ki AI'a güvenebileyim."

Bu adım **projenin en parlak yeridir**. Jüri burada büyülenecek.

**Sistem Ne Yapar:**

Modal kapanır, kullanıcı **tam ekran bir analiz sayfasına** yönlendirilir. Bu sayfa şöyle görünür:

**Üst bölüm:** Mini ürün kartı ve kullanıcının yazdığı ihtiyaç (alıntı olarak) görünür.

**Orta bölüm — Burası asıl olay:** Bir **canlı ajan akış diyagramı** ekranı kaplar. React Flow ile çizilmiş, dinamik animasyonlu.

Diyagram şöyle görünür:

```
        [İHTİYAÇ ANLAMA]
              ↓
    ┌─────────┴─────────┐
    ↓     ↓     ↓     ↓
[ÜRÜN] [YORUM] [GÖRSEL] [FİYAT]
[GERÇEK][ANALİZ][FORENSİK][PAZAR]
    ↓     ↓     ↓     ↓
    └─────────┬─────────┘
              ↓
         [RİSK SENTEZİ]
              ↓
        [DOĞRULAMA]
              ↓
         [RAPOR]
```

Her kutu bir ajanı temsil eder. Başlangıçta hepsi gri. Sistem çalıştıkça:

- **İhtiyaç Anlama** ajanı **mor renkte pulse atar** (çalışıyor anlamında), birkaç saniye sonra **yeşil tik** alır.
- Ardından **dört ajan paralel** olarak pulse atmaya başlar (Ürün, Yorum, Görsel, Fiyat).
- Her birinin yanında küçük bir mini-rapor satırı belirir:
  - "Ürün Gerçekliği: 7 spec çıkarıldı, 2 belirsizlik tespit edildi"
  - "Yorum Analizi: 142 yorum tarandı, 18 risk başlığı bulundu"
  - "Görsel Forensik: 4 fotoğraf incelendi, 1 stok foto şüphesi"
  - "Fiyat Pazar: 12 benzer satıcı bulundu, sahte indirim tespit edildi"
- Dördü de yeşil tik aldıktan sonra **Risk Sentezi** ajanı çalışır.
- En son **Doğrulama Ajanı** çalışır. Yanında özel bir uyarı: "Kanıtsız iddialar kontrol ediliyor..."
- Doğrulama tamamlanınca **Rapor** kutusu altın renkte parlar.

**Süre:** Tüm süreç 6-12 saniye sürer. Her ajan ortalama 1-2 saniye. Paralel çalışanlar aynı anda biter.

**Alıcı Ne Görür:**

Sıradan "loading spinner" değil. **Gerçek bir sistemin çalıştığını** görüyor. Bu görsel:

1. Kullanıcıyı bekletme anında oyalıyor (sıkılmıyor)
2. Sisteme güven aşılıyor (gerçek iş yapıyor hissi)
3. Demo'da jüriye "bu agentic yapı" diye **anlatmaya gerek bırakmıyor** (görsel kendini anlatıyor)

**Neden Bu Önemli:**

STOX'un yapmadığı şey tam olarak budur. Onlar mikroservis demişler ama görmemişiz. Biz **mimariyi görselleştirerek** STOX'tan ayrışıyoruz. Bu tek başına 5-10 puan değerinde.

---

### Adım 5: Sistem Karar Raporunu Sunar

**User Story:**

> "Bir alıcı olarak, analiz bittiğinde 'evet al/hayır alma' demekten öte, **neden** ve **hangi açıdan** sorusunun cevabını görmek istiyorum."

**Sistem Ne Yapar:**

Tam ekran bir **karar raporu sayfası** açılır. Bu sayfa **dört sekmeli** dizayn edilir. Ama önce en üstte **ana karar bandı** vardır.

#### 5.A — Ana Karar Bandı

Sayfanın en üstünde geniş bir bant. Bantın rengi durumlu:

- **Yeşil:** Düşük risk, alabilirsin
- **Sarı:** Orta risk, dikkatli ol
- **Kırmızı:** Yüksek risk, almanı önermiyoruz

İçinde büyük puntoyla:

```
🟡 PİŞMANLIK RİSKİ: %62 — DİKKATLİ OL
"Bu ürün senin kullanım senaryona tam uymuyor.
Aşağıdaki 4 başlığa bakmadan satın alma kararı verme."
```

Bandın yanında küçük bir buton: "**Bu skor nasıl hesaplandı?**" Tıklanınca bir info popup açılır, hesaplama mantığını anlatır. (Şeffaflık için kritik.)

#### 5.B — Dört Sekmeli Detay Rapor

Bantın altında dört sekme:

```
[ UYGUNLUK ] [ GÜVEN ] [ FİYAT ] [ İADE RİSKİ ]
```

Her sekmenin yanında o sekmenin **mini skor rozetli**:

```
[ UYGUNLUK 54/100 ] [ GÜVEN 41/100 ] [ FİYAT 35/100 ] [ İADE %32 ]
```

Şimdi her sekmeyi tek tek detaylandırıyorum.

##### Sekme 1: UYGUNLUK

**Başlık:** "Bu ürün senin **kullanım senaryona** ne kadar uygun?"

**İçerik:**

Üstte büyük bir **görsel skor göstergesi**: Yarım daire grafiği. İğne 54'te duruyor. Solu kırmızı, ortası sarı, sağı yeşil.

Altında bir cümle: "Sen şunları söyledin: _'Online ders ve oyun için, mikrofon iyi olsun, kulağı acıtmasın.'_ Bu kriterlere göre ürünün **3 alt-skoru** var."

Sonra üç alt-skor kartı:

```
📞 MİKROFON KALİTESİ:        38/100 ❌
🎮 OYUN/DÜŞÜK GECİKME:        47/100 ⚠️
🎧 UZUN KULLANIMDA KONFOR:    61/100 ⚠️
```

Her alt-skorun **altında gerekçe**:

> "**Mikrofon kalitesi düşük puan aldı çünkü:** Yorumların %38'inde mikrofon kalitesi hakkında olumsuz ifade var. En çok tekrarlanan şikayet 'sesim karşıya çatırtılı gidiyor' (8 farklı kullanıcı). Ürün açıklamasında mikrofon teknik özelliği (örneğin gürültü engelleme, hassasiyet) belirtilmemiş."

> "**Oyun/düşük gecikme düşük puan aldı çünkü:** Ürün açıklamasında **gecikme süresi (latency) belirtilmemiş**. Yorumların 12'sinde oyun esnasında ses gecikmesi şikayeti var. Karşılaştırılabilir oyun kulaklıklarında genellikle 'low latency mode' özelliği bulunur, bu üründe bu özellik açıklamada yok."

> "**Uzun kullanımda konfor orta puan aldı çünkü:** Yorumların 9 tanesinde 'kulak ağrıttı', 'uzun kullanımda rahatsız oldu' gibi ifadeler var. Ancak yorumların 23 tanesinde de 'rahat' ifadesi geçiyor. Sonuç karışık, kullanıcıya göre değişebilir."

**Alt bölüm — Aynı ürün, farklı kullanım senaryoları:**

> "Eğer bu ürünü **müzik dinlemek** için alsaydın, uygunluk **78/100** olurdu."
> "Eğer bu ürünü **iş toplantıları** için alsaydın, uygunluk **49/100** olurdu."
> "Eğer bu ürünü **podcast/sesli kitap** için alsaydın, uygunluk **82/100** olurdu."

Bu çok kritik bir özelliktir. Çünkü gösteriyor ki **klasik 5 yıldız puanı yanıltıcı**. Aynı ürün farklı kullanıma göre farklı skorlanmalı.

##### Sekme 2: GÜVEN

**Başlık:** "Bu satıcıya ve ürün listesine **güvenebilir misin?**"

**İçerik:**

Üstte yine bir skor göstergesi: 41/100. Altında "**Güven Skoru Düşük — Dikkatli Ol**" yazısı.

Sonra **4 alt-kategori**:

###### 1. Yorum Forensiği

```
⚠️ Yorumlarının %22'sinde bot şüphesi var
```

Açılır detay:

> "Toplam 142 yorum analiz edildi. **32 yorum** şüpheli bulundu. Sebepler:
>
> - **18 yorum** birbirine **çok benzer cümle yapısında** (semantik benzerlik %87+). 'Çok beğendim hızlı kargo teşekkürler' gibi şablon ifadeler.
> - **8 yorum** **3 gün içinde** aynı saatlerde atılmış (yorum patlaması).
> - **6 yorum** **yeni açılmış hesaplardan** geliyor (hesap yaşı < 30 gün, tek yorum).
>
> Bu yorumları analize **dahil etmedik**. Aşağıdaki skorlar **temizlenmiş veriye** dayanıyor."

Hatta bir buton: "**Şüpheli yorumları göster**". Tıklanınca o 32 yorumun listesi açılır, kullanıcı kendi gözüyle de görebilir.

###### 2. Görsel Forensik

```
⚠️ 2 fotoğraf stok fotoğraf olabilir
```

Açılır detay:

> "Ürünün 4 fotoğrafı analiz edildi.
>
> - **Fotoğraf #2 ve #4** internette başka mağazalarda da kullanılıyor (perceptual hash eşleşmesi). Bu satıcı **kendi ürünün fotoğrafını** çekmemiş olabilir.
> - **Fotoğraf #3'te watermark izi** tespit edildi (silinmiş gibi görünen alan). Başka bir kaynaktan alınmış olabilir.
> - **Müşteri fotoğrafları** ürün fotoğraflarıyla **kısmen uyumsuz** (renk tonu farklı, detay görünmüyor)."

###### 3. Satıcı Geçmişi

```
⚠️ Bu satıcının geçmişi sınırlı
```

Açılır detay:

> "Satıcı **6 ay önce** hesap açmış. Sadece **8 ürün** satışta. Ortalama yorum puanı 4.2 ama yorumların **bot şüphesi yüksek**. Geçmiş iade oranı **%24** (sektör ortalaması %12). **Onaylı satıcı rozeti yok**."

###### 4. Açıklama Tutarlılığı

```
✅ Ürün açıklaması iddialarıyla yorumlar uyumlu
```

Açılır detay:

> "Satıcının ürün açıklamasında geçen iddialar yorumlarla karşılaştırıldı. **Çelişki bulunmadı.** Ama açıklamada **mikrofon kalitesi**, **gecikme süresi** ve **konfor** gibi kritik konular **belirsiz**. Eksik bilgi var."

##### Sekme 3: FİYAT

**Başlık:** "Bu fiyat **adil mi?**"

**İçerik:**

Üstte skor: **35/100 — Fiyat adil değil**.

Sonra bir grafik. **30 günlük fiyat geçmişi**. Y ekseni fiyat, X ekseni zaman. Çizgi grafiği. Satıcının "indirim öncesi fiyat" diye gösterdiği nokta işaretli, gerçek fiyat hareketi gösteriliyor.

Grafik altında uyarı kutusu:

```
🚨 SAHTE İNDİRİM TESPİT EDİLDİ

Satıcı "%30 indirim" iddiasında bulunuyor.
Ama son 30 günde ürün **zaten bu fiyattaydı.**
14 gün önce kısa süreli 1450 TL'ye çıkarılıp tekrar 1015 TL'ye düşürülmüş — sahte indirim tekniği.
```

Altında **pazar karşılaştırması**:

```
📊 AYNI ÜRÜN, FARKLI SATICILAR

Bu satıcı: 1015 TL
Pazar medyanı: 720 TL
En düşük: 650 TL
En yüksek: 1090 TL
Adil fiyat aralığı: 680-780 TL

Bu satıcıda fiyat: MEDYANIN %41 ÜZERİNDE ❌
```

**Alt bölüm — Alternatif satıcılar:**

3 alternatif satıcının kartları. Aynı ürünü daha ucuza satan diğer satıcılar. Her birinin yanında:

- Satıcı adı
- Fiyatı
- Güven skoru
- "Bu satıcıya git" butonu

##### Sekme 4: İADE RİSKİ

**Başlık:** "Bu ürünü iade etme **olasılığın** ne kadar?"

**İçerik:**

Üstte büyük skor: **İade olasılığı: %32 ❌ Yüksek**

Altında **iade sebep dağılımı** (pie chart veya bar chart):

```
📊 GEÇMİŞ İADELERDEN ÖĞRENDİKLERİMİZ

%38 → "Mikrofon kalitesi beklediğim gibi değil"
%22 → "Kulak ağrıttı, uzun kullanım rahatsız"
%18 → "Oyun için gecikme fazla"
%12 → "Kargo hasarı"
%10 → "Diğer"
```

Altında kişiselleştirilmiş uyarı:

> "Sen mikrofon ve oyun öncelikli olduğunu söyledin. İade sebeplerinin **%56'sı** tam senin önceliklerinle ilgili. Bu yüzden senin için iade olasılığı **ortalamadan yüksek** (%32 vs. ortalama %18)."

**Alt bölüm — İade ettiğinde ne olur?**

Bilgi kutusu:

> "Eğer bu ürünü iade edersen:
>
> - Kargo masrafı sana ait olabilir (satıcının iade politikasına göre)
> - Para iadesi 7-14 iş günü sürer
> - Bu süreçte ürün ne sende ne satıcıda olur (aralıkta kalır)
> - Yeni bir ürün siparişi vermek için para geri dönmesini beklemek gerekir
>
> **İade tahmini maliyeti: 80-120 TL + zaman kaybı**"

---

#### 5.C — Genel Tavsiye ve Aksiyon Butonları

Sekme bandının altında **özet ve aksiyon** bölümü:

```
💡 BENİM TAVSİYEM:

Bu ürünü mevcut haliyle almanı önermiyorum.
Senin senaryon (online ders + oyun + mikrofon) için
çok daha uygun 2 alternatif var. Hemen göstereyim mi?
```

İki büyük buton:

```
[🎯 BANA UYGUN ALTERNATİFLERİ GÖSTER]
[🛒 YİNE DE BU ÜRÜNÜ AL]
```

İkinci butona basarsa "emin misin" tarzı bir teyit popup'ı çıkar, raporun özeti gösterilir, sonra sepete eklenir. Yani kullanıcı bilgilendirildikten sonra kendi kararını verir, sistem dayatma yapmaz.

---

### Adım 6: Alıcı Alternatif Ürünleri İnceler

**User Story:**

> "Bir alıcı olarak, mevcut ürün bana uymuyorsa, **bana uyan alternatifleri** hızlıca görmek istiyorum."

**Sistem Ne Yapar:**

"Bana Uygun Alternatifleri Göster" butonuna basınca **alternatif ürün karşılaştırma sayfası** açılır.

Sayfanın üstünde mini bir hatırlatma: kullanıcının ihtiyacı (kendi cümlesi) görünür.

Altında **3 alternatif ürün kartı** yan yana. Her kart:

- Ürün fotoğrafı
- Başlık, fiyat
- **Senin için uygunluk skoru** (büyük puntoyla)
- **Güven skoru, fiyat skoru, iade riski** (mini rozetlerle)
- "Neden bu önerildi" kutusu (2-3 cümle açıklama)
- "Detayını gör" butonu (orijinal "Bana Uygun mu?" akışına sokar)
- "Sepete ekle" butonu

Sayfanın alt kısmında bir tablo: 4 ürünü (orijinal + 3 alternatif) **yan yana karşılaştırır**. Satırlar:

- Fiyat
- Uygunluk skoru
- Güven skoru
- Mikrofon kalitesi
- Gecikme süresi
- Konfor
- Yorum sayısı
- İade oranı

Renk kodlu: yeşil (iyi), sarı (orta), kırmızı (kötü).

**Demo değeri:** Bu sayfa jüriye "biz sadece olumsuz çıkış yapmıyoruz, **yol da gösteriyoruz**" mesajı verir.

---

## Bölüm 3 — Alıcı Modülünün Arkasındaki AI Ajanları

Şu ana kadar kullanıcının ne göreceğini anlattık. Şimdi **perde arkasında** ne çalışıyor, onu yazıyorum. Backend ekibi kod yazarken buraya bakacak.

Alıcı modülünde **7 ajan** çalışır:

### Ajan 1 — İhtiyaç Anlama Ajanı (Need Agent)

**Görevi:** Kullanıcının serbest metinle yazdığı ihtiyacı **yapılandırılmış JSON profile** çevirmek.

**Girdi:** Kullanıcının yazdığı serbest metin + kategori bilgisi (ürünün kategorisi).

**Çıktı (JSON):**

```json
{
  "primary_use_cases": ["online_meeting", "gaming", "phone_call"],
  "must_have_features": ["good_microphone", "low_latency", "comfort"],
  "nice_to_have": ["bluetooth"],
  "deal_breakers": [],
  "budget_max": 1500,
  "budget_min": null,
  "user_type": "individual",
  "experience_level": "intermediate",
  "risk_tolerance": "low",
  "context_keywords": ["student", "remote_work"]
}
```

**Gemini Modeli:** gemini-2.0-flash (hızlı, structured output destekli).

**Doğrulama:** Eğer çıktı eksikse veya belirsizse, kullanıcıya **takip sorusu** sorabilir (opsiyonel — MVP'de yok).

### Ajan 2 — Ürün Gerçekliği Ajanı (Product Reality Agent)

**Görevi:** Ürünün satıcı tarafından sunulan açıklamasını, teknik özelliklerini analiz etmek. "Bu ürün **aslında ne sunuyor**, **neyi iddia ediyor**, **neyi belirsiz bırakıyor**?"

**Girdi:** Ürün başlığı + açıklaması + teknik özellikler (JSON) + kategori.

**Çıktı:**

```json
{
  "extracted_features": {
    "wireless": true,
    "battery_life_hours": null,
    "microphone_type": null,
    "latency_ms": null,
    "weight_grams": 250,
    "material": "plastic"
  },
  "claims_made": ["bluetooth 5.0", "hi-fi sound", "comfortable"],
  "claims_unverified": ["hi-fi sound", "comfortable"],
  "missing_critical_info": ["latency", "microphone_quality", "warranty_period"],
  "category_specific_red_flags": ["no_latency_spec_for_gaming_use"]
}
```

**Gemini Modeli:** gemini-2.0-flash.

### Ajan 3 — Yorum Madenciliği Ajanı (Review Mining Agent)

**Görevi:** Yorumları analiz et. Kategorize et. Risk başlıkları çıkar. **Bot pattern tespiti yap.**

**Girdi:** Ürünün tüm yorumları (50-200 yorum arası).

**Çıktı:**

```json
{
  "total_reviews": 142,
  "suspicious_reviews": {
    "count": 32,
    "ids": ["r_087", "r_091", ...],
    "patterns_detected": ["text_similarity_cluster", "timing_burst", "new_account"]
  },
  "clean_review_analysis": {
    "sentiment_distribution": {"positive": 78, "negative": 25, "neutral": 7},
    "categorized_complaints": {
      "microphone_quality": 14,
      "comfort_long_use": 9,
      "gaming_latency": 12,
      "shipping_damage": 3
    },
    "categorized_praise": {
      "sound_quality": 31,
      "build_quality": 22,
      "price_value": 18
    }
  },
  "evidence_quotes": {
    "microphone_quality": [
      "Sesim karşıya çatırtılı gidiyor, online toplantıda mağdur oluyorum",
      "Mikrofonu eşim de ben de net duyamıyoruz"
    ]
  }
}
```

**Gemini Modeli:** gemini-2.0-flash (büyük context window için).

**Yardımcı algoritma:** Bot tespit için **embedding similarity clustering** (pgvector ile). Aynı/çok benzer cümle yapısındaki yorumlar kümeleniyor. Hesap yaşı + zamanlama anomalisi de hesaba katılıyor (deterministik kod).

### Ajan 4 — Görsel Forensik Ajanı (Visual Forensics Agent)

**Görevi:** Ürün görsellerini analiz et. Stok foto, watermark, müşteri fotoğrafı tutarlılığı.

**Girdi:** Ürün görsellerinin URL listesi + müşteri fotoğrafları (yorumlardan).

**Çıktı:**

```json
{
  "product_images_analyzed": 4,
  "stock_photo_suspicions": [
    { "image_id": "img_002", "similarity_match": "found_in_other_listings", "confidence": 0.89 },
    { "image_id": "img_004", "similarity_match": "found_in_other_listings", "confidence": 0.92 }
  ],
  "watermark_traces": [
    { "image_id": "img_003", "removed_watermark_detected": true, "confidence": 0.71 }
  ],
  "customer_photo_consistency": {
    "consistent_count": 5,
    "inconsistent_count": 2,
    "notes": "Müşteri fotoğraflarında ürün rengi tonu farklı görünüyor"
  }
}
```

**Gemini Modeli:** gemini-2.0-flash (vision capability).

**Yardımcı algoritma:** Perceptual hash (pHash) ile görsel benzerlik (deterministik). Watermark tespiti için OpenCV ile kenar analizi.

### Ajan 5 — Fiyat Pazar Ajanı (Price Market Agent)

**Görevi:** Fiyat geçmişini analiz et, sahte indirim tespit et, pazar karşılaştırması yap.

**Girdi:** Ürünün 30/90 günlük fiyat geçmişi + benzer ürünlerin fiyat verisi (mock data).

**Çıktı:**

```json
{
  "current_price": 1015,
  "claimed_discount": "30%",
  "price_history_analysis": {
    "is_fake_discount": true,
    "evidence": "Son 30 günde fiyat 1015 TL'de sabit, 14 gün önce 1450'ye yükseltilip indirim gösterildi",
    "real_pre_discount_price": 1015
  },
  "market_comparison": {
    "median_price": 720,
    "min_price": 650,
    "max_price": 1090,
    "fair_range": [680, 780],
    "this_listing_position": "41% above median"
  },
  "alternative_sellers": [
    { "seller_id": "s_042", "price": 720, "trust_score": 78 },
    { "seller_id": "s_018", "price": 745, "trust_score": 82 },
    { "seller_id": "s_031", "price": 690, "trust_score": 71 }
  ]
}
```

**Gemini Modeli:** Bu ajan büyük ölçüde **deterministik**, sadece yorumlama için Gemini kullanıyor.

### Ajan 6 — Risk Sentezi Ajanı (Risk Synthesis Agent)

**Görevi:** Diğer ajanların çıktısını topla, kullanıcı ihtiyacıyla eşleştir, **dört eksenli skor üret**.

**Girdi:** Tüm önceki ajanların JSON çıktıları + kullanıcı ihtiyacı.

**Çıktı:**

```json
{
  "fit_score": 54,
  "trust_score": 41,
  "price_fairness_score": 35,
  "return_risk_percent": 32,
  "regret_risk_overall": 62,
  "verdict": "yellow_caution",
  "key_concerns": [
    "Mikrofon kalitesi kullanım senaryonla çakışıyor (yorum kanıtı: 14 şikayet)",
    "Fiyat pazar medyanından %41 yüksek",
    "Yorumların %22'sinde bot şüphesi var, gerçek puan belirsiz"
  ],
  "use_case_alternatives": {
    "music_listening": 78,
    "business_meetings": 49,
    "podcast": 82
  }
}
```

**Skor Hesaplama:** Bu ajan **deterministik formüller** kullanır. Gemini sadece **gerekçe metnini** üretir. Skorlar matematik, açıklamalar AI.

### Ajan 7 — Doğrulama Ajanı (Verification Agent)

**Görevi:** Tüm çıktıyı tara. Her iddianın **kanıtı var mı** kontrol et. Kanıtsız iddiaları **işaretle veya sil**.

**Girdi:** Risk Sentezi Ajanı'nın çıktısı + tüm önceki ajanların çıktısı (kanıt zinciri).

**Çıktı:**

```json
{
  "verified_claims": [
    {
      "claim": "Mikrofon kalitesi düşük",
      "evidence_sources": ["review_r087", "review_r091", "review_r112"],
      "confidence": "high"
    }
  ],
  "rejected_claims": [
    {
      "claim": "Satıcı dolandırıcı",
      "reason": "no_direct_evidence",
      "action": "removed_from_report"
    }
  ],
  "uncertain_claims": [
    {
      "claim": "Konfor uzun kullanımda zayıf",
      "reason": "mixed_evidence",
      "action": "flagged_as_uncertain"
    }
  ]
}
```

**Bu ajan kritiktir.** Final raporda **sadece doğrulanmış iddialar** kullanılır. Reddedilenler atılır. Belirsiz olanlar "kullanıcıya göre değişebilir" notuyla gösterilir.

---

## Bölüm 4 — Alıcı Modülü için Veri Modeli (Özet)

Bu modülün çalışması için backend'de şu tablolar gerekli:

**products** — Ürün ana tablosu. Başlık, açıklama, fiyat, satıcı, kategori, teknik özellikler (JSON).

**product_images** — Ürün görselleri + analiz sonuçları (stok foto skoru, watermark izi, pHash).

**reviews** — Yorumlar + embedding'leri (pgvector) + bot şüphe skoru + kategori (JSON).

**sellers** — Satıcı profilleri + güven skoru cache + geçmiş veriler.

**price_history** — Her ürün için günlük fiyat kayıtları.

**market_comparisons** — Benzer ürünlerin fiyat istatistikleri.

**analysis_requests** — Kullanıcının yaptığı analiz istekleri. Hangi ürün, hangi ihtiyaç, hangi zaman.

**analysis_results** — Sonuç raporları. Skorlar, gerekçeler, kanıtlar (JSON).

**agent_runs** — Hangi analizde hangi ajan çalıştı, ne kadar sürdü, ne döndürdü. (Telemetri için.)

Bu tablolar bütün alıcı modülünü besler.

---

## Bölüm 5 — Alıcı Modülü için Demo Senaryosu (1 Dakika İçindeki Yeri)

Demo videomuz 1 dakika. Alıcı modülü bu 1 dakikanın **30-35 saniyesini** kaplayacak. Diğer kısımları satıcı (20-25 sn) ve hakem (10 sn) modülleri için ayıracağız.

**Alıcı modülü demo akışı:**

**0:00-0:05:** Mock e-ticaret sitesinin ana sayfası, kategori sayfası gezinme. Trendyol gibi görünüm.

**0:05-0:10:** Bir bluetooth kulaklığa tıklama. Ürün detay sayfası. "Bana Uygun mu?" butonunun zoom'lu gösterilmesi.

**0:10-0:15:** Modal açılması, kullanıcının "online ders + oyun + mikrofon" yazması (önceden hazır metin), Analiz Başlat'a basması.

**0:15-0:22:** Canlı ajan akış diyagramının çalışması. Ajanların sırayla yeşillenmesi. (Bu kısım jüriyi büyüleyecek.)

**0:22-0:30:** Karar raporunun açılması. Ana skor bandı (Pişmanlık %62). Sekmeler arasında hızlı geçiş (1-2 saniye her sekmede). Özellikle **bot yorum tespiti** ve **sahte indirim tespiti** vurgulanacak.

**0:30-0:35:** Alternatif ürün önerisi. Karşılaştırma tablosu. "Sistem sadece olumsuz çıkış yapmıyor, yol da gösteriyor" mesajı.

Bu akış demo videosunda **mutlak öncelik**.

---

## Bölüm 6 — Alıcı Modülünün Sunum Cümleleri

Jüriye anlatırken kullanacağımız hazır cümleler. Ezberlenmesi gereken kalıplar.

**Açılış cümlesi:**

> "Türkiye'de bir alıcı online alışveriş yaparken üç şeyi bilemez: ürün gerçekten ona uygun mu, satıcı gerçekten güvenilir mi, fiyat gerçekten adil mi. Yıldız puanları yanıltıcı, yorumlar manipüle edilebilir, indirimler sahte olabilir. Biz **Bana Uygun mu?** butonuyla bu üç sorunun cevabını **kişiselleştirilmiş ve kanıta dayalı** olarak veriyoruz."

**Teknik vurgu cümlesi:**

> "Alıcı analiz isteği gönderdiğinde sistem **7 uzman AI ajanı paralel** olarak çalıştırır. Her ajan ürünün bir boyutunu inceler: ihtiyaç, ürün gerçekliği, yorumlar, görseller, fiyat, risk sentezi ve doğrulama. **Sayısal skorlar deterministik motorda** hesaplanır, **Gemini sadece yorumlama ve gerekçelendirme** yapar. En son **doğrulama ajanı kanıtsız iddiaları siler**, böylece halüsinasyon önlenir."

**Özgünlük vurgusu cümlesi:**

> "Bu sıradan bir 'AI yorum özetleyici' veya 'AI ürün öneri sistemi' değildir. Biz **Pişmanlık Riski** adında **kişiye özel, kanıta dayalı, dört eksenli** bir skorlama sistemi geliştirdik. Aynı ürün farklı kullanım senaryolarına göre farklı skorlar alır. Aynı yorumlar farklı kullanıcıya göre farklı yorumlanır. **Bu yaklaşım dünyada ilktir.**"

---

## Bölüm 7 — Alıcı Modülü Geliştirme Önceliği

Bu modülde **mutlak yapılacaklar** (MVP için kritik):

1. Mock e-ticaret sitesinin ana sayfa, kategori, ürün detay sayfaları
2. "Bana Uygun mu?" butonu ve modal
3. 7 ajanın temel implementasyonu (her ajan en azından çalışıyor olmalı)
4. Canlı ajan akış diyagramı (React Flow ile)
5. 4 sekmeli karar raporu sayfası
6. Pişmanlık riski skoru ve görsel gösterim
7. Alternatif ürün öneri sayfası

**Yapılabilirse iyi olur** (zaman kalırsa):

- "Bu skor nasıl hesaplandı?" popup'ı (şeffaflık için)
- Şüpheli yorumları gösteren modal
- Farklı kullanım senaryolarına göre alternatif skor hesaplama
- Yorum forensiği detay sayfası

**Eklemeyelim** (kapsam dışı):

- Sepete ekleme sonrası ödeme akışı (mock veya gerçek)
- Kullanıcı kayıt/giriş (anonim kullanıcı varsayalım)
- Favoriler, listeler, beğeni sistemleri
- Sosyal paylaşım, yorum yazma
- Mobil uygulama versiyonu

---

# Alıcı Modülü README — SONU

---
