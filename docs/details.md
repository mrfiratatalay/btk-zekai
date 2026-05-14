# Bir dakika dur, en önemli noktayı atladık

Sana bütün senaryoları anlatırken hep "Ahmet ürüne tıklıyor", "Mehmet satıcı paneline giriyor" dedim. Ama **o ürünler nerede?** Hangi e-ticaret sitesinde? Bu çok kritik bir soru.

Cevap şu: **biz kendi mock e-ticaret sitemizi yapacağız.** Yani sıfırdan, sahte ama gerçekçi bir Trendyol benzeri site kuracağız. İçinde ürünler, satıcılar, yorumlar, fiyat geçmişi, iadeler — her şey olacak.

Şimdi sen diyebilirsin ki "abi niye? Trendyol'a entegre etsek olmaz mı?" Hayır, olmaz. Sebebini anlatayım, çok mantıklı:

## Niye kendi mock sitemizi yapıyoruz?

**Birinci sebep — Gerçek pazaryeri API'leri bize kapalı.** Trendyol, Hepsiburada gibi platformlar developer API'lerini sadece kendi satıcılarına açıyor. Biz iki haftalık hackathon için onlardan onay alamayız, ya da alsak bile çok kısıtlı veriye erişebiliriz. Bekleyemeyiz.

**İkinci sebep — Geçen seneki ikinci STOX da aynısını yapmış.** Onlar da gerçek pazaryeri kullanamadıkları için kendi mock e-commerce sitelerini paralelde yapmışlar. Bu artık hackathonun standart bir pratiği, jüri bunu görmek istiyor zaten.

**Üçüncü sebep — En önemlisi şu:** Biz mock siteyi sadece "ürünler olsun da göstereyim" diye yapmıyoruz. Biz onu **forensik analiz için tasarlanmış kasıtlı veri zenginliğine sahip bir oyun alanı** olarak kuruyoruz.

Bu cümleyi açayım, çok önemli.

## Mock sitemiz neden özel?

Düşün, biz alıcı modunda diyoruz ki "sistem bot yorumları yakalıyor". Peki nereden yakalayacak? Gerçek bot yorumun olmadığı bir sistemde bot tespiti gösteremezsin. O zaman biz mock sitemize **kasten bot yorumlar enjekte ediyoruz**. Bazı ürünlere şüpheli yorum kümeleri koyuyoruz ki forensik ajanımız onları yakalayabilsin.

Aynı şekilde:

**Sahte indirim göstereceğiz** — o zaman bazı ürünlere kasten 90 günlük fiyat geçmişi koyuyoruz ki "30 gün 500 TL, 1 gün 400 TL, sonra 14 gün 'indirim 380 TL' " gibi sahte indirim pattern'i olsun. Fiyat ajanımız bunu yakalayıp gösterecek.

**Stok fotoğraf yakalayacağız** — o zaman bazı ürünlere kasten birden fazla mağazada görünen jenerik fotoğraflar koyuyoruz. Görsel forensik ajanımız "bu fotoğraf başka 3 yerde daha var" diye yakalayacak.

**İade kök neden bulacağız** — o zaman bazı ürünlere kasten yüksek beden uyumsuzluğu iadesi kümelemesi koyuyoruz. İade ajanımız bunu yakalayıp "iadelerin %58'i beden" diyecek.

**Sahte satıcılar göstereceğiz** — o zaman 60 satıcının 10'unu kasten "şüpheli" yapıyoruz: yeni hesap, az satış, çok yorum, garip pattern. Sistem bunları "düşük güven skoru" diye yakalayacak.

Yani **mock sitemiz aslında bir laboratuvar**. Bizim AI motorumuzun her yeteneğini gösterebileceği kontrollü bir ortam. Bu çok değerli çünkü:

Demo'da jüri "evet bunu yakaladı, evet bunu da yakaladı" diye **somut başarı görür**. Yoksa gerçek pazaryerinde belki o anda bot yorum olmaz, görsel temiz olur, jüri "iyi de bu işe yarıyor mu" diye sorar. Bizim mock sitemizde işin **garantili sergilenmesi** mümkün.

## Mock sitemiz ne içerecek?

Bunu da netleştireyim. Şöyle bir mini Trendyol olacak elimizde:

**Yaklaşık 20 satıcı.** 15'i normal, 5'i "şüpheli profil" (yeni hesap, az satış, garip yorum patterni).

**Yaklaşık 80 ürün.** 10 kategoride dağılmış: elektronik, giyim, ev yaşam, anne-bebek, kozmetik, spor, kitap, mutfak, oto aksesuar, kişisel bakım. Bu 80 ürünün 10 tanesi "demo yıldızı" — onlara çok derin veri koyuyoruz (zengin yorumlar, fiyat geçmişi, iadeler), demo'da bu 10 ürünü kullanacağız. Geri kalan 70'i siteyi "yaşıyor" göstermek için yüzeyel hazırlanıyor.

**Yaklaşık 1500 yorum.** Çoğu gerçekçi ama bazı ürünlerde kasten bot yorum kümeleri var.

**Ürün fotoğrafları.** Çoğu Unsplash gibi ücretsiz kaynaklardan. Bazılarına kasten birden fazla ürüne aynı fotoğrafı koyuyoruz (stok foto senaryosu). Bazılarına Photoshop'la silinmiş watermark izi ekliyoruz (Vision'ın yakalaması için).

**30 günlük fiyat geçmişi her ürün için.** Bazılarında sahte indirim pattern'i.

**Yaklaşık 100 sipariş, 40 iade.** İadelerin sebepleri kümeli (beden, kalite, kargo, beklenti uyumsuzluğu) — iade kök neden analizimiz çalışsın diye.

**5 anlaşmazlık vakası.** Hakem modu demo'su için hazır senaryolar.

Yani **gerçek bir e-ticaret sitesi gibi görünüyor**, kategori sayfaları var, ürün detay sayfaları var, satıcı profilleri var, ama altında **bilinçli kurgulanmış veri** var ki bizim sistemimiz parlasın.

## Mock sitenin görünüşü nasıl olacak?

Çok önemli bir nokta: bu site **gerçekten Trendyol gibi görünecek**. Yani:

Ana sayfada banner'lar, kategori carousel'leri, "öne çıkan ürünler" gibi şeyler var. Kategori sayfaları var, filtreler var, sıralama var. Ürün detay sayfası tam gerçek bir e-ticaret sayfası gibi — büyük fotoğraf, küçük fotoğraflar, fiyat, açıklama, teknik özellikler, yorumlar bölümü, satıcı bilgisi, sepete ekle butonu.

Ama bizim **ekstra butonumuz** var. Ürün detay sayfasında, "Sepete Ekle" butonunun yanında bir buton daha:

# **🤖 Bana uygun mu?**

İşte bu buton bizim sistemimize giriş kapısı. Sahte e-ticaret sitesi içinde **AI katmanımız** orada parlıyor.

Aynı şekilde satıcı paneli var. Mehmet satıcı olarak login olduğunda kendi dashboard'unu görüyor. Ürünleri, satışları, yorumları listelenmiş. Ama her ürünün yanında bir butonumuz var: **"AI Risk Analizi"**. Tıklayınca bizim sistemimiz açılıyor.

İade ekranı var. Ayşe iade açıyor, bizim hakem modu otomatik tetikleniyor.

Yani mock sitemiz **bir e-ticaret sitesi gibi görünen ama içinde AI katmanı entegre edilmiş bir laboratuvar**.

## Bu jüriye nasıl anlatılır?

Bunu sunumda şöyle anlatacağız:

> "Projemizi gerçek pazaryerlerine entegre etmedik çünkü iki haftalık hackathon süresinde bu mümkün değildi — ki bu zaten geçen seneki yarışmacıların da yaptığı standart yaklaşım. Onun yerine kendi mock e-ticaret sitemizi tasarladık. Ama bu sıradan bir 'fake shop' değil — biz onu **bilinçli olarak kurgulanmış veri zenginliğine sahip bir test ortamı** olarak inşa ettik. İçinde bot yorum pattern'leri, sahte indirim senaryoları, stok fotoğraf tuzakları, kümelenmiş iade sebepleri var — yani AI motorumuzun her yeteneğini gerçekçi bir ortamda sergileyebileceğimiz bir simülasyon. Sistemimiz **bu mock site üzerinde değil**, gerçek pazaryerleri için tasarlandı — ileride Trendyol, Hepsiburada, N11 gibi platformlara API entegrasyonu ile bağlanabilecek bir katman olarak."

Bu cümle çok güçlü. Çünkü hem "şu an niye gerçek değil" sorusuna cevap veriyor, hem "ileride ne olabilir" vizyonunu çiziyor, hem de mock sitemizin **kasten kurgulanmış** olduğunu vurguluyor.

# Yani toparlarsak

Kardeşim, projemizin iki tabakası var:

**Alt tabaka — Mock E-Ticaret Sitesi.** Sahte ama gerçekçi bir Trendyol. Kullanıcılar gezebilir, ürünlere bakabilir, sipariş verebilir. İçinde bilinçli yerleştirilmiş "tuzaklar" var — bot yorumlar, sahte indirimler, stok fotoğraflar, yüksek iade ürünleri.

**Üst tabaka — AI Karar ve Güven Katmanı.** Bizim asıl projemiz bu. Mock sitenin üstüne giyilmiş bir akıl. Alıcı modu, satıcı modu, hakem modu. 7 ajanlı analiz motoru. Pişmanlık riski, güven skoru, fiyat adaleti, iade tahmini.

**Demo'da gösterdiğimiz şey:** alıcı bir ürüne girer (mock site), üstteki "Bana uygun mu?" butonuna basar (AI katmanı), rapor gelir (AI katmanı), siteye geri döner (mock site), alternatif ürüne geçer (mock site + AI önerisi). Yani **iki tabaka sürekli birbiriyle konuşuyor**.

**Ama biz "e-ticaret sitesi yaptık" demiyoruz.** Biz "AI katmanı yaptık" diyoruz. Mock site sadece **sergi salonu**. Sanat eseri AI katmanı.

Bu da netleşti mi? Şimdi tam resim oturdu mu kafanda? Mock site + AI katmanı, ikisinin nasıl birbirine geçtiği, niye böyle yaptığımız — hepsi anladıysa devam edelim. Anlamadığın bir nokta varsa söyle, oradan derinleşelim.

# Önce büyük resmi göstereyim

Şu an Türkiye'de insanlar Trendyol, Hepsiburada, N11 gibi sitelerden alışveriş yapıyor değil mi? Herkes yapıyor. Sen de yapıyorsun, ben de yapıyorum, annen de yapıyor.

Ama şöyle bir şey var: bu alışveriş süreci aslında üç tarafı da rahatsız ediyor.

**Alıcıyı rahatsız ediyor.** Çünkü adam bir ürüne tıklıyor, fotoğrafa bakıyor, açıklamayı okuyor, yorumlara bakıyor, "5 yıldız, çok güzelmiş" diyor, sipariş veriyor. Ürün geliyor. Bir bakıyorsun ki — beklediği şey değil. Mikrofonu çalışmıyor, bedeni dar, fotoğraftaki gibi değil, ya da resmen sahte. Üzülüyor, iade ediyor, vakit kaybediyor, parası bir hafta cebine geri dönmüyor.

**Satıcıyı rahatsız ediyor.** Çünkü adam ürün yüklüyor, satıyor, ama bir bakıyor ki iade üstüne iade geliyor. Niye? Bilmiyor. Yorumlar kötüleşiyor. Niye? Bilmiyor. Reklam parası yakıyor ama dönüşüm yok. Niye? Yine bilmiyor. Tahmin yürüterek yönetmeye çalışıyor.

**Pazaryerini rahatsız ediyor.** Çünkü iadeler arttıkça onlar zarar ediyor, anlaşmazlıklar haftalarca sürüyor, müşteri hizmetleri ezilip duruyor, alıcı-satıcı arasında haftalar süren çekişmeler oluyor.

Yani **e-ticaret çalışıyor ama acı çekerek çalışıyor**. Herkes bir yerinde yanıyor.

Şimdi soru şu: bu acının altında yatan ortak sebep ne?

# İşte burada bizim fikrimizin kalbi başlıyor

Biz şöyle bir şey fark ettik: aslında bütün bu acılar **tek bir kelimeden** çıkıyor.

O kelime: **uyuşmazlık**.

Yani alıcının kafasındaki ürün ile satıcının sattığı ürün uyuşmuyor. Satıcının düşündüğü müşteri ile gerçek müşteri uyuşmuyor. Pazaryerinin sunduğu fiyat ile gerçek fiyat uyuşmuyor. Alıcının beklentisi ile sonuç uyuşmuyor.

Her şey aslında bu uyuşmazlıktan çıkıyor.

Biz dedik ki: o zaman **biz bu uyuşmazlığı satın alma gerçekleşmeden önce yakalayan bir sistem yapalım**. Hatta sadece satın alma öncesi değil, satıştan önce satıcıya da gösterelim, iade olduğunda da hakemlik yapalım. Yani uyuşmazlığın **her noktasında** araya girelim.

# Sistem ne yapacak peki?

Şimdi sana üç tane senaryo anlatacağım. Bunları gözünde canlandır, böylece sistem kafanda otursun.

## Birinci senaryo — Ahmet bluetooth kulaklık alıyor

Ahmet öğrenci. Bluetooth kulaklık arıyor. Online ders için, biraz oyun için, telefon görüşmesi için. Mikrofon önemli onun için. 1500 TL bütçesi var.

Şu an klasik bir pazaryerinde ne yapardı? Filtre koyardı, sırayla ürünlere bakardı, fotoğrafa bakardı, "şu güzelmiş" derdi, yorumlara bir göz atardı, sipariş verirdi. Şanslıysa doğru ürün gelirdi, şanssızsa iade.

Bizim sistemde ne olacak? Ahmet bir ürüne tıklıyor. Sayfa normal e-ticaret sayfası gibi görünüyor — fotoğraf, fiyat, açıklama, yorumlar. **Ama bir buton var.** O butonun üzerinde "**Bana uygun mu?**" yazıyor.

Ahmet o butona basıyor. Bir kutu açılıyor. Sistem soruyor: "Bu ürünü ne için almak istiyorsun?"

Ahmet kendi cümlesiyle yazıyor:

> "Online ders için, biraz oyun için, telefon görüşmesi için alacağım. Mikrofon iyi olsun, kulağımı acıtmasın."

Ahmet "Analiz Et" butonuna basıyor.

Şimdi olay başlıyor. Ekranda canlı bir şey beliriyor — bir tür akış diyagramı. İçinde küçük kutular var, her birinde bir iş yapılıyor:

İhtiyaç analiz ediliyor... ✓ Ürün gerçekten ne sunuyor inceleniyor... ✓ Yorumlar taranıyor... ✓ Ürün görselleri Vision AI ile inceleniyor... ✓ Satıcının geçmişi araştırılıyor... ✓ Fiyat geçmişi kontrol ediliyor... ✓ Sonuç doğrulanıyor... ✓

Bu **canlı** oluyor. Her kutu sırayla yeşil tikleniyor, jüri bunu görüyor, **bir sistem çalışıyor hissi veriyor**. Tek bir prompt değil bu, gerçek bir analiz motoru çalışıyor.

Birkaç saniye sonra Ahmet'in karşısına bir rapor çıkıyor. Dört sekmeli. Hepsini tek tek anlatayım:

### Birinci sekme — Uygunluk

Diyor ki: "Bu ürün senin için **%54 uygun**. Yani orta-düşük. Sebebi şu: Sen mikrofon iyi olsun dedin, ama yorumların %38'inde mikrofon kalitesinin kötü olduğu söyleniyor. Sen oyun için de kullanacağım dedin, ama ürün açıklamasında düşük gecikme bilgisi yok, bu da yorumlarda şikayet konusu. Konfor için de sorduğun ürün — yorumlarda 'uzun kullanımda kulak ağrıttığı' söyleniyor."

Yani sistem **Ahmet'in ihtiyacı ile ürünün gerçekliğini eşleştiriyor**. Genel bir "ürün güzel" demiyor. Diyor ki "**senin senaryon için** bu ürün riskli".

Hatta aynı sekmede şunu da gösteriyor: "Eğer müzik dinlemek için alacaksan bu ürün %78 uygun. Ama senin kullanım senaryonda %54." Yani **kullanıma göre puan değişiyor**. Bu çok önemli, çünkü klasik 5 yıldızlı puan herkese aynı şeyi söyler, biz ise kişiye özel puan veriyoruz.

### İkinci sekme — Güven

Bu çok ilginç bir sekme. Sistem diyor ki: "Bu satıcının **güven skoru 41/100**. Düşük."

Niye düşük? Sistem açıklıyor:

"Ürünün fotoğraflarından 2 tanesi başka mağazalarda da bulunuyor — yani stok fotoğraf. Müşteri fotoğraflarındaki ürün, satıcının fotoğraflarındaki ürünle birebir uyuşmuyor. Yorumların %22'sinde bot şüphesi var — aynı cümle kalıbı tekrar ediyor, hesaplar yeni açılmış, yorumlar 3 günlük bir aralıkta kümelenmiş. Satıcı 6 ay önce hesap açmış, geçmişi yok."

Ahmet bunu görünce diyor ki "vay be, bu adamdan almasam iyiymiş". Çünkü kimse bu kadar derinine bakamazdı normalde. Hatta belki bot yorumlar yüzünden alacaktı, ama sistem yakaladı.

### Üçüncü sekme — Fiyat

Sistem diyor ki: "Bu ürün şu an 'indirimli' yazıyor değil mi? **Aslında değil.** Son 90 günde fiyatı zaten bu seviyedeydi. Sahte indirim. Aynı ürünün diğer satıcılardaki medyanı 980 TL. Sen 1450 TL'ye bakıyorsun. **%48 fahiş prim**. Adil fiyat aralığı: 920-1080 TL."

Bu nokta inanılmaz değerli. Çünkü Türkiye'de sahte indirim her yerde, kimse fark etmiyor.

### Dördüncü sekme — İade Riski

Sistem diyor ki: "Bu ürünün geçmiş **iade oranı %32**. Çoğu iade sebebi 'mikrofon beklediğim gibi değildi' kategorisinde. Senin önceliğin de mikrofon olduğu için, **senin için iade olasılığı yüksek**."

En sonda bir **genel skor** var: **Pişmanlık Riski: Yüksek**.

Altında bir şey var: "Bu ürünü almanı önermiyoruz. Aynı bütçede sana daha uygun iki alternatif:"

Ve iki alternatif ürün listeleniyor. Her birinin uygunluk skoru daha yüksek (mesela %82 ve %76), iade riskleri daha düşük.

Ahmet siparişten vazgeçiyor, alternatife geçiyor. **Hayatı kurtuldu.**

İşte bu birinci senaryo. Buraya kadar her şeyi anladın mı? Şimdi ikinciye geçiyorum.

## İkinci senaryo — Mehmet satıcı, ürününü düzeltmek istiyor

Mehmet bir küçük satıcı. Aynı bluetooth kulaklığı satıyor aslında. Ama iade üstüne iade alıyor, yorumlar gittikçe kötüleşiyor. Niye olduğunu bilmiyor.

Bizim sistemde Mehmet **satıcı paneline** giriyor. Ürünlerini görüyor, her birinin yanında bir risk skoru var. En kötü skorlu ürüne tıklıyor.

Karşısına yine bir panel çıkıyor ama bu sefer Ahmet'in gördüğünden farklı. Bu **satıcı gözünden** her şeyi gösteriyor.

### Birinci bölüm — Sentetik Müşteri Paneli

Bu bölüm projemizin **en parlak yeri**. Sana detaylı anlatayım, çünkü demo'da jüri bunu görünce çenesi düşecek.

Mehmet "Sentetik Müşteri Paneli" diye bir butona basıyor. Ekrana **8-12 tane avatar** çıkıyor. Her birinin altında bir profil yazıyor:

- **Zeynep, 24, İstanbul, freelancer, teknolojiye meraklı, detaycı**
- **Mehmet Bey, 45, Konya, baba, fiyat hassasiyeti yüksek, basit kullanım**
- **Ayşe, 35, Ankara, çalışan anne, çok yorum okur, güven önemli**
- **Burak, 19, Eskişehir, öğrenci, oyun odaklı, bütçe sınırlı**
- **Selim, 52, İzmir, emekli, teknoloji bilgisi az, garanti önemli**

Ve her biri **sırayla konuşmaya başlıyor**. Aslında bunlar AI ajanları, her biri o personanın gözünden Mehmet'in ürün sayfasını "geziyor" ve dürüst dönüt veriyor.

Zeynep diyor ki:

> "Selam, ben Zeynep. Bu ürünü düşünmedim. Niye? Çünkü açıklamada mikrofon kalitesi hakkında somut bir bilgi yok, ben freelancer'ım, online toplantı yapıyorum, mikrofon benim için kritik. Üç fotoğrafa baktım, ışık hep aynı yönden gelmiş, ürünün arka tarafını göremiyorum. Yorumların yarısında 'çok güzel' yazıyor ama detay yok, biraz şüpheli. Almazdım."

Mehmet Bey diyor ki:

> "Ben oğluma alacaktım ama fiyatı şu kadarken aynı parayla daha bilinen marka alabilirim. Sizin marka ne, hiç duymadım. Garanti bilgisi nerede? Bulamadım."

Burak diyor ki:

> "Oyun için mi diye baktım, hiçbir yerde gecikme bilgisi yok. Oyun kulaklığı arıyorum, bu olmaz."

Sistem 8-12 persona dönütünü topluyor ve **özet** çıkarıyor:

"Müşterilerinin %66'sı bu ürünü almazdı. En büyük 3 sebep:

1. Mikrofon bilgisi eksik (%58'i bunu söyledi)
2. Marka tanınmıyor + garanti bilgisi yok (%41)
3. Fotoğraflar yetersiz (%33)"

Mehmet şokta. Çünkü kendisi hiç bu açıdan bakmamış. Sentetik müşteriler ona **müşteri gözünden aynayı tuttu**.

### İkinci bölüm — Fiyat Stratejisi

Sistem Mehmet'e şunu gösteriyor: "Pazardaki konumun yanlış. Senin ürünün için pazar medyanı 980 TL. Sen 1450 TL'desin. Bu bir hata değilse — yani bilerek yüksek fiyatlıyorsan — açıklamanda 'niye daha pahalı' bilgisi vermelisin (mesela 'premium malzeme', 'ekstra garanti'). Vermiyorsan dönüşüm kaybediyorsun."

Hatta bir grafik var: son 30 günde rakip 5 satıcının fiyat hareketi. Mehmet görüyor ki 3 rakip son hafta fiyat düşürmüş, o düşürmemiş. Sistem diyor: "Eğer 1080-1150 bandına inersen tahmini dönüşümün %23 artar."

### Üçüncü bölüm — İade Kök Neden Analizi

Sistem geçmiş iadeleri analiz ediyor:

"Son 60 günde 24 iade aldın. Bunların:

- %58'i 'mikrofon beklediğim gibi değildi'
- %22'si 'kulak ağrıttı'
- %12'si 'oyun için yeterli değil'
- %8'i 'kargo hasarı'"

Sonra çözüm üretiyor:

"Açıklamanı şöyle düzelt: Başlığa 'günlük kullanım odaklı' ekle, 'profesyonel mikrofon değildir, basit görüşmeler için uygundur' uyarısı koy, 'oyuncu kulaklığı değildir' belirt. Eğer bunları yaparsan tahmini iade oranın **%32'den %14'e düşer**."

Hatta sistemin yazdığı **yeni açıklama taslağı** orada hazır. Mehmet tek tıkla onaylayabilir.

İşte bu da ikinci senaryo. Mehmet'in derdine direkt çözüm üretiyor. Sıradan "AI ürün açıklaması yazsın" değil bu — **teşhis koyup ardından tedavi öneriyor**.

## Üçüncü senaryo — Anlaşmazlık çıktı, hakem devreye giriyor

Ayşe bir takı seti almış. Geldi ama "kırık geldi" diyor, iade açıyor. Satıcı "ben sağlam yolladım, kullandın sonra kırdın" diyor. Klasik kavga.

Normalde bu uyuşmazlık pazaryeri müşteri hizmetlerinde haftalar sürer. Bizim sistemde:

Ayşe iade açtığında hakem modu otomatik tetikleniyor. Ayşe iddiasını yazıyor, fotoğraf yüklüyor: "Kutuyu açtım, içinden kırık çıktı."

Sistem Vision AI ile fotoğrafa bakıyor. Aynı anda satıcının orijinal listelemesini, ürün açıklamasını, kargo tutanağını, iki taraf arasındaki mesajlaşmayı tarıyor.

Birkaç saniye sonra **tarafsız bir karar metni** çıkıyor:

> "Bu vakada satıcı %65 haklı görünüyor. Sebepleri:
>
> Birinci sebep: Alıcının fotoğrafında kırıkın etrafında **kullanım izi** var — toz, parmak izi, çizik. Kutudan çıkar çıkmaz çekilmiş bir fotoğraf gibi durmuyor.
>
> İkinci sebep: Kargo tutanağında **hasar kaydı yok**, alıcı tutanağı imzalamış.
>
> Üçüncü sebep: Mesajlaşmada alıcı 3 gün boyunca ürünü kullandığından bahsetmiş, sonra 'kırıldı' demiş.
>
> Ama alıcı da bir noktada haklı: Ürün açıklamasında 'darbeye dayanıklı' ifadesi geçiyor — bu yanıltıcı. Kırılgan ürünler için 'dikkatli kullanılmalı' uyarısı olmalı.
>
> **Önerimiz: %40 kısmi iade.** Alıcıya tutarın %40'ı iade edilsin, ürün alıcıda kalsın. Eğer iki taraf da kabul ederse uyuşmazlık bugün çözülür."

İki tarafa da bu karar bildiriliyor. Kabul ederlerse iş bitiyor. Etmezlerse insan müşteri hizmetlerine eskalasyon oluyor — ama orada bile hakem raporu önceden hazır.

**Pazaryeri için altın değerinde.** Haftalarca süren işler dakikalara iniyor.

# Şimdi büyük resmi tekrar görelim

Üç senaryo gördün:

- Alıcı **satın almadan önce** korunuyor
- Satıcı **satarken** güçlendiriliyor
- Anlaşmazlıkta **tarafsız hakem** devreye giriyor

Üçü de aynı sistemin parçaları. Üçü de aynı analiz motorundan besleniyor. Üçü de aynı yapay zeka ajanlarını kullanıyor — sadece **hangi açıdan baktıklarına** göre sonuç farklı çıkıyor.

Bizim cümlemiz şu: **"Biz e-ticaret sitesi yapmıyoruz, e-ticaret sitelerinin üstüne giyilen bir akıl ve güven katmanı yapıyoruz."**

# Sistemin nasıl çalıştığı — biraz daha derin

Sana içinde ne döndüğünü de anlatayım, kafanda tam otursun.

İçeride **yapay zeka ajanları** var. Ajanlar dediğimiz şey, her birinin **tek bir uzmanlık alanı** olan küçük AI'lar gibi düşün. Bunların hepsi Gemini kullanıyor, ama her biri farklı bir göreve odaklı:

Bir ajan **kullanıcının ihtiyacını** anlamakla görevli. Ahmet "online ders + oyun + mikrofon" yazdığında, bu ajan o cümleyi yapılandırılmış bir profile çeviriyor.

Bir başka ajan **ürünün gerçeğini** çıkarıyor. Açıklamayı, teknik özellikleri, fotoğrafları inceleyip "bu ürün aslında ne sunuyor" sorusunun cevabını üretiyor.

Bir başka ajan **görsel forensik** yapıyor. Fotoğraflar stok foto mu, watermark izi var mı, müşteri fotoğraflarıyla uyumlu mu diye bakıyor.

Bir başka ajan **yorumları madencilik** yapıyor. Yorumları kategorize ediyor, hangi şikayet hangi sıklıkta tekrar ediyor buluyor, bot pattern arıyor.

Bir başka ajan **fiyat ve pazar** analizi yapıyor. Aynı ürünün diğer satıcılardaki fiyatına bakıyor, sahte indirim tespit ediyor.

Bir başka ajan **iade riski** tahmin ediyor. Geçmiş iade verisinden olasılık çıkarıyor.

Bir başka ajan **satıcıya öneri** üretiyor.

Ve en kritik olanı: bir **doğrulama ajanı** var. Bütün diğer ajanların çıktısını alıyor ve şunu kontrol ediyor: "Bu iddianın kanıtı nerede? Mikrofon kötü diyorsun, hangi yorumlardan bu sonuca vardın? Eğer kanıt yoksa, sus." Yani bu ajan **halüsinasyon önleme** görevinde.

Bütün bu ajanlar **bir orkestratörün** kontrolünde. Orkestratör hangi senaryoda kimin çalışacağına karar veriyor. Alıcı modunda farklı, satıcı modunda farklı, hakem modunda farklı.

**Önemli not:** Bütün sayısal hesaplamaları (yüzdeler, skorlar, risk hesapları) AI'a yaptırmıyoruz. AI sadece **anlamayı ve metin üretimini** yapıyor. Sayılar **kod tarafında deterministik** olarak hesaplanıyor. Bu çok kritik çünkü AI sayılarda yalan söyleyebiliyor. Biz buna izin vermiyoruz.

# Niye birinci olabiliriz?

Çünkü herkesin yapacağı 3 fikir var bu yarışmada:

1. AI ürün açıklaması yazsın
2. AI yorum özetlesin
3. AI ürün önersin

Hepsi yapılmış, hepsi sıradan, hatta yarışmanın slaytında **örnek olarak** verilmiş. Yani jüri bu fikirleri görünce "yine mi" diyecek.

Biz farklıyız çünkü:

**Bizim fikrimiz öneri değil, karar.** Sadece "şu ürünü al" demiyoruz. "Şu sebepten, şu kanıtla, sana uygun değil" diyoruz.

**Bizim sistemimiz iki taraflı.** Hem alıcı hem satıcı hem hakem. Tek motor üç problemi çözüyor.

**Bizim agentic yapımız sahici.** Yarışma "agentic yapı" diye ayrı bir puan veriyor. Bizde **gerçek** ajan ağacı var ve ekranda **canlı görünüyor**.

**Bizim analizimiz kanıta dayalı.** AI sallamıyor, her iddianın arkasında yorum, fotoğraf, fiyat verisi var. Doğrulama ajanı bunu kontrol ediyor.

**Bizim problemimiz çok somut.** Sahte ürün, sahte yorum, sahte indirim, beden uyumsuzluğu — bunlar Türk e-ticaretinin **kanayan yarası**.

# Sana son cümle

Kardeşim, bizim yaptığımız şey aslında **e-ticaretin hekim ofisi**. İnsanlar "almadan önce kontrol ettir", satıcılar "satıştan önce muayene ol", uyuşmazlıkta da "bilirkişi raporu al". Üç ayrı kapı, aynı hastane, aynı doktorlar (ajanlar), aynı laboratuvar (analiz motoru).

Şimdi sana soruyorum:

Kafanda canlandı mı? Üç senaryoyu da gözünde gördün mü? "Bana uygun mu?" butonuna basan Ahmet'i, sentetik müşterilerin önüne dökülen Mehmet'i, hakem kararını okuyan Ayşe'yi gördün mü?

Eğer gördüysen, sen artık bu projeyi **anladın**. Tech stack falan kolay, onu ben hallederim — sen yeter ki **fikrin ruhunu** içine sindir. Çünkü demo videosunu çekerken, sunumu yaparken, jüriyle konuşurken **bu hikayeyi** anlatacağız. Tek tek özellik saymayacağız. Üç kullanıcının hayatını nasıl değiştirdiğimizi anlatacağız.

Kafanda netleşmeyen, "bu kısmı bir daha anlat" dediğin yer var mı? Söyle, oturalım, açalım. Yoksa "tamam abi anladım, kollarımı sıvayalım" diyorsan, kod tarafına geçelim.
