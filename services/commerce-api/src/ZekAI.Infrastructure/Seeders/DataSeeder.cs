using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using ZekAI.Domain.Entities;
using ZekAI.Domain.Enums;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Infrastructure.Seeders;

public class DataSeeder(AppDbContext db)
{
    public async Task SeedAsync()
    {
        // ── Categories (seed once) ──
        if (!await db.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new() { Name = "Elektronik",      Slug = "elektronik" },
                new() { Name = "Spor & Outdoor",  Slug = "spor-outdoor" },
                new() { Name = "Mutfak",          Slug = "mutfak" },
                new() { Name = "Ev & Yaşam",      Slug = "ev-yasam" },
                new() { Name = "Aksesuar",        Slug = "aksesuar" },
                new() { Name = "Anne & Bebek",    Slug = "anne-bebek" },
            };
            db.Categories.AddRange(categories);
            await db.SaveChangesAsync();
        }

        // ── Giyim category — add if missing (idempotent, runs even on populated DB) ──
        if (!await db.Categories.AnyAsync(c => c.Slug == "giyim"))
        {
            db.Categories.Add(new Category { Name = "Giyim", Slug = "giyim" });
            await db.SaveChangesAsync();
        }

        // ── Resolve category IDs by slug ──
        var catMap = await db.Categories.ToDictionaryAsync(c => c.Slug, c => c.Id);
        if (!catMap.ContainsKey("elektronik")) return; // unexpected state — bail

        var elec  = catMap["elektronik"];
        var spor  = catMap["spor-outdoor"];
        var mut   = catMap["mutfak"];
        var ev    = catMap["ev-yasam"];
        var akc   = catMap["aksesuar"];
        var bebek = catMap["anne-bebek"];
        var giyim = catMap["giyim"];

        // ── Products — add only if missing by ID ──
        var existingProductIds = await db.Products.Select(p => p.Id).ToHashSetAsync();

        // ── Products ──
        var products = new List<Product>
        {
            new()
            {
                Id = "bluetooth-kulaklik-pro-x1",
                Title = "Premium Bluetooth Kulaklık Beyaz",
                Brand = "SoundPro",
                SellerName = "Mehmet Elektronik",
                CategoryId = elec,
                Price = 1015,
                OriginalPrice = 1299,
                Rating = 4.0,
                ReviewCount = 142,
                Stock = 18,
                ShortDescription = "Günlük kullanım için Bluetooth 5.0 kablosuz kulaklık.",
                Description = "Günlük müzik dinleme, video izleme ve kısa telefon görüşmeleri için tasarlanan kablosuz kulaklık. 20 saate kadar pil ömrü, hafif gövde ve kolay Bluetooth eşleştirme ile pratik kullanım sunar.\n\nÖnemli: Profesyonel oyun, düşük gecikme ve yüksek kaliteli mikrofon beklentisi olan kullanıcılar için önerilmez.",
                FeaturesJson = """{"Bluetooth":"5.0","Pil Ömrü":"20 saat","Ağırlık":"250g","Su Direnci":"IPX5","Garanti":"2 Yıl"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl Garanti"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "spor-ayakkabi-runflex",
                Title = "RunFlex Hafif Tabanlı Günlük Spor Ayakkabı",
                Brand = "RunFlex",
                SellerName = "Mehmet Elektronik",
                CategoryId = spor,
                Price = 899,
                Rating = 3.6,
                ReviewCount = 64,
                Stock = 46,
                ShortDescription = "Nefes alan taban, hafif tasarım.",
                Description = "Günlük yürüyüş ve hafif koşu için tasarlanan spor ayakkabı. Geniş ayak yapısı için yarım numara büyük önerilir.",
                FeaturesJson = """{"Taban":"Nefes Alan Mesh","Ağırlık":"280g","Beden":"Normal Kalıp"}""",
                BadgesJson = """["Ücretsiz Kargo"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "mutfak-robotu-compact",
                Title = "CookMate Compact 900W Mutfak Robotu",
                Brand = "CookMate",
                SellerName = "Mehmet Elektronik",
                CategoryId = mut,
                Price = 1849,
                Rating = 4.0,
                ReviewCount = 26,
                Stock = 16,
                ShortDescription = "900W güçlü motor, 5 hız ayarı.",
                Description = "Günlük mutfak kullanımı için 900W kompakt mutfak robotu. Doğrama, karıştırma ve püre yapma işlemleri için 5 farklı hız ayarı sunar.",
                FeaturesJson = """{"Güç":"900W","Kapasite":"1.5L","Hız":"5 Ayar","Bıçak":"Paslanmaz Çelik"}""",
                BadgesJson = """["2 Yıl Garanti","Ücretsiz Kargo"]""",
                CargoText = "3-5 iş günü",
            },
            new()
            {
                Id = "akilli-saat-fit-neo",
                Title = "FitNeo S3 Akıllı Saat Nabız ve Uyku Takipli",
                Brand = "FitNeo",
                SellerName = "Mehmet Elektronik",
                CategoryId = elec,
                Price = 1299,
                Rating = 4.3,
                ReviewCount = 87,
                Stock = 34,
                ShortDescription = "Nabız, uyku ve egzersiz takibi.",
                Description = "Nabız, uyku kalitesi ve günlük egzersiz takibi için akıllı saat.",
                FeaturesJson = """{"Ekran":"1.4 inç AMOLED","Pil":"7 gün","Su Direnci":"5ATM"}""",
                BadgesJson = """["Ücretsiz Kargo"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "ergonomik-calisma-sandalyesi",
                Title = "NordDesk Bel Destekli Ergonomik Çalışma Sandalyesi",
                Brand = "NordDesk",
                SellerName = "Mehmet Elektronik",
                CategoryId = ev,
                Price = 2799,
                Rating = 4.1,
                ReviewCount = 54,
                Stock = 11,
                ShortDescription = "Ayarlanabilir bel desteği, nefes alan kumaş.",
                Description = "Uzun çalışma saatleri için ergonomik tasarım. Ayarlanabilir bel desteği ve kol dayama.",
                FeaturesJson = """{"Yükseklik":"Ayarlanabilir","Bel Desteği":"Var","Maksimum Ağırlık":"120kg"}""",
                BadgesJson = """["Ücretsiz Montaj","2 Yıl Garanti"]""",
                CargoText = "5-7 iş günü",
            },
            new()
            {
                Id = "hava-temizleyici-mini",
                Title = "AirPure Mini HEPA Filtreli Hava Temizleyici",
                Brand = "AirPure",
                SellerName = "Mehmet Elektronik",
                CategoryId = ev,
                Price = 2190,
                Rating = 4.5,
                ReviewCount = 31,
                Stock = 22,
                ShortDescription = "HEPA filtre, 30m² alan için ideal.",
                Description = "HEPA filtreli mini hava temizleyici. 30 metrekareye kadar etkili.",
                FeaturesJson = """{"Alan":"30m²","Filtre":"HEPA H13","Ses":"<30dB"}""",
                BadgesJson = """["Ücretsiz Kargo"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "telefon-kilifi-magsafe",
                Title = "ClearShield MagSafe Uyumlu Telefon Kılıfı",
                Brand = "ClearShield",
                SellerName = "Mehmet Elektronik",
                CategoryId = akc,
                Price = 399,
                Rating = 4.3,
                ReviewCount = 96,
                Stock = 82,
                ShortDescription = "MagSafe uyumlu, sararmaz PC malzeme.",
                Description = "iPhone 15 ve 14 serisi ile uyumlu MagSafe kılıf.",
                FeaturesJson = """{"Malzeme":"PC+TPU","MagSafe":"Evet","Renk":"Şeffaf"}""",
                BadgesJson = """["Ücretsiz Kargo"]""",
                CargoText = "1 iş günü",
            },
            new()
            {
                Id = "usb-c-hub-pro",
                Title = "DockPro 7 Girişli USB-C Hub",
                Brand = "DockPro",
                SellerName = "Mehmet Elektronik",
                CategoryId = elec,
                Price = 1190,
                Rating = 4.2,
                ReviewCount = 33,
                Stock = 28,
                ShortDescription = "7 port, 4K HDMI, 100W PD.",
                Description = "MacBook ve Windows laptop için 7-in-1 USB-C hub.",
                FeaturesJson = """{"Port":"7","HDMI":"4K 60Hz","USB-A":"3x USB 3.0","PD":"100W"}""",
                BadgesJson = """["Ücretsiz Kargo"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "seramik-taki-seti-beyaz",
                Title = "LunaCraft Beyaz Seramik Takı Seti",
                Brand = "LunaCraft",
                SellerName = "Mehmet Elektronik",
                CategoryId = akc,
                Price = 380,
                Rating = 4.8,
                ReviewCount = 22,
                Stock = 7,
                ShortDescription = "El yapımı seramik kolye + küpe seti.",
                Description = "El yapımı beyaz seramik kolye ve küpe seti. Kırılganlık uyarısı: nazik taşıyınız.",
                FeaturesJson = """{"Malzeme":"Seramik","Set":"Kolye + Küpe","Ambalaj":"Hediye Kutusu"}""",
                BadgesJson = """["El Yapımı","Hediye Paket"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "bebek-kamerasi-nightview",
                Title = "NightView Wi-Fi Bebek Kamerası",
                Brand = "NightView",
                SellerName = "Mehmet Elektronik",
                CategoryId = bebek,
                Price = 1590,
                Rating = 4.6,
                ReviewCount = 14,
                Stock = 9,
                ShortDescription = "Gece görüşlü, iki yönlü ses, Wi-Fi.",
                Description = "1080p gece görüşlü Wi-Fi bebek kamerası. iOS ve Android uyumlu.",
                FeaturesJson = """{"Çözünürlük":"1080p","Gece Görüşü":"Var","Wi-Fi":"2.4GHz"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl Garanti"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "masa-lambasi-led",
                Title = "FocusLine Şarjlı LED Masa Lambası",
                Brand = "FocusLine",
                SellerName = "Mehmet Elektronik",
                CategoryId = ev,
                Price = 690,
                Rating = 4.7,
                ReviewCount = 38,
                Stock = 41,
                ShortDescription = "USB şarjlı, 3 renk modu, dokunmatik.",
                Description = "USB ile şarj edilebilir LED masa lambası. 3 renk sıcaklığı ve 5 parlaklık seviyesi.",
                FeaturesJson = """{"Şarj":"USB-C","Pil":"2000mAh","Mod":"3 Renk"}""",
                BadgesJson = """["Ücretsiz Kargo"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "kahve-degirmeni-burr",
                Title = "BrewLab Burr Öğütücülü Kahve Değirmeni",
                Brand = "BrewLab",
                SellerName = "Mehmet Elektronik",
                CategoryId = mut,
                Price = 1490,
                Rating = 4.4,
                ReviewCount = 19,
                Stock = 13,
                ShortDescription = "Burr öğütücü, 18 kademe ayar.",
                Description = "Manuel burr kahve değirmeni. Espresso'dan French Press'e 18 kademe ayar.",
                FeaturesJson = """{"Öğütücü":"Burr","Kademe":"18","Kapasite":"40g"}""",
                BadgesJson = """["Ücretsiz Kargo"]""",
                CargoText = "2-3 iş günü",
            },

            // ── TechZone Bilgisayar ──────────────────────────────────────────
            new()
            {
                Id = "laptop-asus-vivobook-15",
                Title = "ASUS VivoBook 15 i5-1235U 16GB 512GB SSD FHD Laptop",
                Brand = "ASUS",
                SellerName = "TechZone Bilgisayar",
                CategoryId = elec,
                Price = 2490,
                OriginalPrice = 2890,
                Rating = 3.8,
                ReviewCount = 112,
                Stock = 23,
                ShortDescription = "Intel Core i5-1235U, 16GB RAM, 512GB SSD, 15.6\" FHD IPS ekran.",
                Description = "Günlük ofis kullanımı, üniversite ödevleri ve web browsing için tasarlanan giriş seviyesi laptop. 12. nesil Intel Core i5 işlemci ve 16GB RAM ile akıcı çoklu görev performansı sunar.\n\nÖnemli uyarı: Yerleşik Intel Iris Xe grafik kartı video editing veya oyun için yeterli değildir. Uzun süreli yoğun işlemlerde fan gürültüsü artmaktadır.",
                FeaturesJson = """{"İşlemci":"Intel Core i5-1235U","RAM":"16GB DDR4","Depolama":"512GB NVMe SSD","Ekran":"15.6\" FHD IPS 60Hz","Grafik":"Intel Iris Xe","Pil":"50Wh (~7 saat)","Ağırlık":"1.73kg"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl Garanti","Resmi Distribütör"]""",
                CargoText = "3-5 iş günü",
            },
            new()
            {
                Id = "laptop-lenovo-ideapad-slim5",
                Title = "Lenovo IdeaPad Slim 5 i5-13420H 16GB 512GB OLED 14\" Laptop",
                Brand = "Lenovo",
                SellerName = "TechZone Bilgisayar",
                CategoryId = elec,
                Price = 3290,
                OriginalPrice = 3690,
                Rating = 4.3,
                ReviewCount = 78,
                Stock = 14,
                ShortDescription = "2.8K OLED ekran, i5-13420H işlemci, 16GB LPDDR5.",
                Description = "Taşınabilirlik ve ekran kalitesini ön planda tutan orta segment laptop. 2.8K çözünürlüklü OLED ekranı renk hassasiyetiyle fotoğraf düzenleme ve içerik tüketimi için üstün deneyim sunar.\n\nDikkat: 256GB SSD versiyonu ile karıştırmayın. Bu model 512GB SSD içermektedir. Tek USB-A port mevcuttur, hub ihtiyacınız olabilir.",
                FeaturesJson = """{"İşlemci":"Intel Core i5-13420H","RAM":"16GB LPDDR5","Depolama":"512GB NVMe SSD","Ekran":"14\" 2.8K OLED 90Hz","Grafik":"Intel UHD","Pil":"60Wh (~9 saat)","Ağırlık":"1.46kg"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl Garanti"]""",
                CargoText = "3-5 iş günü",
            },
            new()
            {
                Id = "laptop-macbook-air-m2",
                Title = "Apple MacBook Air M2 8GB 256GB 13.6\" Liquid Retina Laptop",
                Brand = "Apple",
                SellerName = "TechZone Bilgisayar",
                CategoryId = elec,
                Price = 5990,
                Rating = 4.8,
                ReviewCount = 203,
                Stock = 8,
                ShortDescription = "M2 çip, fanless tasarım, 13.6\" Liquid Retina ekran.",
                Description = "Apple Silicon M2 çipiyle gürültüsüz fanless tasarımda inanılmaz performans. 18 saate kadar pil ömrü ve 500 nit parlaklıklı Liquid Retina ekran sunar. macOS ekosisteminde en verimli deneyim için tercih edilen model.\n\nÖnemli: 8GB birleşik bellek ve 256GB SSD bu fiyat için temel konfigürasyondur. Yoğun profesyonel iş yükleri için 16GB model düşünülmelidir.",
                FeaturesJson = """{"İşlemci":"Apple M2 (8 çekirdek CPU)","RAM":"8GB Birleşik Bellek","Depolama":"256GB SSD","Ekran":"13.6\" Liquid Retina 2560x1664","Grafik":"Apple M2 10 çekirdek GPU","Pil":"~18 saat","Ağırlık":"1.24kg"}""",
                BadgesJson = """["Ücretsiz Kargo","1 Yıl Apple Garantisi","Apple Yetkili Satıcı"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "monitor-samsung-27-qhd",
                Title = "Samsung 27\" QHD 165Hz Curved Gaming Monitör LS27CG552",
                Brand = "Samsung",
                SellerName = "TechZone Bilgisayar",
                CategoryId = elec,
                Price = 3490,
                OriginalPrice = 3990,
                Rating = 4.4,
                ReviewCount = 56,
                Stock = 19,
                ShortDescription = "27\" 1000R eğimli VA panel, 2560x1440, 165Hz, 1ms.",
                Description = "Oyun ve içerik üretimi için eğimli VA panel monitör. 165Hz yenileme hızı ve 1ms yanıt süresiyle aksiyon oyunlarında avantaj sağlar. HDR10 desteği ile sinema içeriklerinde derinlik hissi verir.",
                FeaturesJson = """{"Panel":"27\" VA 1000R Curved","Çözünürlük":"2560x1440 (QHD)","Yenileme":"165Hz","Yanıt":"1ms (MPRT)","HDR":"HDR10","Bağlantı":"HDMI 2.0, DisplayPort 1.2","Yükseklik":"Ayarlanabilir"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl Garanti","VESA 75x75"]""",
                CargoText = "3-5 iş günü",
            },
            new()
            {
                Id = "monitor-lg-27-4k-ips",
                Title = "LG 27\" 4K UHD IPS HDR400 Profesyonel Monitör 27UL500",
                Brand = "LG",
                SellerName = "TechZone Bilgisayar",
                CategoryId = elec,
                Price = 5990,
                OriginalPrice = 6490,
                Rating = 4.5,
                ReviewCount = 41,
                Stock = 11,
                ShortDescription = "27\" IPS 4K UHD, sRGB %98, HDR400, USB-C.",
                Description = "Grafik tasarım, fotoğrafçılık ve profesyonel içerik üretimi için 4K IPS monitör. sRGB renk gamı %98 kapsama ile renk hassasiyeti kritik işler için güvenilir referans sunar. USB-C bağlantısı laptop'lardan tek kablo ile sinyal+şarj imkânı tanır.",
                FeaturesJson = """{"Panel":"27\" IPS","Çözünürlük":"3840x2160 (4K UHD)","Yenileme":"60Hz","HDR":"HDR400","sRGB":"%98","Bağlantı":"HDMI 2.0, DisplayPort 1.4, USB-C","VESA":"75x75"}""",
                BadgesJson = """["Ücretsiz Kargo","3 Yıl Garanti","Fabrika Kalibrasyonu"]""",
                CargoText = "3-5 iş günü",
            },

            // ── MobilePro Telefon ────────────────────────────────────────────
            new()
            {
                Id = "telefon-samsung-galaxy-a55",
                Title = "Samsung Galaxy A55 5G 8GB+256GB Akıllı Telefon",
                Brand = "Samsung",
                SellerName = "MobilePro Telefon",
                CategoryId = elec,
                Price = 2390,
                OriginalPrice = 2690,
                Rating = 4.0,
                ReviewCount = 189,
                Stock = 42,
                ShortDescription = "Exynos 1480, 6.6\" Super AMOLED, 50MP kamera, IP67.",
                Description = "Orta segmentin güçlü temsilcisi. Exynos 1480 işlemci ve 8GB RAM kombinasyonu günlük kullanım için yeterli performans sunar. IP67 suya dayanıklılık günlük kullanım güvencesi verir. Samsung'un 4 yıl OS güncellemesi vaadi uzun vadeli kullanım için avantaj.\n\nDikkat: 120Hz ekran desteği mevcut ancak pil tasarrufu için 60Hz'de çalışıyor olabilir. Dahili hoparlör stereo değil.",
                FeaturesJson = """{"İşlemci":"Exynos 1480 (4nm)","RAM":"8GB","Depolama":"256GB (microSD destekli)","Ekran":"6.6\" Super AMOLED 120Hz","Ana Kamera":"50MP + 12MP + 5MP","Ön Kamera":"32MP","Pil":"5000mAh","Su Direnci":"IP67"}""",
                BadgesJson = """["Ücretsiz Kargo","Resmi Samsung Garantisi","4 Yıl OS Güncelleme"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "telefon-xiaomi-14t-pro",
                Title = "Xiaomi 14T Pro 12GB+512GB Leica Kamera Akıllı Telefon",
                Brand = "Xiaomi",
                SellerName = "MobilePro Telefon",
                CategoryId = elec,
                Price = 3490,
                OriginalPrice = 3890,
                Rating = 4.2,
                ReviewCount = 143,
                Stock = 31,
                ShortDescription = "Dimensity 9300+, 50MP Leica kamera, 144Hz AMOLED, 5000mAh.",
                Description = "Leica işbirliğiyle geliştirilen kamera sistemi ve yüksek performanslı Dimensity 9300+ işlemciyle premium segment deneyimi sunan amiral gemisi. 144Hz ProMotion ekran ve 120W hızlı şarj pratik günlük kullanım sağlar.\n\nNot: MIUI arayüzü bazı kullanıcılara yabancı gelebilir. Global ROM Türkçe dil desteklidir.",
                FeaturesJson = """{"İşlemci":"MediaTek Dimensity 9300+ (4nm)","RAM":"12GB","Depolama":"512GB","Ekran":"6.67\" AMOLED 144Hz","Ana Kamera":"50MP Leica (OIS) + 50MP Tele + 12MP Geniş","Ön Kamera":"32MP","Pil":"5000mAh","Şarj":"120W HyperCharge"}""",
                BadgesJson = """["Ücretsiz Kargo","Leica Kamera Sistemi","120W Hızlı Şarj Adaptörü Dahil"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "telefon-iphone-15",
                Title = "Apple iPhone 15 128GB Dynamic Island Akıllı Telefon",
                Brand = "Apple",
                SellerName = "MobilePro Telefon",
                CategoryId = elec,
                Price = 4990,
                Rating = 4.6,
                ReviewCount = 317,
                Stock = 17,
                ShortDescription = "A16 Bionic, 6.1\" Super Retina XDR, Dynamic Island, USB-C.",
                Description = "Apple'ın Dynamic Island özelliğiyle tanışan standart iPhone modeli. A16 Bionic çip ile yıllarca güncel kalacak performans ve iOS ekosisteminin tüm avantajlarını sunar. USB-C geçişi aksesuarları standartlaştırdı.\n\nDikkat: 128GB depolama hızla dolabilir; iCloud aboneliği gerekebilir. 60Hz ProMotion yok — ana ekran 60Hz'de çalışıyor.",
                FeaturesJson = """{"İşlemci":"Apple A16 Bionic","RAM":"6GB","Depolama":"128GB","Ekran":"6.1\" Super Retina XDR OLED 60Hz","Ana Kamera":"48MP (Main) + 12MP (Ultra Wide)","Ön Kamera":"12MP TrueDepth","Pil":"~20 saat video","Bağlantı":"USB-C"}""",
                BadgesJson = """["Ücretsiz Kargo","Apple Türkiye Garantisi","Dynamic Island"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "saat-samsung-galaxy-watch6",
                Title = "Samsung Galaxy Watch 6 Classic 47mm Akıllı Saat",
                Brand = "Samsung",
                SellerName = "MobilePro Telefon",
                CategoryId = elec,
                Price = 3490,
                OriginalPrice = 3990,
                Rating = 4.1,
                ReviewCount = 67,
                Stock = 22,
                ShortDescription = "Döner çerçeve, BioActive sensör, WearOS, 47mm.",
                Description = "Samsung'un klasik döner çerçeve tasarımına sahip akıllı saati. BioActive sensör kalp atışı, EKG ve kan basıncı ölçümü yapar. WearOS ile Google uygulamaları ve Samsung Health entegrasyonu güçlüdür.\n\nÖnemli: En iyi deneyim Galaxy akıllı telefon ile yaşanır. iOS ile bazı özellikler kısıtlıdır.",
                FeaturesJson = """{"Boyut":"47mm","Ekran":"1.47\" Super AMOLED 480x480","Sensör":"BioActive (EKG, Nabız, Kan Basıncı)","İşletim":"WearOS + One UI Watch","GPS":"Dahili","Pil":"~40 saat","Su Direnci":"5ATM + IP68"}""",
                BadgesJson = """["Ücretsiz Kargo","Samsung Garantisi","Döner Çerçeve"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "tablet-samsung-tab-s9fe",
                Title = "Samsung Galaxy Tab S9 FE Wi-Fi 6GB+128GB Tablet",
                Brand = "Samsung",
                SellerName = "MobilePro Telefon",
                CategoryId = elec,
                Price = 3990,
                OriginalPrice = 4490,
                Rating = 4.2,
                ReviewCount = 88,
                Stock = 27,
                ShortDescription = "10.9\" TFT 90Hz, Exynos 1380, S Pen dahil, IP68.",
                Description = "S Pen dahil geldiği için not alma ve dijital çizim için uygun fiyatlı tablet. IP68 su direnci ve samsung DeX desteği ile produktivite odaklı kullanım için dengeli seçim.\n\nDikkat: FE (Fan Edition) LCD panel kullanır, üst model Tab S9 serisi AMOLED'dir. Parlak ışıkta ekran parlaklığı yeterli olabilir.",
                FeaturesJson = """{"Ekran":"10.9\" TFT LCD 90Hz 2304x1440","İşlemci":"Exynos 1380","RAM":"6GB","Depolama":"128GB (microSD destekli)","Kalem":"S Pen Dahil","Pil":"8000mAh","Su Direnci":"IP68"}""",
                BadgesJson = """["Ücretsiz Kargo","S Pen Dahil","IP68 Su Geçirmez","4 Yıl OS Güncelleme"]""",
                CargoText = "2-3 iş günü",
            },

            // ── AudioMaster Ses ──────────────────────────────────────────────
            new()
            {
                Id = "kulaklik-anker-soundcore-q45",
                Title = "Anker Soundcore Q45 ANC Kablosuz Kulaklık",
                Brand = "Anker",
                SellerName = "AudioMaster Ses",
                CategoryId = elec,
                Price = 1490,
                OriginalPrice = 1790,
                Rating = 4.2,
                ReviewCount = 234,
                Stock = 58,
                ShortDescription = "Adaptif ANC, 50 saat pil, çoklu cihaz bağlantısı.",
                Description = "Uygun fiyatlı ANC (Aktif Gürültü Engelleme) kategorisinde güçlü rakip. Adaptif ANC sistemi ortam gürültü seviyesine göre otomatik ayarlanır. 50 saatlik pil ömrü uzun yolculuklar için idealdir.\n\nNot: ANC etkinliği Sony veya Bose premium modelleri kadar güçlü değildir. Yoğun gürültülü ortamlarda (uçak, metro) bazı sızıntı hissedilebilir.",
                FeaturesJson = """{"ANC":"Adaptif ANC","Bluetooth":"5.3","Pil":"50 saat (ANC açık: 40 saat)","Şarj":"USB-C (10 dk = 4 saat)","Çoklu Cihaz":"2 cihaz eş zamanlı","Driver":"40mm","Katlanabilir":"Evet"}""",
                BadgesJson = """["Ücretsiz Kargo","18 Ay Garanti","USB-C Şarj"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "kulaklik-jbl-tune770",
                Title = "JBL Tune 770NC ANC Kablosuz Kulak Üstü Kulaklık",
                Brand = "JBL",
                SellerName = "AudioMaster Ses",
                CategoryId = elec,
                Price = 2190,
                OriginalPrice = 2590,
                Rating = 4.3,
                ReviewCount = 176,
                Stock = 34,
                ShortDescription = "JBL Pure Bass Sound, ANC, 70 saat pil, hafif tasarım.",
                Description = "JBL'nin karakteristik bas odaklı sesi ve uzun pil ömrüyle öne çıkan orta segment ANC kulaklık. ANC kapalıyken 70 saat pil ömrü beklenti yaratır. Katlanabilir tasarım çantada az yer kaplar.\n\nNot: Bas ağırlıklı ses imzası her müzik türüne uymayabilir. Klasik müzik ve podcast tercihleri için diğer modeller değerlendirilebilir.",
                FeaturesJson = """{"ANC":"Adaptive ANC","Bluetooth":"5.3","Pil":"70 saat (ANC kapalı), 44 saat (ANC açık)","Şarj":"USB-C","Multipoint":"2 cihaz","Driver":"40mm","Katlanabilir":"Evet","Ses":"JBL Pure Bass"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl JBL Garanti"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "kulaklik-sony-wh1000xm5",
                Title = "Sony WH-1000XM5 Premium ANC Kablosuz Kulaklık",
                Brand = "Sony",
                SellerName = "AudioMaster Ses",
                CategoryId = elec,
                Price = 4890,
                Rating = 4.7,
                ReviewCount = 512,
                Stock = 9,
                ShortDescription = "Endüstri lideri ANC, 30 saat pil, LDAC Hi-Res Audio.",
                Description = "Gürültü engelleme teknolojisinde uzun süredir referans kabul edilen model. 8 adet mikrofon ile ortam sesini analiz eden AI işlemci, en gürültülü ortamlarda bile sessizlik sağlar. LDAC codec desteğiyle Hi-Res Audio kalitesinde müzik dinlenir.\n\nDikkat: Katlanmaz tasarım çanta içinde daha fazla yer kaplar. Bu fiyat için fazla harcama yapmak istemeyenler Anker veya JBL alternatiflerini değerlendirmeli.",
                FeaturesJson = """{"ANC":"8 Mikrofon + AI İşlemci","Bluetooth":"5.2 (LDAC, AAC, SBC)","Pil":"30 saat (ANC açık)","Şarj":"USB-C (3 dk = 3 saat)","Multipoint":"2 cihaz","Driver":"30mm","Hi-Res":"LDAC","Katlanabilir":"Hayır"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl Sony Garanti","Hi-Res Audio","LDAC"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "hoparlor-jbl-charge5",
                Title = "JBL Charge 5 Bluetooth Taşınabilir Hoparlör Su Geçirmez",
                Brand = "JBL",
                SellerName = "AudioMaster Ses",
                CategoryId = elec,
                Price = 2690,
                OriginalPrice = 2990,
                Rating = 4.5,
                ReviewCount = 389,
                Stock = 46,
                ShortDescription = "IP67 su geçirmez, 20 saat pil, powerbank özelliği.",
                Description = "Açık hava kullanımı için IP67 su ve toz geçirmezlik sertifikalı taşınabilir hoparlör. JBL'nin ikon haline gelen Charge serisinin beşinci nesli daha güçlü ses, daha uzun pil ve powerbank özelliği sunuyor.\n\nNot: Stereo ses için iki Charge 5 gerekir (PartyBoost). Tek başına mono ses çıkışı yapar.",
                FeaturesJson = """{"Su Direnci":"IP67","Pil":"20 saat","Şarj":"USB-C","Powerbank":"Evet (diğer cihazları şarj eder)","Bluetooth":"5.1","Bağlantı":"1x USB-A şarj çıkışı","Ağırlık":"960g","Renk":"5 seçenek"}""",
                BadgesJson = """["Ücretsiz Kargo","IP67 Su Geçirmez","Powerbank Özelliği","1 Yıl Garanti"]""",
                CargoText = "1-2 iş günü",
            },

            // ── HomeStyle Ev Elektroniği ─────────────────────────────────────
            new()
            {
                Id = "robot-supurge-dreame-d10plus",
                Title = "Dreame D10 Plus Robot Süpürge ve Otomatik Boşaltmalı Şarj İstasyonu",
                Brand = "Dreame",
                SellerName = "HomeStyle Ev Elektroniği",
                CategoryId = ev,
                Price = 4990,
                OriginalPrice = 5990,
                Rating = 4.5,
                ReviewCount = 143,
                Stock = 18,
                ShortDescription = "4000Pa emiş gücü, otomatik toz boşaltma, 250ml su tankı.",
                Description = "Otomatik boşaltmalı şarj istasyonu sayesinde haftalarca toz torbasını boşaltmaya gerek kalmaz. 4000Pa emiş gücü halı ve sert zeminlerde etkili temizlik sağlar. Wi-Fi ve uygulama kontrolü ile oda bazlı temizleme planlaması yapılır.\n\nDikkat: Çok ince halı kenarlıkları veya yüksek eşikler geçişte sorun yaşatabilir. LiDAR haritalama özelliği doğru kurulum gerektiriyor.",
                FeaturesJson = """{"Emiş Gücü":"4000Pa","Haritalama":"LiDAR 3D","Su Tankı":"250ml","Toz Haznesi":"570ml","Otomatik Boşaltma":"60 gün kapasiteli istasyon","Kontrol":"Wi-Fi Uygulama","Pil":"5200mAh (~180 dk)","Ses":"<70dB"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl Garanti","Otomatik Boşaltma İstasyonu Dahil"]""",
                CargoText = "3-5 iş günü",
            },
            new()
            {
                Id = "hava-fritoz-philips-xxl",
                Title = "Philips HD9270 XXL Airfryer 7.3L Çift Taraflı Hava Fritözü",
                Brand = "Philips",
                SellerName = "HomeStyle Ev Elektroniği",
                CategoryId = mut,
                Price = 2190,
                OriginalPrice = 2590,
                Rating = 4.3,
                ReviewCount = 267,
                Stock = 33,
                ShortDescription = "7.3L kapasite, RapidAir teknolojisi, gıda dereceli sepet.",
                Description = "Philips'in en büyük kapasiteli airfryer modeli. 7.3L ile aile boyutunda pişirme yapılabilir. RapidAir teknolojisi ısıyı eşit dağıtarak yağsız kızartma sonuçları verir. Dishwasher uyumlu sepet temizliği kolaylaştırır.\n\nNot: Büyük kapasite sayesinde büyük parça etler rahatlıkla pişirilebilir ama tezgah üzerinde yer kaplar (31x31x36cm). Ses seviyesi orta yükseklikte.",
                FeaturesJson = """{"Kapasite":"7.3L","Güç":"2000W","Teknoloji":"RapidAir","Sıcaklık":"80-200°C","Zamanlayıcı":"60 dk","Sepet":"Dishwasher Uyumlu","Ağırlık":"6.2kg"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl Garanti","Dishwasher Uyumlu Sepet"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "espresso-delonghi-dedica",
                Title = "De'Longhi Dedica Arte EC885 Espresso ve Cappuccino Makinesi",
                Brand = "De'Longhi",
                SellerName = "HomeStyle Ev Elektroniği",
                CategoryId = mut,
                Price = 3490,
                OriginalPrice = 3990,
                Rating = 4.4,
                ReviewCount = 198,
                Stock = 21,
                ShortDescription = "15 bar basınç, buharlı süt köpürtücü, çift espresso.",
                Description = "İnce profilli (15cm genişlik) tasarımıyla küçük mutfaklara sığan yarı otomatik espresso makinesi. 15 bar pompa basıncı gerçek barista kalitesinde espresso çeker. Manuel buharlı süt köpürtücüyle cappuccino ve latte hazırlanabilir.\n\nÖnemli: Öğütülmüş veya ESE pad kullanılır; çekirdek öğütme özelliği yoktur. İyi kahve için ayrı bir kahve değirmeni önerilir.",
                FeaturesJson = """{"Basınç":"15 bar","Süt Sistemi":"Manuel Buharlı Köpürtücü","Kazan":"Termoblock","Sıcaklık":"3 seviye","Genişlik":"15cm","Uyumluluk":"Öğütülmüş + ESE Pod","Güç":"1300W","Su Haznesi":"1.1L"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl De'Longhi Garantisi","İnce Tasarım 15cm"]""",
                CargoText = "3-5 iş günü",
            },
            new()
            {
                Id = "sac-kurutma-dyson-supersonic",
                Title = "Dyson Supersonic HD08 Saç Kurutma Makinesi Profesyonel",
                Brand = "Dyson",
                SellerName = "HomeStyle Ev Elektroniği",
                CategoryId = ev,
                Price = 6490,
                Rating = 4.6,
                ReviewCount = 324,
                Stock = 12,
                ShortDescription = "110.000 RPM dijital motor, IQ akıllı ısı kontrolü, 5 başlık.",
                Description = "Dyson'ın benzersiz dijital motoru dakikada 110.000 devire ulaşarak güçlü hava akışı üretir. IQ akıllı ısı kontrolü her 0.1 saniyede sıcaklığı ölçerek saçın aşırı ısıya maruz kalmasını önler. 5 farklı başlık farklı saç tiplerine uyum sağlar.\n\nDikkat: Bu fiyat premium bir deneyim için ödenebilir, ancak temel kurutma ihtiyacı için çok daha uygun fiyatlı alternatifler mevcuttur.",
                FeaturesJson = """{"Motor":"Dyson Dijital 110.000 RPM","Güç":"1600W","Isı Kontrolü":"IQ Akıllı (0.1sn döngü)","Hız":"3 ayar","Sıcaklık":"4 ayar","Başlık":"5 adet (diffüzör, konsantratör, vs.)","Kablo":"2.7m","Ağırlık":"689g (başlık hariç)"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl Dyson Garanti","5 Başlık Dahil","Akıllı Isı Koruma"]""",
                CargoText = "2-3 iş günü",
            },

            // ── SporTech Aktif ───────────────────────────────────────────────
            new()
            {
                Id = "saat-garmin-forerunner255",
                Title = "Garmin Forerunner 255 Music GPS Koşu ve Triatlon Saati",
                Brand = "Garmin",
                SellerName = "SporTech Aktif",
                CategoryId = spor,
                Price = 4290,
                OriginalPrice = 4790,
                Rating = 4.6,
                ReviewCount = 178,
                Stock = 16,
                ShortDescription = "Multi-band GPS, müzik depolama, Garmin Pay, 14 gün pil.",
                Description = "Ciddi koşucular ve triatletler için tasarlanan GPS saati. Multi-band GPS sinyal desteği şehir içi ve ağaçlık alanlarda hassas konum takibi sağlar. Garmin Coach ücretsiz koşu antrenman planları ve Body Battery enerji takibi ile günlük kondisyon yönetimi yapılır.\n\nNot: Dalgıç saati değildir (5ATM). Yüzme için uygundur ancak derin dalış için tasarlanmamıştır.",
                FeaturesJson = """{"GPS":"Multi-band GPS (L1+L5)","Pil":"14 gün akıllı saat, 30 saat GPS","Müzik":"500 şarkı depolama","Spor":"30+ aktivite profili","Sensörler":"Nabız, SpO2, Stres, Body Battery","Bağlantı":"Garmin Pay, Wi-Fi, Bluetooth","Su Direnci":"5ATM"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl Garmin Garanti","Multi-Band GPS","Müzik Depolama"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "bisiklet-bilgisayar-garmin-edge530",
                Title = "Garmin Edge 530 GPS Bisiklet Bilgisayarı Harita Destekli",
                Brand = "Garmin",
                SellerName = "SporTech Aktif",
                CategoryId = spor,
                Price = 3990,
                OriginalPrice = 4490,
                Rating = 4.4,
                ReviewCount = 89,
                Stock = 11,
                ShortDescription = "Tam harita görüntüleme, 20 saat pil, Cycling Dynamics.",
                Description = "Bisikletçilerin rotasını tam haritayla görebildiği gelişmiş GPS bilgisayar. Cycling Dynamics pedallamanın etkinliğini analiz eder. ClimbPro özelliği tırmanış öncesi kalan yükseklik bilgisi verir. 20 saatlik pil ömrü uzun etaplara yetecek kapasitededir.",
                FeaturesJson = """{"Ekran":"2.6\" renkli MIP","GPS":"GPS + GLONASS + Galileo","Pil":"20 saat","Harita":"Ön yüklenmiş Türkiye + Avrupa","Veri":"ClimbPro, Cycling Dynamics","Bağlantı":"ANT+, Bluetooth","Su Direnci":"IPX7"}""",
                BadgesJson = """["Ücretsiz Kargo","2 Yıl Garmin Garanti","Türkiye Haritası Dahil"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "dambil-seti-ayarlanabilir",
                Title = "Ayarlanabilir Dambıl Seti 2x2kg-24kg Hızlı Kilit Sistemi",
                Brand = "PowerFit",
                SellerName = "SporTech Aktif",
                CategoryId = spor,
                Price = 3490,
                OriginalPrice = 3990,
                Rating = 4.1,
                ReviewCount = 134,
                Stock = 28,
                ShortDescription = "2kg'dan 24kg'a 15 kademe ayar, hızlı kilit, kompakt depolama.",
                Description = "Evde spor için tek dambilin 15 farklı ağırlıkta kullanılmasını sağlayan pratik sistem. Dönürdü kilit mekanizması 5 saniyede ağırlık değiştirme imkânı tanır. İki dambıl bir dambıl rafında depolanarak 30 adet ağırlık plakasının yerini tutar.\n\nDikkat: Plastik gövde metal dambıllar kadar dayanıklı olmayabilir; zemine sert bırakma mekanizmaya zarar verebilir.",
                FeaturesJson = """{"Ağırlık Aralığı":"2kg – 24kg (her bir dambıl)","Kademe":"15 ayar","Kilit":"Hızlı dönme kilidi","Depolama":"Kompakt raf sistemi dahil","Malzeme":"ABS gövde + çelik plaka","Boyut":"37cm x 21cm (en büyük ayarda)"}""",
                BadgesJson = """["Ücretsiz Kargo","Raf Dahil","2 Yıl Garanti"]""",
                CargoText = "3-5 iş günü",
            },
            new()
            {
                Id = "yoga-mati-manduka-pro",
                Title = "Manduka PRO Yoga Matı 6mm Kaymaz Profesyonel",
                Brand = "Manduka",
                SellerName = "SporTech Aktif",
                CategoryId = spor,
                Price = 1290,
                Rating = 4.7,
                ReviewCount = 93,
                Stock = 37,
                ShortDescription = "6mm kalınlık, PVC kaymaz taban, 180cm x 61cm.",
                Description = "Manduka'nın profesyonel yoga camiasında uzun süredir güvenilen standart matı. 6mm kalın cushion yoğun egzersizlerde eklem koruması sağlar. Kapalı hücreli PVC yüzey ter emmeyen, kolay silinebilir yapıya sahiptir.\n\nNot: İlk kullanımda hafif koku olabilir, birkaç kullanım sonra kaybolur. Ağır (2.2kg) olduğu için taşıma sapanı ayrı satılmaktadır.",
                FeaturesJson = """{"Kalınlık":"6mm","Boyut":"180cm x 61cm","Malzeme":"Kapalı Hücreli PVC","Taban":"Kaymaz doku","Ağırlık":"2.2kg","Renk":"Siyah / Mor / Lacivert","Garanti":"Ömür boyu garantili"}""",
                BadgesJson = """["Ücretsiz Kargo","Ömür Boyu Garanti"]""",
                CargoText = "1-2 iş günü",
            },

            // ─────────────── ModaTrend Giyim (üst/alt/dış giyim) ───────────────
            new()
            {
                Id = "tisort-basic-beyaz",
                Title = "Basic Beyaz Bisiklet Yaka Pamuklu Tişört",
                Brand = "ModaTrend",
                SellerName = "ModaTrend Giyim",
                CategoryId = giyim,
                Price = 249,
                OriginalPrice = 349,
                Rating = 4.4,
                ReviewCount = 218,
                Stock = 140,
                ShortDescription = "%100 pamuk, regular fit, kombin tamamlayıcı temel parça.",
                Description = "Her gardırobun temel taşı olan beyaz bisiklet yaka tişört. Tek başına günlük, blazer veya mont altında katmanlı kombinlerde kullanılabilir. Kot, chino veya jogger ile uyumludur.\n\nNot: İlk yıkamada hafif çekme olabilir, 30 derecede yıkanması önerilir.",
                FeaturesJson = """{"Malzeme":"%100 Pamuk","Kalıp":"Regular Fit","Yaka":"Bisiklet Yaka","Renk":"Beyaz","Beden":"XS-XXL","Yıkama":"30°C"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "gomlek-oxford-mavi",
                Title = "Oxford Açık Mavi Slim Fit Gömlek",
                Brand = "ModaTrend",
                SellerName = "ModaTrend Giyim",
                CategoryId = giyim,
                Price = 549,
                OriginalPrice = 749,
                Rating = 4.5,
                ReviewCount = 132,
                Stock = 76,
                ShortDescription = "Oxford dokuma, smart-casual kombin için ideal gömlek.",
                Description = "Hem ofis hem hafta sonu kombinine uyan açık mavi Oxford gömlek. Chino veya koyu kot ile smart-casual, blazer altında daha resmi kombinlerde kullanılır. Kolları kıvırarak günlük şıklık yaratılabilir.\n\nNot: Slim fit kalıptır; rahat kullanım için bir beden büyük tercih edilebilir.",
                FeaturesJson = """{"Malzeme":"%100 Pamuk Oxford","Kalıp":"Slim Fit","Yaka":"Düğmeli Yaka","Renk":"Açık Mavi","Beden":"S-XXL","Ütü":"Kolay ütülenir"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "kot-pantolon-slim-lacivert",
                Title = "Slim Fit Koyu Lacivert Kot Pantolon",
                Brand = "ModaTrend",
                SellerName = "ModaTrend Giyim",
                CategoryId = giyim,
                Price = 699,
                OriginalPrice = 899,
                Rating = 4.3,
                ReviewCount = 167,
                Stock = 92,
                ShortDescription = "Likralı slim fit, tişört ve gömlek kombinine uyumlu.",
                Description = "Koyu lacivert ton sayesinde hem günlük hem smart-casual kombinlerde kullanılabilen çok yönlü kot pantolon. Beyaz tişört + sneaker ile günlük, Oxford gömlek + bot ile şık kombin oluşturur.\n\nNot: %2 likra içerir, ilk kullanımda hafif esner.",
                FeaturesJson = """{"Malzeme":"%98 Pamuk %2 Likra","Kalıp":"Slim Fit","Renk":"Koyu Lacivert","Bel":"Orta Bel","Beden":"29-38","Yıkama":"Tersten 30°C"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "chino-pantolon-bej",
                Title = "Bej Chino Pantolon Regular Fit",
                Brand = "ModaTrend",
                SellerName = "ModaTrend Giyim",
                CategoryId = giyim,
                Price = 599,
                Rating = 4.2,
                ReviewCount = 88,
                Stock = 64,
                ShortDescription = "Nötr bej ton, gömlek ve triko kombinine uygun.",
                Description = "Nötr bej tonu ile geniş kombin yelpazesi sunan chino pantolon. Oxford gömlek + blazer ile ofis, triko + sneaker ile hafta sonu kombinine uygundur.\n\nNot: Regular fit kalıptır, dar kalıp sevenler bir beden küçük tercih edebilir.",
                FeaturesJson = """{"Malzeme":"%97 Pamuk %3 Elastan","Kalıp":"Regular Fit","Renk":"Bej","Bel":"Orta Bel","Beden":"29-38","Cep":"4 Cep"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "triko-kazak-antrasit",
                Title = "Antrasit Yarım Balıkçı İnce Triko Kazak",
                Brand = "ModaTrend",
                SellerName = "ModaTrend Giyim",
                CategoryId = giyim,
                Price = 649,
                OriginalPrice = 849,
                Rating = 4.6,
                ReviewCount = 74,
                Stock = 53,
                ShortDescription = "İnce örgü, gömlek üstüne veya tek katman kombin.",
                Description = "Sonbahar-kış kombinlerinin tamamlayıcısı antrasit ince triko. Gömlek üzerine katmanlı, tek başına chino veya kot ile günlük kombinlerde kullanılır. Blazer veya trençkot altına da uygundur.\n\nNot: İnce örgüdür, çok soğuk havada mont gerektirir.",
                FeaturesJson = """{"Malzeme":"%50 Pamuk %50 Akrilik","Kalıp":"Regular Fit","Yaka":"Yarım Balıkçı","Renk":"Antrasit","Beden":"S-XXL","Mevsim":"İlkbahar/Sonbahar"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "blazer-ceket-lacivert",
                Title = "Lacivert Yün Karışımlı Slim Blazer Ceket",
                Brand = "ModaTrend",
                SellerName = "ModaTrend Giyim",
                CategoryId = giyim,
                Price = 1890,
                OriginalPrice = 2490,
                Rating = 4.5,
                ReviewCount = 41,
                Stock = 28,
                ShortDescription = "Smart-casual ve resmi kombinlerin tamamlayıcısı.",
                Description = "Gömlek + chino ile ofis, tişört + kot ile smart-casual kombin oluşturan çok yönlü lacivert blazer. Kombinin en üst katmanı olarak kullanılır.\n\nNot: Slim kalıptır, içine kalın triko giyilecekse bir beden büyük önerilir.",
                FeaturesJson = """{"Malzeme":"%70 Polyester %30 Yün","Kalıp":"Slim Fit","Renk":"Lacivert","Düğme":"2 Düğme","Beden":"46-56","Astar":"Tam Astarlı"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "kemer-deri-kahve",
                Title = "Hakiki Deri Kahverengi Klasik Kemer",
                Brand = "ModaTrend",
                SellerName = "ModaTrend Giyim",
                CategoryId = giyim,
                Price = 399,
                Rating = 4.7,
                ReviewCount = 96,
                Stock = 110,
                ShortDescription = "Kombin tamamlayıcı aksesuar, kahve ayakkabıyla uyumlu.",
                Description = "Chino veya kot ile kullanılan, kahverengi bot/ayakkabı ile renk uyumu sağlayan hakiki deri kemer. Kombini tamamlayan detay aksesuar.\n\nNot: Boy ayarı için son delikten kesim yapılabilir, beden seçimine dikkat edilmeli.",
                FeaturesJson = """{"Malzeme":"Hakiki Deri","Renk":"Kahverengi","Genişlik":"3.5cm","Toka":"Mat Metal","Beden":"95-125cm"}""",
                BadgesJson = """["Ücretsiz Kargo","Hakiki Deri"]""",
                CargoText = "1-2 iş günü",
            },

            // ─────────────── UrbanStyle Butik (ayakkabı/dış giyim/spor giyim) ───────────────
            new()
            {
                Id = "sneaker-beyaz-deri",
                Title = "Beyaz Deri Minimal Sneaker",
                Brand = "UrbanStyle",
                SellerName = "UrbanStyle Butik",
                CategoryId = giyim,
                Price = 1290,
                OriginalPrice = 1690,
                Rating = 4.5,
                ReviewCount = 154,
                Stock = 67,
                ShortDescription = "Sade beyaz tasarım, her kombinle uyumlu ayakkabı.",
                Description = "Kot, chino veya jogger ile uyumlu sade beyaz deri sneaker. Tişört + kot günlük kombinden gömlek + blazer smart-casual kombine kadar geniş kullanım sunar. Kombinin taban parçası.\n\nNot: Beyaz deri olduğundan düzenli bakım gerektirir, su itici sprey önerilir.",
                FeaturesJson = """{"Malzeme":"Hakiki Deri","Renk":"Beyaz","Taban":"Kauçuk","Kapama":"Bağcıklı","Numara":"39-45","Stil":"Minimal Günlük"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "bot-chelsea-kahve",
                Title = "Süet Kahverengi Chelsea Bot",
                Brand = "UrbanStyle",
                SellerName = "UrbanStyle Butik",
                CategoryId = giyim,
                Price = 1690,
                OriginalPrice = 2190,
                Rating = 4.4,
                ReviewCount = 79,
                Stock = 44,
                ShortDescription = "Smart-casual kombinlerin tamamlayıcısı süet bot.",
                Description = "Koyu kot + triko + trençkot ile sonbahar-kış smart-casual kombinin tamamlayıcısı süet Chelsea bot. Kahverengi deri kemerle renk uyumu sağlar.\n\nNot: Süet malzeme yağmurda koruma spreyi gerektirir.",
                FeaturesJson = """{"Malzeme":"Süet Deri","Renk":"Kahverengi","Taban":"Kauçuk","Kapama":"Yandan Lastikli","Numara":"39-45","Mevsim":"Sonbahar/Kış"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "mont-puffer-siyah",
                Title = "Siyah Şişme Puffer Mont Su İtici",
                Brand = "UrbanStyle",
                SellerName = "UrbanStyle Butik",
                CategoryId = giyim,
                Price = 1990,
                OriginalPrice = 2690,
                Rating = 4.6,
                ReviewCount = 112,
                Stock = 51,
                ShortDescription = "Kış kombinlerinin en üst katmanı, su itici.",
                Description = "Soğuk kış günlerinde triko + kot kombinin üzerine giyilen su itici siyah puffer mont. Spor ve günlük kombinlerle uyumlu, kombinin dış katmanı.\n\nNot: Hacimli dolgu nedeniyle ince kombin sevenler için tercih edilmeyebilir.",
                FeaturesJson = """{"Malzeme":"Polyester Dolgu","Renk":"Siyah","Su Direnci":"Su İtici","Kapüşon":"Çıkarılabilir","Beden":"S-XXL","Mevsim":"Kış"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "trenchcoat-bej",
                Title = "Bej Klasik Trençkot Su İtici",
                Brand = "UrbanStyle",
                SellerName = "UrbanStyle Butik",
                CategoryId = giyim,
                Price = 2490,
                OriginalPrice = 2990,
                Rating = 4.5,
                ReviewCount = 38,
                Stock = 22,
                ShortDescription = "İlkbahar/sonbahar smart-casual kombin tamamlayıcısı.",
                Description = "Gömlek + chino veya triko + kot kombinin üzerine giyilen klasik bej trençkot. Smart-casual kombinin zarif dış katmanı; süet bot ile uyumludur.\n\nNot: Mevsimlik bir parçadır, kışın tek başına yeterli sıcaklık sağlamaz.",
                FeaturesJson = """{"Malzeme":"%65 Pamuk %35 Polyester","Renk":"Bej","Su Direnci":"Su İtici","Kemer":"Bağlamalı","Beden":"S-XXL","Mevsim":"İlkbahar/Sonbahar"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "2-3 iş günü",
            },
            new()
            {
                Id = "sweatshirt-kapusonlu-gri",
                Title = "Gri Kapüşonlu Sweatshirt Oversize",
                Brand = "UrbanStyle",
                SellerName = "UrbanStyle Butik",
                CategoryId = giyim,
                Price = 549,
                OriginalPrice = 699,
                Rating = 4.3,
                ReviewCount = 143,
                Stock = 98,
                ShortDescription = "Spor-günlük kombin, jogger ve sneaker ile uyumlu.",
                Description = "Jogger + sneaker ile rahat spor-casual kombin oluşturan gri kapüşonlu sweatshirt. Mont altında katmanlı da kullanılır.\n\nNot: Oversize kalıptır, dar kullanım sevenler bir beden küçük seçmeli.",
                FeaturesJson = """{"Malzeme":"%80 Pamuk %20 Polyester","Kalıp":"Oversize","Renk":"Gri Melanj","Kapüşon":"Var","Beden":"S-XXL","Mevsim":"4 Mevsim"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "jogger-esofman-siyah",
                Title = "Siyah Jogger Eşofman Altı Lastikli Paça",
                Brand = "UrbanStyle",
                SellerName = "UrbanStyle Butik",
                CategoryId = giyim,
                Price = 449,
                Rating = 4.4,
                ReviewCount = 121,
                Stock = 105,
                ShortDescription = "Spor-casual kombin, sweatshirt ve sneaker ile uyumlu.",
                Description = "Sweatshirt + sneaker ile günlük spor kombinin alt parçası siyah jogger. Tişört ile de yazlık rahat kombin oluşturur.\n\nNot: Lastikli paça kalıbı dar gelebilir, geniş kalıp sevenler dikkat etmeli.",
                FeaturesJson = """{"Malzeme":"%70 Pamuk %30 Polyester","Kalıp":"Slim Jogger","Renk":"Siyah","Paça":"Lastikli","Beden":"S-XXL","Cep":"Yan + Arka Cep"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "1-2 iş günü",
            },
            new()
            {
                Id = "sapka-bere-yun",
                Title = "Antrasit Yün Bere Kışlık",
                Brand = "UrbanStyle",
                SellerName = "UrbanStyle Butik",
                CategoryId = giyim,
                Price = 199,
                Rating = 4.6,
                ReviewCount = 67,
                Stock = 130,
                ShortDescription = "Kış kombin tamamlayıcı aksesuar, puffer mont ile uyumlu.",
                Description = "Puffer mont + triko kış kombinini tamamlayan antrasit yün bere. Nötr tonu sayesinde çoğu kombinle uyumlu aksesuar.\n\nNot: Yün içerikli olduğundan hassas ciltlerde içine ince astar tercih edilebilir.",
                FeaturesJson = """{"Malzeme":"%60 Akrilik %40 Yün","Renk":"Antrasit","Tip":"Katlamalı Bere","Beden":"Standart","Mevsim":"Kış"}""",
                BadgesJson = """["Ücretsiz Kargo","Kolay İade"]""",
                CargoText = "1-2 iş günü",
            },
        };
        var missingProducts = products.Where(p => !existingProductIds.Contains(p.Id)).ToList();
        if (missingProducts.Count > 0)
        {
            db.Products.AddRange(missingProducts);
            await db.SaveChangesAsync();
        }

        // ── Product Images — add only if missing ──
        var existingImageProductIds = await db.ProductImages.Select(i => i.ProductId).ToHashSetAsync();
        var images = new List<ProductImage>
        {
            new() { ProductId = "bluetooth-kulaklik-pro-x1", Url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "spor-ayakkabi-runflex",     Url = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "mutfak-robotu-compact",     Url = "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "akilli-saat-fit-neo",       Url = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "ergonomik-calisma-sandalyesi", Url = "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "hava-temizleyici-mini",     Url = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "telefon-kilifi-magsafe",    Url = "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "usb-c-hub-pro",             Url = "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "seramik-taki-seti-beyaz",   Url = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "bebek-kamerasi-nightview",  Url = "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "masa-lambasi-led",          Url = "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "kahve-degirmeni-burr",      Url = "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "laptop-asus-vivobook-15",       Url = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "laptop-lenovo-ideapad-slim5",   Url = "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "laptop-macbook-air-m2",         Url = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "monitor-samsung-27-qhd",        Url = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "monitor-lg-27-4k-ips",          Url = "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "telefon-samsung-galaxy-a55",    Url = "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "telefon-xiaomi-14t-pro",        Url = "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "telefon-iphone-15",             Url = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "saat-samsung-galaxy-watch6",    Url = "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "tablet-samsung-tab-s9fe",       Url = "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "kulaklik-anker-soundcore-q45",  Url = "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "kulaklik-jbl-tune770",          Url = "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "kulaklik-sony-wh1000xm5",       Url = "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "hoparlor-jbl-charge5",          Url = "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "robot-supurge-dreame-d10plus",  Url = "https://images.unsplash.com/photo-1603618033141-49b6fc5c8b9f?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "hava-fritoz-philips-xxl",       Url = "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "espresso-delonghi-dedica",      Url = "https://images.unsplash.com/photo-1565452344518-47faca79dc69?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "sac-kurutma-dyson-supersonic",  Url = "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "saat-garmin-forerunner255",     Url = "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "bisiklet-bilgisayar-garmin-edge530", Url = "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "dambil-seti-ayarlanabilir",     Url = "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "yoga-mati-manduka-pro",         Url = "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "tisort-basic-beyaz",            Url = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "gomlek-oxford-mavi",            Url = "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "kot-pantolon-slim-lacivert",    Url = "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "chino-pantolon-bej",            Url = "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "triko-kazak-antrasit",          Url = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "blazer-ceket-lacivert",         Url = "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "kemer-deri-kahve",              Url = "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "sneaker-beyaz-deri",            Url = "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "bot-chelsea-kahve",             Url = "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "mont-puffer-siyah",             Url = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "trenchcoat-bej",                Url = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "sweatshirt-kapusonlu-gri",      Url = "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "jogger-esofman-siyah",          Url = "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80", IsPrimary = true, SortOrder = 0 },
            new() { ProductId = "sapka-bere-yun",                Url = "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80", IsPrimary = true, SortOrder = 0 },
        };
        var missingImages = images.Where(i => !existingImageProductIds.Contains(i.ProductId)).ToList();
        if (missingImages.Count > 0)
        {
            db.ProductImages.AddRange(missingImages);
            await db.SaveChangesAsync();
        }

        // ── Price History — add only if missing ──
        var existingPriceHistoryProductIds = await db.ProductPriceHistories.Select(h => h.ProductId).ToHashSetAsync();
        var days = new[] { "G-30", "G-20", "G-10", "G-5", "Bugün" };
        var priceHistories = new List<ProductPriceHistory>();
        foreach (var product in products)
        {
            for (int i = 0; i < days.Length; i++)
            {
                priceHistories.Add(new()
                {
                    ProductId = product.Id,
                    Day = days[i],
                    Price = product.Price * (decimal)(0.9 + i * 0.025),
                    MarketMedian = product.Price * (decimal)0.95,
                });
            }
        }
        var missingPriceHistories = priceHistories.Where(h => !existingPriceHistoryProductIds.Contains(h.ProductId)).ToList();
        if (missingPriceHistories.Count > 0)
        {
            db.ProductPriceHistories.AddRange(missingPriceHistories);
            await db.SaveChangesAsync();
        }

        // ── Reviews — add only if missing ──
        var existingReviewProductIds = await db.ProductReviews.Select(r => r.ProductId).ToHashSetAsync();
        var reviews = new List<ProductReview>
        {
            // Bluetooth Kulaklık
            new() { ProductId = "bluetooth-kulaklik-pro-x1", Rating = 4, Title = "Günlük kullanım için yeterli", Text = "Müzik dinlemek için harika, ama online toplantılarda mikrofon biraz zayıf kalıyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-10), HelpfulCount = 24, TagsJson = """["mikrofon","ses kalitesi"]""" },
            new() { ProductId = "bluetooth-kulaklik-pro-x1", Rating = 2, Title = "Oyun için uygun değil", Text = "Low latency bekliyordum ama gecikme var. Müzik için fena değil.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-20), HelpfulCount = 41, TagsJson = """["gecikme","oyun"]""" },
            new() { ProductId = "bluetooth-kulaklik-pro-x1", Rating = 5, Title = "Pil ömrü mükemmel", Text = "20 saat gerçekten doğru, şarj etmeyi unutuyorum. Tavsiye ederim.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-5), HelpfulCount = 18, TagsJson = """["pil","konfor"]""" },
            new() { ProductId = "bluetooth-kulaklik-pro-x1", Rating = 3, Title = "Fiyatına göre makul", Text = "Bu fiyat aralığında beklentileri karşılıyor. Premium ses kalitesi isteyenler daha üst segmenti düşünmeli.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-30), HelpfulCount = 7, TagsJson = """["fiyat","kalite"]""" },
            // Spor Ayakkabı
            new() { ProductId = "spor-ayakkabi-runflex",     Rating = 3, Title = "Beden kalıbı farklı", Text = "Yarım numara büyük aldım, doğru karar.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-15), HelpfulCount = 32, TagsJson = """["beden","kalıp"]""" },
            new() { ProductId = "spor-ayakkabi-runflex",     Rating = 5, Title = "Hafif ve rahat", Text = "Sabah koşusunda nefes alan tabanı sayesinde ayak terlemeden 10km koştum.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-7), HelpfulCount = 19, TagsJson = """["hafiflik","nefes alan"]""" },
            new() { ProductId = "spor-ayakkabi-runflex",     Rating = 2, Title = "Uzun süre dayanmadı", Text = "3 ay sonra taban ayrıldı. Fiyatına göre hayal kırıklığı.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-45), HelpfulCount = 28, TagsJson = """["dayanıklılık","taban"]""" },
            // Mutfak Robotu
            new() { ProductId = "mutfak-robotu-compact",     Rating = 4, Title = "Kompakt ve güçlü", Text = "Küçük mutfak için ideal. Ses biraz yüksek ama performans iyi.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-8), HelpfulCount = 11, TagsJson = """["ses","güç"]""" },
            new() { ProductId = "mutfak-robotu-compact",     Rating = 5, Title = "Her sabah kullanıyorum", Text = "Smoothie, hamur, sebze doğrama hepsi çok hızlı. Temizliği de kolay.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-12), HelpfulCount = 22, TagsJson = """["çok amaçlı","temizlik"]""" },
            new() { ProductId = "mutfak-robotu-compact",     Rating = 3, Title = "Kutu içeriği eksik", Text = "Reklam görselindeki ekstra aparatlar kutuda yoktu. Müşteri hizmetleri çözdü ama yine de can sıkıcı.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-25), HelpfulCount = 15, TagsJson = """["kutu içeriği","müşteri hizmetleri"]""" },
            // Akıllı Saat
            new() { ProductId = "akilli-saat-fit-neo",       Rating = 4, Title = "Spor takibi çok iyi", Text = "Adım sayar, kalp atışı, uyku takibi hepsi doğru çalışıyor. Batarya 5 gün gidiyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-18), HelpfulCount = 34, TagsJson = """["spor","batarya"]""" },
            new() { ProductId = "akilli-saat-fit-neo",       Rating = 3, Title = "Uygulama biraz karmaşık", Text = "Saat güzel ama telefon uygulaması Türkçe değil ve menüler karmaşık.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-22), HelpfulCount = 16, TagsJson = """["uygulama","arayüz"]""" },
            // Ergonomik Sandalye
            new() { ProductId = "ergonomik-calisma-sandalyesi", Rating = 5, Title = "Sırt ağrıları geçti", Text = "8 saatlik iş günü sonunda artık sırt ağrısı yaşamıyorum. Bel desteği çok iyi.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-35), HelpfulCount = 52, TagsJson = """["bel desteği","konfor"]""" },
            new() { ProductId = "ergonomik-calisma-sandalyesi", Rating = 2, Title = "Montaj çok zor", Text = "Montaj talimatları yetersiz, 3 saat uğraştım. İçerik iyi ama süreç sinir bozucu.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-40), HelpfulCount = 29, TagsJson = """["montaj","talimат"]""" },
            // USB-C Hub
            new() { ProductId = "usb-c-hub-pro",             Rating = 5, Title = "MacBook için mükemmel", Text = "7 port aynı anda çalışıyor. 4K ekran, ethernet, 3 USB-A, kart okuyucu hepsi sorunsuz.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-14), HelpfulCount = 47, TagsJson = """["uyumluluk","çok port"]""" },
            new() { ProductId = "usb-c-hub-pro",             Rating = 3, Title = "Windows'ta sorun var", Text = "Mac'te harika ama Windows'ta bazı portlar tanınmıyor. Sürücü güncellemesiyle kısmen çözüldü.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-28), HelpfulCount = 21, TagsJson = """["Windows","sürücü"]""" },
            new() { ProductId = "usb-c-hub-pro",             Rating = 4, Title = "İyi fiyat/performans", Text = "Fiyatına göre çok iyi. Isınma sorunu biraz var ama kabul edilebilir.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-9), HelpfulCount = 14, TagsJson = """["fiyat","ısınma"]""" },

            // Akıllı Saat (ek)
            new() { ProductId = "akilli-saat-fit-neo",       Rating = 5, Title = "Fiyatına göre harika", Text = "Bu fiyatta bu özellikleri bulmak zor. Nabız ve uyku takibi çok doğru.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-6), HelpfulCount = 27, TagsJson = """["fiyat","hassasiyet"]""" },
            new() { ProductId = "akilli-saat-fit-neo",       Rating = 4, Title = "Şık tasarım", Text = "Günlük kullanımda çok rahat, kayış kalitesi de iyi.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-33), HelpfulCount = 9, TagsJson = """["tasarım","kayış"]""" },

            // Hava Temizleyici
            new() { ProductId = "hava-temizleyici-mini",     Rating = 5, Title = "Allerji sorunum azaldı", Text = "Kullanmaya başladıktan sonra sabah burun tıkanıklığı geçti. Kesinlikle tavsiye ederim.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-12), HelpfulCount = 38, TagsJson = """["allerji","etkinlik"]""" },
            new() { ProductId = "hava-temizleyici-mini",     Rating = 4, Title = "Sessiz çalışıyor", Text = "Gece boyunca açık bırakıyorum, hiç rahatsız etmiyor. Filtre değişimi kolay.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-20), HelpfulCount = 22, TagsJson = """["ses","filtre"]""" },
            new() { ProductId = "hava-temizleyici-mini",     Rating = 5, Title = "Bebek odasında kullanıyoruz", Text = "Cocuk odasında kullandık, koku ve toz sorunu tamamen çözüldü.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-8), HelpfulCount = 45, TagsJson = """["bebek","güvenlik"]""" },
            new() { ProductId = "hava-temizleyici-mini",     Rating = 4, Title = "Kompakt ama güçlü", Text = "30m² oda için yeterli. Sadece en yüksek modda biraz ses çıkarıyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-35), HelpfulCount = 17, TagsJson = """["alan","ses"]""" },

            // Telefon Kılıfı
            new() { ProductId = "telefon-kilifi-magsafe",    Rating = 5, Title = "Sararmıyor gerçekten", Text = "2 ay oldu, hiç sararma yok. MagSafe mıknatısı çok güçlü tutuyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-60), HelpfulCount = 67, TagsJson = """["sararma","mıknatıs"]""" },
            new() { ProductId = "telefon-kilifi-magsafe",    Rating = 4, Title = "Şeffaf ve ince", Text = "Telefon tasarımını bozmadan koruyor. Düşürme testi yapmadım ama sağlam hissettiriyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-14), HelpfulCount = 31, TagsJson = """["şeffaf","ince"]""" },
            new() { ProductId = "telefon-kilifi-magsafe",    Rating = 4, Title = "Uyumlu modeller dikkat", Text = "iPhone 15 Pro Max için tam oturdu. Ama diğer modeller için kontrol etmenizi öneririm.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-7), HelpfulCount = 19, TagsJson = """["uyumluluk","model"]""" },

            // Seramik Takı Seti
            new() { ProductId = "seramik-taki-seti-beyaz",   Rating = 5, Title = "Hediye olarak aldım, çok beğenildi", Text = "Annem için doğum günü hediyesi aldım. Hediye paketi çok özenli, ürün çok şık.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-18), HelpfulCount = 44, TagsJson = """["hediye","şıklık"]""" },
            new() { ProductId = "seramik-taki-seti-beyaz",   Rating = 5, Title = "El işçiliği belli", Text = "Her parça farklı, bu benzersizlik çok güzel. Kırılganlık uyarısı yerinde, nazik taşıyın.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-30), HelpfulCount = 28, TagsJson = """["el yapımı","benzersiz"]""" },
            new() { ProductId = "seramik-taki-seti-beyaz",   Rating = 4, Title = "Güzel ama hassas", Text = "Çok beğendim ama günlük kullanım için değil, özel günlere sakladım.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-10), HelpfulCount = 12, TagsJson = """["hassas","özel gün"]""" },

            // Bebek Kamerası
            new() { ProductId = "bebek-kamerasi-nightview",  Rating = 5, Title = "Gece görüşü mükemmel", Text = "Gecenin karanlığında odayı net görüntülüyor. Uygulama çok basit ve hızlı bağlanıyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-22), HelpfulCount = 53, TagsJson = """["gece görüşü","uygulama"]""" },
            new() { ProductId = "bebek-kamerasi-nightview",  Rating = 4, Title = "İki yönlü ses harika", Text = "Bebeğim ağladığında sesimle sakinleştiriyorum. WiFi bağlantısı güçlü.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-45), HelpfulCount = 38, TagsJson = """["ses","wifi"]""" },
            new() { ProductId = "bebek-kamerasi-nightview",  Rating = 5, Title = "Gönül rahatlığı", Text = "Bebeği izlemek artık çok kolay. 1080p görüntü çok net, memnunum.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-11), HelpfulCount = 29, TagsJson = """["güvenlik","görüntü kalitesi"]""" },

            // Masa Lambası
            new() { ProductId = "masa-lambasi-led",          Rating = 5, Title = "Her gece kullanıyorum", Text = "Dokunmatik kontrol çok pratik. 3 renk modu gece okuma için ideal.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-16), HelpfulCount = 41, TagsJson = """["dokunmatik","renk modu"]""" },
            new() { ProductId = "masa-lambasi-led",          Rating = 4, Title = "USB şarj çok uygun", Text = "Priz aramaya gerek yok, powerbank'ten şarj ediyorum. Pil ömrü de iyi.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-27), HelpfulCount = 24, TagsJson = """["şarj","pil ömrü"]""" },
            new() { ProductId = "masa-lambasi-led",          Rating = 5, Title = "Hediye için aldım ama kendim kullanıyorum", Text = "Çok beğendim, kendim kullanmaya başladım. Kompakt tasarım çalışma masası için ideal.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-5), HelpfulCount = 18, TagsJson = """["tasarım","kompakt"]""" },

            // Kahve Değirmeni
            new() { ProductId = "kahve-degirmeni-burr",      Rating = 5, Title = "Sabah kahvesi bambaşka oldu", Text = "Taze öğütülmüş kahvenin farkı inanılmaz. Espresso için ince, French Press için kaba ayar mükemmel.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-19), HelpfulCount = 56, TagsJson = """["öğütme","espresso"]""" },
            new() { ProductId = "kahve-degirmeni-burr",      Rating = 4, Title = "18 kademe yeterli", Text = "Her demleme yöntemi için doğru kıvamı bulabildim. Temizlemesi biraz zaman alıyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-38), HelpfulCount = 33, TagsJson = """["kademe","temizlik"]""" },
            new() { ProductId = "kahve-degirmeni-burr",      Rating = 4, Title = "Manuel ama keyifli", Text = "Her sabah öğütmek bir ritüele dönüştü. Kalite ve fiyat dengesi çok iyi.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-9), HelpfulCount = 22, TagsJson = """["manuel","ritüel"]""" },

            // Ergonomik Sandalye (ek)
            new() { ProductId = "ergonomik-calisma-sandalyesi", Rating = 4, Title = "Ev ofisi için biçilmiş kaftan", Text = "Uzaktan çalışıyorum, 8 saat oturuyorum. Sandalye bel ve boyun ağrısını çözdü.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-22), HelpfulCount = 37, TagsJson = """["ev ofisi","uzun kullanım"]""" },

            // ─── ASUS VivoBook 15 ───
            new() { ProductId = "laptop-asus-vivobook-15", AuthorName = "Emre Kılıç", Rating = 4, Title = "Fiyatına göre gayet iş görüyor", Text = "Üniversite ödevleri, Office ve 20+ Chrome sekmesi sorunsuz açılıyor. 16GB RAM bu fiyatta çok iyi. Sadece hoparlör sesi cılız.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-12), HelpfulCount = 41, TagsJson = """["fiyat/performans","ram"]""" },
            new() { ProductId = "laptop-asus-vivobook-15", AuthorName = "Zeynep Aydın", Rating = 3, Title = "Oyun için almayın", Text = "Valorant düşük ayarda zar zor 40 fps. Ders ve ofis için aldıysanız sorun yok ama oyun beklentisiyle alırsanız hayal kırıklığı olur.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-28), HelpfulCount = 53, TagsJson = """["oyun","ekran kartı"]""" },
            new() { ProductId = "laptop-asus-vivobook-15", AuthorName = "Burak Demir", Rating = 4, Title = "Öğrenci için ideal", Text = "Mühendislik öğrencisiyim, AutoCAD basit projelerde idare ediyor. SSD hızlı, açılış 10 saniye. Şarj günde bir kez yetiyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-7), HelpfulCount = 27, TagsJson = """["öğrenci","ssd"]""" },
            new() { ProductId = "laptop-asus-vivobook-15", AuthorName = "Selin Kaya", Rating = 4, Title = "Ekran beklediğimden iyi", Text = "FHD ekran mat, yansıma yapmıyor. Renkler ofis işi için yeterli. Plastik gövde biraz hafif kaçmış ama bu fiyata normal.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-35), HelpfulCount = 14, TagsJson = """["ekran","gövde"]""" },
            new() { ProductId = "laptop-asus-vivobook-15", AuthorName = "Okan Yılmaz", Rating = 2, Title = "Fan sesi rahatsız edici", Text = "Hafif yük altında bile fan devreye giriyor ve sesi belli oluyor. Performans fiyatına göre iyi ama sessiz çalışma bekleyenler dikkat etsin.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-19), HelpfulCount = 31, TagsJson = """["fan sesi","ısınma"]""" },

            // ─── Lenovo IdeaPad Slim 5 ───
            new() { ProductId = "laptop-lenovo-ideapad-slim5", AuthorName = "Deniz Şahin", Rating = 5, Title = "OLED ekran fark yaratıyor", Text = "Renkler inanılmaz canlı, film izlemek ve fotoğraf düzenlemek keyif. 1.4kg gövde sırt çantasında hiç hissedilmiyor. Çok memnunum.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-9), HelpfulCount = 48, TagsJson = """["oled ekran","taşınabilirlik"]""" },
            new() { ProductId = "laptop-lenovo-ideapad-slim5", AuthorName = "Murat Çelik", Rating = 4, Title = "Yazılımcı için yeterli", Text = "VS Code, Docker ve birkaç konteyner aynı anda çalışıyor. 16GB DDR5 hızlı. Sadece OLED'de batarya biraz daha hızlı bitiyor, 7-8 saat alıyorum.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-21), HelpfulCount = 36, TagsJson = """["yazılım","batarya"]""" },
            new() { ProductId = "laptop-lenovo-ideapad-slim5", AuthorName = "Ayşe Doğan", Rating = 4, Title = "Klavyesi çok rahat", Text = "Gün boyu yazı yazıyorum, tuş hissi mükemmel. Ekran parlaklığı dış mekanda biraz yetersiz kalıyor ama kapalı ortamda sorun yok.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-15), HelpfulCount = 22, TagsJson = """["klavye","parlaklık"]""" },
            new() { ProductId = "laptop-lenovo-ideapad-slim5", AuthorName = "Caner Arslan", Rating = 5, Title = "Fiyat/performans kralı", Text = "Bu özelliklerle bu fiyat gerçekten iyi. MacBook'a alternatif arıyordum, OLED + 16GB ile fazlasıyla tatmin oldum.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-5), HelpfulCount = 29, TagsJson = """["fiyat/performans","değer"]""" },
            new() { ProductId = "laptop-lenovo-ideapad-slim5", AuthorName = "Gizem Yıldız", Rating = 3, Title = "OLED'de yanma riski endişesi", Text = "Performanstan memnunum ama sabit arayüz elemanları için OLED yanma riski beni biraz tedirgin ediyor. Ekran koruyucu ayarları kullanıyorum.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-31), HelpfulCount = 18, TagsJson = """["oled","dayanıklılık"]""" },

            // ─── MacBook Air M2 ───
            new() { ProductId = "laptop-macbook-air-m2", AuthorName = "Kerem Öztürk", Rating = 5, Title = "Pil ömrü efsane", Text = "Sabah %100 ile çıkıyorum, akşam hala %40 var. Fansız olduğu için tamamen sessiz. Yazılım geliştirme için kusursuz.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-14), HelpfulCount = 67, TagsJson = """["pil ömrü","sessiz"]""" },
            new() { ProductId = "laptop-macbook-air-m2", AuthorName = "İrem Aksoy", Rating = 5, Title = "Hafif ve premium", Text = "1.24kg, çantada olduğunu unutuyorum. Yapı kalitesi bambaşka, ekran çok keskin. 256GB'ı harici disk ile destekliyorum.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-22), HelpfulCount = 44, TagsJson = """["taşınabilirlik","yapı kalitesi"]""" },
            new() { ProductId = "laptop-macbook-air-m2", AuthorName = "Tolga Şen", Rating = 4, Title = "8GB RAM dikkat", Text = "Genel kullanımda akıcı ama aynı anda çok ağır iş yükünde (büyük Xcode + tarayıcı) bellek baskısı oluyor. Hafif kullanıcı için 8GB yeterli.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-30), HelpfulCount = 52, TagsJson = """["ram","çoklu görev"]""" },
            new() { ProductId = "laptop-macbook-air-m2", AuthorName = "Pelin Korkmaz", Rating = 5, Title = "Geçişim çok kolay oldu", Text = "Windows'tan geçtim, korktuğum kadar zor olmadı. Performans bu fiyata fazlasıyla değer. Ekran rengi fotoğraf işine uygun.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-8), HelpfulCount = 33, TagsJson = """["kullanım","ekran"]""" },
            new() { ProductId = "laptop-macbook-air-m2", AuthorName = "Hakan Erdoğan", Rating = 4, Title = "Port azlığı tek eksik", Text = "Sadece 2 Thunderbolt portu var, hub almak zorunda kaldım. Bunun dışında performans ve pil mükemmel, pişman değilim.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-17), HelpfulCount = 38, TagsJson = """["port","bağlantı"]""" },

            // ─── Samsung 27" QHD Gaming Monitör ───
            new() { ProductId = "monitor-samsung-27-qhd", AuthorName = "Berkay Aslan", Rating = 5, Title = "165Hz oyun deneyimi uçtu", Text = "CS2'de fark çok belirgin, hareketler akıcı. QHD çözünürlük 27 inçte tam kıvamında. Kavis masaüstünde sarmalıyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-11), HelpfulCount = 39, TagsJson = """["yenileme hızı","oyun"]""" },
            new() { ProductId = "monitor-samsung-27-qhd", AuthorName = "Cansu Polat", Rating = 4, Title = "Oyun için harika, tasarım için orta", Text = "VA panel siyahları güzel veriyor ama grafik tasarımda renk doğruluğu IPS kadar değil. Oyun ana amacımsa pişman değilim.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-24), HelpfulCount = 28, TagsJson = """["renk doğruluğu","panel"]""" },
            new() { ProductId = "monitor-samsung-27-qhd", AuthorName = "Onur Taş", Rating = 4, Title = "Kurulumu kolay", Text = "Ayak montajı 2 dakika. HDMI ve DisplayPort ikisi de var. Stand yükseklik ayarı olsa 5 yıldız verirdim, sadece eğim ayarlanıyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-16), HelpfulCount = 19, TagsJson = """["kurulum","stand"]""" },
            new() { ProductId = "monitor-samsung-27-qhd", AuthorName = "Elif Güneş", Rating = 5, Title = "Fiyatına bu özellik az bulunur", Text = "165Hz + QHD + kavis bu fiyata gerçekten iyi. FreeSync ekran yırtılmasını tamamen bitirdi. Tavsiye ederim.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-33), HelpfulCount = 24, TagsJson = """["fiyat/performans","freesync"]""" },

            // ─── LG 27" 4K IPS Monitör ───
            new() { ProductId = "monitor-lg-27-4k-ips", AuthorName = "Sercan Bulut", Rating = 5, Title = "Renkler tasarım işi için kusursuz", Text = "Fotoğraf düzenliyorum, fabrika kalibrasyonu gerçekten iyi. %95 DCI-P3 baskı öncesi kontrol için yeterli. 4K netlik müthiş.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-13), HelpfulCount = 46, TagsJson = """["renk doğruluğu","4k"]""" },
            new() { ProductId = "monitor-lg-27-4k-ips", AuthorName = "Yasemin Acar", Rating = 4, Title = "USB-C tek kablo çok pratik", Text = "MacBook'u tek USB-C ile bağlıyorum, hem şarj hem görüntü. Masada kablo kalabalığı bitti. 60Hz oyuncu değilseniz sorun değil.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-26), HelpfulCount = 35, TagsJson = """["usb-c","bağlantı"]""" },
            new() { ProductId = "monitor-lg-27-4k-ips", AuthorName = "Mert Çakır", Rating = 3, Title = "Oyun için almayın", Text = "Görüntü kalitesi harika ama 60Hz olduğu için hızlı oyunlarda tatmin etmiyor. Tasarım/ofis için aldıysanız mükemmel.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-20), HelpfulCount = 30, TagsJson = """["yenileme hızı","oyun"]""" },
            new() { ProductId = "monitor-lg-27-4k-ips", AuthorName = "Dilara Yalçın", Rating = 5, Title = "Metin keskinliği inanılmaz", Text = "Gün boyu kod yazıyorum, 4K'da metin çok net, göz yorgunluğum azaldı. HDR400 video izlemede güzel ama olağanüstü değil.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-6), HelpfulCount = 27, TagsJson = """["metin keskinliği","göz konforu"]""" },

            // ─── Samsung Galaxy A55 ───
            new() { ProductId = "telefon-samsung-galaxy-a55", AuthorName = "Furkan Doğru", Rating = 4, Title = "Pil günü rahat çıkarıyor", Text = "5000mAh ile yoğun günde bile akşama %25 kalıyor. Ekran AMOLED, dışarıda net görünüyor. Orta segment için dengeli telefon.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-10), HelpfulCount = 42, TagsJson = """["pil ömrü","ekran"]""" },
            new() { ProductId = "telefon-samsung-galaxy-a55", AuthorName = "Sıla Erten", Rating = 4, Title = "Gündüz kamerası iyi, gece orta", Text = "Gündüz fotoğraflar net ve renkli. Gece modu var ama düşük ışıkta gren artıyor. Sosyal medya için fazlasıyla yeterli.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-23), HelpfulCount = 33, TagsJson = """["kamera","gece çekimi"]""" },
            new() { ProductId = "telefon-samsung-galaxy-a55", AuthorName = "Emir Kaplan", Rating = 3, Title = "Performans orta düzey", Text = "Günlük kullanımda akıcı ama ağır oyunlarda (yüksek ayar) takılma oluyor. 4 yıl güncelleme sözü güzel artı.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-30), HelpfulCount = 26, TagsJson = """["performans","oyun"]""" },
            new() { ProductId = "telefon-samsung-galaxy-a55", AuthorName = "Nazlı Şimşek", Rating = 5, Title = "Fiyatına en mantıklısı", Text = "Bu bütçede Samsung kalitesi, AMOLED ekran ve uzun güncelleme bulmak zor. Çok memnunum, ailedeki herkese aldım.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-37), HelpfulCount = 21, TagsJson = """["fiyat/performans","değer"]""" },

            // ─── Xiaomi 14T Pro ───
            new() { ProductId = "telefon-xiaomi-14t-pro", AuthorName = "Barış Aydın", Rating = 5, Title = "Leica kamera gerçekten fark ediyor", Text = "Fotoğrafların renk tonu ve detayı bu fiyatta beklenmeyecek kadar iyi. Portre modu profesyonel duruyor. Çok etkilendim.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-12), HelpfulCount = 51, TagsJson = """["kamera","leica"]""" },
            new() { ProductId = "telefon-xiaomi-14t-pro", AuthorName = "Ceren Bozkurt", Rating = 5, Title = "120W şarj hayat değiştirdi", Text = "20 dakikada full doluyor. Sabah dişimi fırçalarken şarj bitiyor. Performans amiral seviyesinde, oyunlar maksimum ayar akıcı.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-19), HelpfulCount = 47, TagsJson = """["hızlı şarj","performans"]""" },
            new() { ProductId = "telefon-xiaomi-14t-pro", AuthorName = "Volkan Eren", Rating = 4, Title = "Güçlü ama arayüz reklamlı", Text = "Donanım kusursuz ama MIUI/HyperOS'ta yer yer öneri/reklam çıkıyor, kapatmak uğraştırıyor. Donanım için 5, yazılım için 3.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-28), HelpfulCount = 39, TagsJson = """["arayüz","yazılım"]""" },
            new() { ProductId = "telefon-xiaomi-14t-pro", AuthorName = "Aslı Turan", Rating = 4, Title = "Değer-amiral tanımına uygun", Text = "iPhone'un yarı fiyatına çok yakın deneyim. Ekran 144Hz çok akıcı. Uzun vadeli güncelleme süresi tek tereddüdüm.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-7), HelpfulCount = 30, TagsJson = """["fiyat/performans","güncelleme"]""" },

            // ─── iPhone 15 ───
            new() { ProductId = "telefon-iphone-15", AuthorName = "Can Yıldırım", Rating = 5, Title = "Uzun ömürlü yatırım", Text = "5-6 yıl iOS güncellemesi alacağını bilmek huzur veriyor. Kamera tutarlı, her koşulda güvenilir çekim. Pil günü rahat çıkarıyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-15), HelpfulCount = 58, TagsJson = """["yazılım desteği","kamera"]""" },
            new() { ProductId = "telefon-iphone-15", AuthorName = "Merve Aydoğan", Rating = 5, Title = "USB-C nihayet geldi", Text = "Artık tek kabloyla her şeyi şarj ediyorum. Dynamic Island günlük kullanımda işlevsel. Ekosistem (AirPods, Mac) kusursuz çalışıyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-25), HelpfulCount = 41, TagsJson = """["usb-c","ekosistem"]""" },
            new() { ProductId = "telefon-iphone-15", AuthorName = "Serkan Uçar", Rating = 4, Title = "Kutuda adaptör yok", Text = "Telefon mükemmel ama kutudan şarj adaptörü çıkmıyor, ayrı almak gerekti. Kablolu şarj hızı Android rakiplere göre yavaş.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-32), HelpfulCount = 36, TagsJson = """["şarj hızı","kutu içeriği"]""" },
            new() { ProductId = "telefon-iphone-15", AuthorName = "Buse Çetin", Rating = 5, Title = "Video çekimde rakipsiz", Text = "Vlog çekiyorum, video stabilizasyonu ve renk her telefondan iyi. 128GB benim için yeterli oluyor. Kesinlikle tavsiye.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-9), HelpfulCount = 44, TagsJson = """["video","stabilizasyon"]""" },
            new() { ProductId = "telefon-iphone-15", AuthorName = "Tuna Bilgin", Rating = 4, Title = "60Hz ekran tek eksik", Text = "Her şeyi mükemmel ama bu fiyata hala 60Hz ekran olması yazık. Kullanırken alışıyorsunuz ama yüksek Hz'den gelenler fark eder.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-21), HelpfulCount = 33, TagsJson = """["ekran","yenileme hızı"]""" },

            // ─── Samsung Galaxy Watch 6 Classic ───
            new() { ProductId = "saat-samsung-galaxy-watch6", AuthorName = "Gökhan Arı", Rating = 4, Title = "Döner çerçeve çok keyifli", Text = "Fiziksel döner çerçeve menülerde gezinmeyi kolaylaştırıyor. Uyku takibi detaylı. Samsung telefonla tam uyumlu.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-11), HelpfulCount = 32, TagsJson = """["döner çerçeve","uyku takibi"]""" },
            new() { ProductId = "saat-samsung-galaxy-watch6", AuthorName = "Yağmur Kara", Rating = 3, Title = "Pil ömrü kısa", Text = "Sağlık özellikleri zengin ama pil günde bir şarj istiyor. AOD açıkken akşamı zor buluyor. Bu beklentinizi yönetin.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-27), HelpfulCount = 38, TagsJson = """["pil ömrü","aod"]""" },
            new() { ProductId = "saat-samsung-galaxy-watch6", AuthorName = "Alper Sönmez", Rating = 4, Title = "iPhone uyumsuz, dikkat", Text = "Samsung S23 ile mükemmel ama eşim iPhone'da kullanamadı. Android kullanıcısıysanız harika, değilseniz almayın.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-18), HelpfulCount = 45, TagsJson = """["uyumluluk","ios"]""" },
            new() { ProductId = "saat-samsung-galaxy-watch6", AuthorName = "Ebru Yavuz", Rating = 5, Title = "Sağlık takibi kapsamlı", Text = "EKG, vücut kompozisyonu, uyku skoru hepsi tek yerde. Egzersiz otomatik algılanıyor. Günlük sağlık takibi için ideal.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-34), HelpfulCount = 22, TagsJson = """["sağlık takibi","egzersiz"]""" },

            // ─── Samsung Galaxy Tab S9 FE ───
            new() { ProductId = "tablet-samsung-tab-s9fe", AuthorName = "Kaan Aktaş", Rating = 4, Title = "S Pen kutuda gelmesi büyük artı", Text = "Not almak ve PDF işaretlemek için harika, gecikme çok az. Ekran 90Hz akıcı. Hoparlör film için biraz cılız kalıyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-13), HelpfulCount = 34, TagsJson = """["s pen","not alma"]""" },
            new() { ProductId = "tablet-samsung-tab-s9fe", AuthorName = "Şeyma Ergin", Rating = 4, Title = "Öğrenci için biçilmiş kaftan", Text = "Ders notları, kitap okuma ve video izleme için yeterli. Batarya uzun gidiyor. Ağır oyun beklemiyorsanız fiyatına değer.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-22), HelpfulCount = 28, TagsJson = """["öğrenci","batarya"]""" },
            new() { ProductId = "tablet-samsung-tab-s9fe", AuthorName = "Doğukan Ulu", Rating = 3, Title = "İşlemci orta seviye", Text = "Genel kullanım akıcı ama yoğun multitask veya oyunda zorlanıyor. Ekran LCD, S9'un AMOLED'i değil. Beklentinizi ayarlayın.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-29), HelpfulCount = 31, TagsJson = """["performans","ekran"]""" },
            new() { ProductId = "tablet-samsung-tab-s9fe", AuthorName = "Pınar Güler", Rating = 5, Title = "Su geçirmez olması çok iyi", Text = "IP68 ile mutfakta tarif bakarken içime su serpilince korkmuyorum. Çocuğum da kullanıyor, dayanıklı. Memnunum.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-8), HelpfulCount = 19, TagsJson = """["su direnci","dayanıklılık"]""" },

            // ─── Anker Soundcore Q45 ───
            new() { ProductId = "kulaklik-anker-soundcore-q45", AuthorName = "Eren Bal", Rating = 4, Title = "Fiyatına göre ANC başarılı", Text = "Ofiste klima ve konuşma sesini büyük ölçüde kesiyor. 50 saat pil iddiası doğru, haftada bir şarj. Premium kadar değil ama parasının hakkını veriyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-12), HelpfulCount = 37, TagsJson = """["anc","pil ömrü"]""" },
            new() { ProductId = "kulaklik-anker-soundcore-q45", AuthorName = "Melis Avcı", Rating = 4, Title = "LDAC ses kalitesi güzel", Text = "LDAC destekli telefonla ses belirgin iyileşiyor. Uygulamadan EQ ayarı yapılıyor. Kafa bandı uzun süre sonra hafif bastırıyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-20), HelpfulCount = 25, TagsJson = """["ses kalitesi","konfor"]""" },
            new() { ProductId = "kulaklik-anker-soundcore-q45", AuthorName = "Uğur Şahin", Rating = 3, Title = "Mikrofon görüşme için orta", Text = "Müzik ve ANC iyi ama telefon görüşmesinde karşı taraf sesimi boğuk duyuyor. Toplantı odaklıysanız üst segment bakın.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-27), HelpfulCount = 33, TagsJson = """["mikrofon","görüşme"]""" },
            new() { ProductId = "kulaklik-anker-soundcore-q45", AuthorName = "Derya Koç", Rating = 5, Title = "Bu paraya rakipsiz", Text = "Çok cihaz bağlantısı, uzun pil, iyi ANC bu fiyatta zor bulunur. Seyahatte mükemmel iş çıkardı. Kesinlikle tavsiye.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-35), HelpfulCount = 28, TagsJson = """["fiyat/performans","seyahat"]""" },

            // ─── JBL Tune 770NC ───
            new() { ProductId = "kulaklik-jbl-tune770", AuthorName = "Mehmet Yıldız", Rating = 4, Title = "Bas sevenler için ideal", Text = "JBL imzası belli, bas dolu ve tatmin edici. 70 saat pil gerçekten uzun. ANC orta-iyi seviyede, günlük kullanımda yeterli.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-14), HelpfulCount = 35, TagsJson = """["bas","pil ömrü"]""" },
            new() { ProductId = "kulaklik-jbl-tune770", AuthorName = "Ayça Demir", Rating = 4, Title = "Hafif ve rahat", Text = "220g, uzun süre takınca yormuyor. Katlanabilir yapı çantada az yer kaplıyor. Ses dengeli ama detay premium modeller kadar değil.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-23), HelpfulCount = 22, TagsJson = """["konfor","taşınabilirlik"]""" },
            new() { ProductId = "kulaklik-jbl-tune770", AuthorName = "Sinan Ak", Rating = 5, Title = "Fiyat/performans çok iyi", Text = "Adaptif ANC bu fiyata beklenmez. Uygulama EQ esnek. Günlük yol ve ofis için fazlasıyla yeterli, çok memnunum.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-9), HelpfulCount = 30, TagsJson = """["fiyat/performans","anc"]""" },
            new() { ProductId = "kulaklik-jbl-tune770", AuthorName = "Gül Şeker", Rating = 3, Title = "Mikrofon gürültüde zayıf", Text = "Müzik için harika ama kalabalık ortamda görüşmede sesim net gitmiyor. Toplantı için değil, müzik için alın.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-30), HelpfulCount = 24, TagsJson = """["mikrofon","görüşme"]""" },

            // ─── Sony WH-1000XM5 ───
            new() { ProductId = "kulaklik-sony-wh1000xm5", AuthorName = "Arda Çelik", Rating = 5, Title = "ANC kralı, abartı değil", Text = "Uçakta motor sesini neredeyse tamamen siliyor. Açık ofiste konsantrasyon bambaşka. Bu parayı hak ediyor, pişman değilim.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-16), HelpfulCount = 72, TagsJson = """["anc","yolculuk"]""" },
            new() { ProductId = "kulaklik-sony-wh1000xm5", AuthorName = "Beyza Arslan", Rating = 5, Title = "Toplantı için mikrofonu mükemmel", Text = "Günde 4-5 saat online toplantı yapıyorum, karşı taraf sesimi stüdyo gibi duyuyor. Uzaktan çalışan için yatırım değer.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-24), HelpfulCount = 55, TagsJson = """["mikrofon","uzaktan çalışma"]""" },
            new() { ProductId = "kulaklik-sony-wh1000xm5", AuthorName = "Cem Doğan", Rating = 5, Title = "Ses kalitesi referans seviye", Text = "LDAC ile detay inanılmaz, enstrümanlar ayrışıyor. Konfor uzun seanslarda bile sorun değil. En iyi kulaklık deneyimim.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-10), HelpfulCount = 48, TagsJson = """["ses kalitesi","konfor"]""" },
            new() { ProductId = "kulaklik-sony-wh1000xm5", AuthorName = "Funda Er", Rating = 4, Title = "Katlanmaması tek dezavantaj", Text = "Ses ve ANC kusursuz ama yeni model katlanmıyor, kutu büyük. Çantada yer kaplıyor. Performanstan ödün yok ama taşıma zorlaştı.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-31), HelpfulCount = 34, TagsJson = """["taşınabilirlik","tasarım"]""" },
            new() { ProductId = "kulaklik-sony-wh1000xm5", AuthorName = "Görkem Su", Rating = 4, Title = "Fiyatı yüksek ama hak ediyor", Text = "Pahalı, evet. Ama günlük 6 saat kullanan biri için her kuruşu değer. Sadece basit müzik için fazla kaçabilir.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-38), HelpfulCount = 29, TagsJson = """["fiyat","değer"]""" },

            // ─── JBL Charge 5 ───
            new() { ProductId = "hoparlor-jbl-charge5", AuthorName = "Tarık Çınar", Rating = 5, Title = "Bahçe partilerinin yıldızı", Text = "Ses gür ve net, açık havada bile doluyor. IP67 sayesinde havuz kenarında çekinmeden kullanıyorum. 20 saat pil tüm günü çıkarıyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-13), HelpfulCount = 41, TagsJson = """["ses gücü","su direnci"]""" },
            new() { ProductId = "hoparlor-jbl-charge5", AuthorName = "Nehir Yalın", Rating = 5, Title = "Powerbank özelliği can kurtardı", Text = "Piknikte telefonum biterken hoparlörden şarj ettim. Hem müzik hem güç bankası. Bas seviyesi boyutuna göre şaşırtıcı.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-21), HelpfulCount = 33, TagsJson = """["powerbank","bas"]""" },
            new() { ProductId = "hoparlor-jbl-charge5", AuthorName = "Bora Kut", Rating = 4, Title = "Tek başına stereo değil", Text = "Ses harika ama tam stereo için ikinci JBL gerekiyor (PartyBoost). Tek başına oda dolduruyor ama ev sineması beklemeyin.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-28), HelpfulCount = 26, TagsJson = """["stereo","kullanım"]""" },
            new() { ProductId = "hoparlor-jbl-charge5", AuthorName = "Lale Gün", Rating = 4, Title = "Dayanıklı ve taşınabilir", Text = "Çantaya atıp her yere götürüyorum, darbelere dayanıklı. 960g hafif değil ama taşınabilir. Sesi paranın karşılığını veriyor.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-34), HelpfulCount = 18, TagsJson = """["dayanıklılık","taşınabilirlik"]""" },

            // ─── Dreame D10 Plus Robot Süpürge ───
            new() { ProductId = "robot-supurge-dreame-d10plus", AuthorName = "Hüseyin Ay", Rating = 5, Title = "Otomatik toz boşaltma çok rahat", Text = "İstasyon kendi tozunu topluyor, 2 aydır torbaya dokunmadım. Lazer haritalama evi düzgün gezi yapıyor. Hayatımı kolaylaştırdı.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-14), HelpfulCount = 49, TagsJson = """["otomatik istasyon","haritalama"]""" },
            new() { ProductId = "robot-supurge-dreame-d10plus", AuthorName = "Sevgi Taş", Rating = 4, Title = "Süpürme iyi, paspas idare eder", Text = "Toz/kıl toplama mükemmel, 4000Pa güçlü. Paspas yüzeysel temizlik yapıyor, inatçı lekeleri silmiyor. Genel olarak memnunum.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-22), HelpfulCount = 31, TagsJson = """["emiş gücü","paspas"]""" },
            new() { ProductId = "robot-supurge-dreame-d10plus", AuthorName = "Kubilay Er", Rating = 4, Title = "Uygulama kullanışlı", Text = "Telefon uygulamasından oda oda temizlik ve yasak alan ayarlanıyor. Yüksek halıda paspas pedini çıkarmak gerekiyor, tek eksi.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-17), HelpfulCount = 27, TagsJson = """["uygulama","halı"]""" },
            new() { ProductId = "robot-supurge-dreame-d10plus", AuthorName = "Özlem Bak", Rating = 5, Title = "Evcil hayvan tüyüne birebir", Text = "İki kedim var, her gün çalıştırıyorum, tüy sorunu bitti. İstasyon sesi boşaltırken biraz yüksek ama 10 saniye sürüyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-9), HelpfulCount = 38, TagsJson = """["evcil hayvan","istasyon sesi"]""" },

            // ─── Philips XXL Airfryer ───
            new() { ProductId = "hava-fritoz-philips-xxl", AuthorName = "Rıza Gül", Rating = 5, Title = "Kalabalık aileye birebir", Text = "5 kişiyiz, 7.3L hazne tek seferde herkese yetiyor. Patates çıtır çıtır, yağ kullanmadan. Tava bulaşık makinesinde temizleniyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-12), HelpfulCount = 44, TagsJson = """["kapasite","temizlik"]""" },
            new() { ProductId = "hava-fritoz-philips-xxl", AuthorName = "Hande Coş", Rating = 4, Title = "Sağlıklı ama yer kaplıyor", Text = "Yağsız yemek yapmak harika, tavuk çok lezzetli oluyor. Ama tezgahta ciddi yer tutuyor, küçük mutfak için büyük olabilir.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-25), HelpfulCount = 33, TagsJson = """["sağlıklı pişirme","boyut"]""" },
            new() { ProductId = "hava-fritoz-philips-xxl", AuthorName = "Emrah Sel", Rating = 4, Title = "Hazır programlar pratik", Text = "Dijital ekrandan tek tuşla patates, tavuk, balık seçiliyor. Sonuç tutarlı. Sadece ısınırken hafif plastik kokusu ilk kullanımda oldu.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-18), HelpfulCount = 21, TagsJson = """["hazır program","koku"]""" },
            new() { ProductId = "hava-fritoz-philips-xxl", AuthorName = "Sevda Yön", Rating = 5, Title = "Pişman olmadım", Text = "Aylardır neredeyse her gün kullanıyorum. Fritöz yağından kurtulduk, mutfak yağ kokmuyor. Kesinlikle tavsiye ederim.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-36), HelpfulCount = 26, TagsJson = """["kullanım","memnuniyet"]""" },

            // ─── De'Longhi Dedica Espresso ───
            new() { ProductId = "espresso-delonghi-dedica", AuthorName = "Levent Ok", Rating = 5, Title = "Küçük mutfaklar için ideal genişlik", Text = "Sadece 15 cm, tezgahta neredeyse yer kaplamıyor. 40 saniyede ısınıyor, sabah hızlı espresso. Crema gayet iyi.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-13), HelpfulCount = 38, TagsJson = """["boyut","ısınma süresi"]""" },
            new() { ProductId = "espresso-delonghi-dedica", AuthorName = "Nur Aydın", Rating = 4, Title = "Buhar çubuğu iyi köpürtüyor", Text = "Latte için süt köpürtmek biraz pratik istiyor ama alışınca profesyonel sonuç. Manuel olduğu için kontrol bende, beğendim.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-24), HelpfulCount = 29, TagsJson = """["buhar çubuğu","süt köpüğü"]""" },
            new() { ProductId = "espresso-delonghi-dedica", AuthorName = "Tamer Iş", Rating = 3, Title = "Öğütücü dahil değil, dikkat", Text = "Makine güzel ama taze çekirdek için ayrı değirmen almak gerekti, ek masraf. Tam otomatik bekleyenler için değil.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-29), HelpfulCount = 35, TagsJson = """["öğütücü","ek maliyet"]""" },
            new() { ProductId = "espresso-delonghi-dedica", AuthorName = "Esra Bağ", Rating = 5, Title = "Kahve dükkanı tadında", Text = "Doğru öğütme + bu makine ile evde barista kalitesi espresso. Paslanmaz tasarım şık. Sabah ritüelim oldu, çok mutluyum.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-8), HelpfulCount = 24, TagsJson = """["kahve kalitesi","tasarım"]""" },

            // ─── Dyson Supersonic ───
            new() { ProductId = "sac-kurutma-dyson-supersonic", AuthorName = "Aylin Su", Rating = 5, Title = "Saçım hasar görmüyor", Text = "Isı kontrolü gerçek, saçım eskisi gibi kavrulmuyor, daha sağlıklı görünüyor. Çok hızlı kuruyor. Pahalı ama değer.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-15), HelpfulCount = 52, TagsJson = """["ısı kontrolü","saç sağlığı"]""" },
            new() { ProductId = "sac-kurutma-dyson-supersonic", AuthorName = "Ceyda Al", Rating = 5, Title = "Kuruma süresi yarıya indi", Text = "Uzun ve kalın saçım vardı, eski fönle 20 dk uğraşırdım, bununla 8-10 dk. Sessiz sayılır. Başlıklar pratik.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-23), HelpfulCount = 41, TagsJson = """["kuruma süresi","başlıklar"]""" },
            new() { ProductId = "sac-kurutma-dyson-supersonic", AuthorName = "Burcu Tek", Rating = 4, Title = "Harika ama fiyatı yüksek", Text = "Performans tartışılmaz, saç dostu. Tek sorun fiyat; temel kurutma yeten biri için lüks kaçabilir. Ben kuaföre gitmeyi bıraktım.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-30), HelpfulCount = 37, TagsJson = """["fiyat","değer"]""" },
            new() { ProductId = "sac-kurutma-dyson-supersonic", AuthorName = "Sıla Ün", Rating = 5, Title = "Hediye aldım, bayıldı", Text = "Anneme aldım, kullanınca eski fönüne dönmüyor. Saç uçuşması azaldı, parlaklık arttı. Premium hissi veriyor.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-37), HelpfulCount = 23, TagsJson = """["hediye","parlaklık"]""" },

            // ─── Garmin Forerunner 255 ───
            new() { ProductId = "saat-garmin-forerunner255", AuthorName = "Serhat Koş", Rating = 5, Title = "Koşucu için tam isabet", Text = "Çift bant GPS rotayı şaşmadan çiziyor, ağaçlık alanda bile sapma yok. Antrenman yükü ve toparlanma metrikleri çok faydalı.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-14), HelpfulCount = 46, TagsJson = """["gps","antrenman metrikleri"]""" },
            new() { ProductId = "saat-garmin-forerunner255", AuthorName = "Defne Er", Rating = 5, Title = "Pil ömrü olağanüstü", Text = "Haftada 4 koşu yapıyorum, GPS açıkken bile 10+ gün gidiyor. Galaxy Watch'tan geçtim, şarj derdi bitti. Maraton için ideal.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-21), HelpfulCount = 39, TagsJson = """["pil ömrü","gps"]""" },
            new() { ProductId = "saat-garmin-forerunner255", AuthorName = "Mahir Al", Rating = 4, Title = "Spor için kral, akıllı saat için orta", Text = "Koşu metrikleri rakipsiz ama uygulama ekosistemi ve bildirim etkileşimi genel akıllı saatler kadar zengin değil. Sporcuysanız alın.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-28), HelpfulCount = 33, TagsJson = """["spor odaklı","uygulama"]""" },
            new() { ProductId = "saat-garmin-forerunner255", AuthorName = "İpek Yıl", Rating = 5, Title = "Müzik depolama büyük artı", Text = "Telefon olmadan kulaklıkla koşuya çıkıyorum, müzik saatte. Triatlon modu da var. Ciddi sporcu için tam donanım.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-35), HelpfulCount = 27, TagsJson = """["müzik","triatlon"]""" },

            // ─── Garmin Edge 530 ───
            new() { ProductId = "bisiklet-bilgisayar-garmin-edge530", AuthorName = "Tunç Ay", Rating = 5, Title = "Tırmanış metrikleri muhteşem", Text = "ClimbPro tırmanışta ne kadar kaldığını gösteriyor, moral oluyor. GPS hassas, harita net. Uzun turlarda 18 saat pil yetiyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-15), HelpfulCount = 31, TagsJson = """["climbpro","gps"]""" },
            new() { ProductId = "bisiklet-bilgisayar-garmin-edge530", AuthorName = "Yiğit Or", Rating = 4, Title = "Sensör desteği geniş", Text = "Güç metre ve kadans sensörünü sorunsuz bağladım. Veriler detaylı. Dokunmatik olmaması ilk başta garip, sonra alışıyorsunuz.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-24), HelpfulCount = 24, TagsJson = """["sensör","tuş kontrolü"]""" },
            new() { ProductId = "bisiklet-bilgisayar-garmin-edge530", AuthorName = "Comert Su", Rating = 4, Title = "Profesyonele yönelik", Text = "Veri zengini ama yeni başlayan için fazla detaylı olabilir. Sadece hız/mesafe isteyene ekonomik model yeterli. Ben veriyi seviyorum, harika.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-29), HelpfulCount = 28, TagsJson = """["veri","hedef kitle"]""" },
            new() { ProductId = "bisiklet-bilgisayar-garmin-edge530", AuthorName = "Barkın El", Rating = 5, Title = "Navigasyon yol turlarında kurtarıcı", Text = "Bilmediğim rotalarda harita üzerinden yön buluyorum, kaybolmuyorum. Kaza algılama özelliği eşim için güven veriyor.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-33), HelpfulCount = 22, TagsJson = """["navigasyon","güvenlik"]""" },

            // ─── Ayarlanabilir Dambıl Seti ───
            new() { ProductId = "dambil-seti-ayarlanabilir", AuthorName = "Devran Çakır", Rating = 5, Title = "Evde yer sorununu çözdü", Text = "15 çift dambıl yerine tek set, dolapta minik yer kaplıyor. Ağırlık değişimi çevirmeli, 3 saniye. Ev antrenmanı için ideal.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-13), HelpfulCount = 34, TagsJson = """["yer tasarrufu","ayar"]""" },
            new() { ProductId = "dambil-seti-ayarlanabilir", AuthorName = "Hazal Ün", Rating = 4, Title = "Pratik ama ses yapıyor", Text = "Ağırlık ayarı kolay, kullanışlı. Hareket sırasında plakalar hafif tıkırdıyor, alışılıyor. Genel olarak fiyatına değer.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-22), HelpfulCount = 26, TagsJson = """["ayar","ses"]""" },
            new() { ProductId = "dambil-seti-ayarlanabilir", AuthorName = "Polat Ay", Rating = 3, Title = "Ağır kaldırışta dikkatli olun", Text = "Orta seviye antrenman için yeterli ama çok ağır ve sert yere bırakınca mekanizma zorlanıyor. Sabit dambıl daha sağlam.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-28), HelpfulCount = 30, TagsJson = """["dayanıklılık","kullanım"]""" },
            new() { ProductId = "dambil-seti-ayarlanabilir", AuthorName = "Sude Kar", Rating = 4, Title = "Başlangıç için harika", Text = "Yeni başladım, 2-24kg aralığı her egzersize yetiyor. Stand dahil değil, yere koyuyorum. Spor salonu masrafından kurtuldum.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-34), HelpfulCount = 19, TagsJson = """["başlangıç","aralık"]""" },

            // ─── Manduka PRO Yoga Matı ───
            new() { ProductId = "yoga-mati-manduka-pro", AuthorName = "Yasemin Gök", Rating = 5, Title = "Eklem dostu kalınlık", Text = "6mm yoğun yapı dizlerimi koruyor, sert zeminde bile rahatım. Ömür boyu garanti güven veriyor. Yıllardır en iyi matım.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-14), HelpfulCount = 43, TagsJson = """["kalınlık","eklem koruması"]""" },
            new() { ProductId = "yoga-mati-manduka-pro", AuthorName = "Ela Demir", Rating = 4, Title = "İlk haftalar kaygan, sonra mükemmel", Text = "Yeni mat terli ellerde kayıyordu, tuz-su yöntemiyle açtım, şimdi tutuş harika. Break-in süreci gerçek ama sonrası süper.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-23), HelpfulCount = 36, TagsJson = """["tutuş","break-in"]""" },
            new() { ProductId = "yoga-mati-manduka-pro", AuthorName = "Toprak Yıl", Rating = 5, Title = "Ömür boyu garanti gerçek", Text = "3 yıldır günlük kullanıyorum, hiç bozulma, incelme yok. Ağır ama bu yoğunluğun bedeli. Eve sabit mat arayan kesin alsın.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-9), HelpfulCount = 31, TagsJson = """["dayanıklılık","garanti"]""" },
            new() { ProductId = "yoga-mati-manduka-pro", AuthorName = "Naz Ak", Rating = 4, Title = "Seyahat için ağır", Text = "Evde kullanım için ideal, kalın ve sağlam. Ama 3.4kg, stüdyoya taşımak istemiyorum, o iş için ince seyahat matı aldım.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-31), HelpfulCount = 20, TagsJson = """["ağırlık","taşınabilirlik"]""" },

            // ─── Basic Beyaz Tişört ───
            new() { ProductId = "tisort-basic-beyaz", AuthorName = "Cem Ak", Rating = 5, Title = "Her kombine giriyor", Text = "Kot, chino, jogger fark etmiyor; hepsiyle uyumlu. Blazer altına da giydim, çok şık durdu. 3 adet daha aldım.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-12), HelpfulCount = 38, TagsJson = """["kombin","çok yönlü"]""" },
            new() { ProductId = "tisort-basic-beyaz", AuthorName = "Selin Taş", Rating = 4, Title = "Kumaşı kaliteli ama çekiyor", Text = "Pamuk yumuşacık ama ilk yıkamada hafif çekti, bir beden büyük alın derim. Beyazlığı solmuyor, memnunum.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-25), HelpfulCount = 29, TagsJson = """["kumaş","beden"]""" },
            new() { ProductId = "tisort-basic-beyaz", AuthorName = "Mert Yıl", Rating = 4, Title = "Fiyatına göre süper", Text = "Bu paraya bu pamuk kalitesi iyi. Regular fit tam oturuyor, ne dar ne bol. Günlük temel parça olarak ideal.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-8), HelpfulCount = 21, TagsJson = """["fiyat/performans","kalıp"]""" },
            new() { ProductId = "tisort-basic-beyaz", AuthorName = "Ece Gün", Rating = 3, Title = "Hafif şeffaf", Text = "Kalitesi iyi ama beyaz olduğu için ince kalmış, tek başına giyince hafif şeffaflık var. Katmanlı kombinde sorun yok.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-33), HelpfulCount = 17, TagsJson = """["kumaş","kalınlık"]""" },

            // ─── Oxford Mavi Gömlek ───
            new() { ProductId = "gomlek-oxford-mavi", AuthorName = "Burak Sön", Rating = 5, Title = "Ofis-hafta sonu hepsi tek gömlek", Text = "Chino ile ofise, kot + sneaker ile hafta sonu giydim. Açık mavi her şeye uyuyor. Blazer altında da harika.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-14), HelpfulCount = 42, TagsJson = """["kombin","çok yönlü"]""" },
            new() { ProductId = "gomlek-oxford-mavi", AuthorName = "Deniz Or", Rating = 4, Title = "Slim kalıp dar geldi", Text = "Kumaş ve dikiş çok iyi ama slim fit gerçekten dar; bir beden büyük aldım, şimdi tam. Oxford dokusu kaliteli.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-22), HelpfulCount = 31, TagsJson = """["kalıp","beden"]""" },
            new() { ProductId = "gomlek-oxford-mavi", AuthorName = "Kaan El", Rating = 5, Title = "Kolay ütüleniyor", Text = "Sabah aceleyle ütülüyorum, kırışıkları hemen çıkıyor. Renk solmadı. Smart-casual kombinlerimin demirbaşı oldu.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-9), HelpfulCount = 24, TagsJson = """["ütü","dayanıklılık"]""" },
            new() { ProductId = "gomlek-oxford-mavi", AuthorName = "Pelin Su", Rating = 4, Title = "Eşime aldım, beğendi", Text = "Kumaşı dökümlü, kombinlemesi kolay. Kol boyu biraz uzun geldi ama kıvırınca günlük şıklık oluyor.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-30), HelpfulCount = 15, TagsJson = """["kombin","kol boyu"]""" },

            // ─── Slim Lacivert Kot ───
            new() { ProductId = "kot-pantolon-slim-lacivert", AuthorName = "Onur Çe", Rating = 5, Title = "Koyu ton her şeye uyuyor", Text = "Beyaz tişört + sneaker ile günlük, gömlek + bot ile şık. Koyu lacivert çok kullanışlı, leke de belli olmuyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-13), HelpfulCount = 36, TagsJson = """["kombin","renk"]""" },
            new() { ProductId = "kot-pantolon-slim-lacivert", AuthorName = "Sıla Ak", Rating = 4, Title = "Likralı, rahat", Text = "Slim ama likra sayesinde hareket kısıtlamıyor, gün boyu rahat. İlk gün hafif esnedi, sonra oturdu.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-21), HelpfulCount = 27, TagsJson = """["esneklik","konfor"]""" },
            new() { ProductId = "kot-pantolon-slim-lacivert", AuthorName = "Tuna Er", Rating = 4, Title = "Dikişler sağlam", Text = "2 aydır sık giyiyorum, dikişlerde sorun yok, rengi solmadı. Slim kalıp baldırı dar sevmeyenlere göre değil.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-29), HelpfulCount = 22, TagsJson = """["dayanıklılık","kalıp"]""" },
            new() { ProductId = "kot-pantolon-slim-lacivert", AuthorName = "Gece Ün", Rating = 3, Title = "Boy uzun geldi", Text = "Kalite iyi ama paça uzun, kıvırmak veya kısaltmak gerekti. Renk fotoğraftaki gibi koyu lacivert, memnunum.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-35), HelpfulCount = 14, TagsJson = """["boy","beden"]""" },

            // ─── Bej Chino ───
            new() { ProductId = "chino-pantolon-bej", AuthorName = "Arda Yı", Rating = 5, Title = "Nötr ton kombin kolaylaştırıyor", Text = "Gömlek + blazer ile ofis, triko + sneaker ile gezme. Bej her renkle uyumlu, kombin yapması çok kolay.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-12), HelpfulCount = 33, TagsJson = """["kombin","çok yönlü"]""" },
            new() { ProductId = "chino-pantolon-bej", AuthorName = "Naz Bo", Rating = 4, Title = "Regular kalıp rahat", Text = "Slim sevmiyorum, bu regular tam istediğim gibi. Kumaş kalın değil, 4 mevsim giyilir. Bej rengi açık, leke gösterir.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-24), HelpfulCount = 19, TagsJson = """["kalıp","kumaş"]""" },
            new() { ProductId = "chino-pantolon-bej", AuthorName = "Efe Ka", Rating = 4, Title = "Fiyatına değer", Text = "Bu paraya chino kalitesi iyi. Elastan sayesinde rahat. Ütü tutuyor, ofise giyilebilir düzeyde şık.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-8), HelpfulCount = 16, TagsJson = """["fiyat/performans","şıklık"]""" },

            // ─── Antrasit Triko ───
            new() { ProductId = "triko-kazak-antrasit", AuthorName = "Mira Şe", Rating = 5, Title = "Gömlek üstüne mükemmel", Text = "Oxford gömlek üzerine giyince çok şık katmanlı kombin oluyor. Antrasit nötr, kot ve chino ile uyumlu. Bayıldım.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-14), HelpfulCount = 41, TagsJson = """["katmanlı kombin","renk"]""" },
            new() { ProductId = "triko-kazak-antrasit", AuthorName = "Berk Ay", Rating = 4, Title = "İnce ama şık", Text = "Çok soğukta tek başına yetmiyor, mont gerekiyor. Ama ilkbahar-sonbahar için ideal, dökümü güzel, pilling yapmadı.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-23), HelpfulCount = 26, TagsJson = """["kalınlık","mevsim"]""" },
            new() { ProductId = "triko-kazak-antrasit", AuthorName = "Su Den", Rating = 5, Title = "Trençkot altında harika", Text = "Triko + kot + trençkot kombinim çok beğeniliyor. Yumuşacık, kaşındırmıyor. Yarım balıkçı yaka tam kıvamında.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-9), HelpfulCount = 22, TagsJson = """["kombin","konfor"]""" },
            new() { ProductId = "triko-kazak-antrasit", AuthorName = "Can Ün", Rating = 4, Title = "Beden tam", Text = "Regular kalıp tam oturuyor, ne dar ne bol. Akrilik karışım ama kaliteli duruyor. Fiyatına göre başarılı.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-31), HelpfulCount = 13, TagsJson = """["beden","kumaş"]""" },

            // ─── Lacivert Blazer ───
            new() { ProductId = "blazer-ceket-lacivert", AuthorName = "Ozan Ta", Rating = 5, Title = "Smart-casual'ın olmazsa olmazı", Text = "Tişört + kot üstüne attığımda sıradan kombin bir anda şık oldu. Gömlek + chino ile ofise de gidiyorum. Çok yönlü.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-15), HelpfulCount = 39, TagsJson = """["kombin","çok yönlü"]""" },
            new() { ProductId = "blazer-ceket-lacivert", AuthorName = "İrem Ko", Rating = 4, Title = "Slim, içine dikkat", Text = "Kalıp güzel ama slim olduğu için kalın triko sığmıyor, ince katman gerekiyor. Lacivert ton kaliteli, astarı düzgün.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-26), HelpfulCount = 28, TagsJson = """["kalıp","beden"]""" },
            new() { ProductId = "blazer-ceket-lacivert", AuthorName = "Polat Sa", Rating = 5, Title = "Yün karışımı sıcak tutuyor", Text = "Hem şık hem ilkbahar-sonbahar için yeterince sıcak. Dikiş kalitesi beklediğimden iyi çıktı. Düğmeler sağlam.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-10), HelpfulCount = 20, TagsJson = """["kumaş","dayanıklılık"]""" },

            // ─── Kahve Deri Kemer ───
            new() { ProductId = "kemer-deri-kahve", AuthorName = "Yiğit Bo", Rating = 5, Title = "Botla renk uyumu mükemmel", Text = "Chelsea botumla aynı tonda, kombini tamamlıyor. Hakiki deri kokusu belli, kalitesi hissediliyor. Tokası şık.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-13), HelpfulCount = 30, TagsJson = """["kombin","deri kalitesi"]""" },
            new() { ProductId = "kemer-deri-kahve", AuthorName = "Aslı De", Rating = 5, Title = "Eşime aldım, çok beğendi", Text = "Hem chino hem kot ile kullanıyor. Deri sert değil, esnek ve rahat. Bu fiyata hakiki deri bulmak zor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-21), HelpfulCount = 24, TagsJson = """["fiyat/performans","konfor"]""" },
            new() { ProductId = "kemer-deri-kahve", AuthorName = "Emre Ka", Rating = 4, Title = "Beden seçimine dikkat", Text = "Kalite çok iyi ama tablo biraz yanıltıcı, bir küçük almalıydım. Son delikten kestirdim, şimdi tam oturuyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-28), HelpfulCount = 18, TagsJson = """["beden","kullanım"]""" },

            // ─── Beyaz Sneaker ───
            new() { ProductId = "sneaker-beyaz-deri", AuthorName = "Doruk Al", Rating = 5, Title = "Her kombinin tabanı", Text = "Kot, chino, jogger... hepsiyle uyumlu. Sade beyaz tasarım smart-casual'a bile uyuyor. En çok giydiğim ayakkabı oldu.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-14), HelpfulCount = 44, TagsJson = """["kombin","çok yönlü"]""" },
            new() { ProductId = "sneaker-beyaz-deri", AuthorName = "Ela Su", Rating = 4, Title = "Rahat ama bakım ister", Text = "Deri kaliteli, ayak sıkmıyor, gün boyu rahat. Ama beyaz olduğu için çabuk kirleniyor, su itici sprey şart.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-22), HelpfulCount = 33, TagsJson = """["konfor","bakım"]""" },
            new() { ProductId = "sneaker-beyaz-deri", AuthorName = "Kerem Ün", Rating = 5, Title = "Numara tam", Text = "Genelde yarım büyük alırım, bu normal numara tam oldu. Taban yumuşak, uzun yürüyüşte yormuyor. Tavsiye ederim.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-9), HelpfulCount = 21, TagsJson = """["numara","konfor"]""" },
            new() { ProductId = "sneaker-beyaz-deri", AuthorName = "Bade Or", Rating = 4, Title = "Şık ama dar kalıp", Text = "Tasarımı minimal ve şık, her kıyafetle gidiyor. Geniş ayaklılar yarım numara büyük alsın, kalıbı dar.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-32), HelpfulCount = 16, TagsJson = """["tasarım","kalıp"]""" },

            // ─── Chelsea Bot ───
            new() { ProductId = "bot-chelsea-kahve", AuthorName = "Tolga Şe", Rating = 5, Title = "Kış smart-casual tamamlandı", Text = "Koyu kot + triko + trençkot kombinimi tamamladı. Kahve süet çok asil duruyor, kemerle uyumlu. Bayıldım.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-15), HelpfulCount = 35, TagsJson = """["kombin","tasarım"]""" },
            new() { ProductId = "bot-chelsea-kahve", AuthorName = "Nur Ay", Rating = 4, Title = "Süet bakım istiyor", Text = "Çok şık ama yağmurda dikkat gerekiyor, koruyucu sprey aldım. Yandan lastikli, giyip çıkarması çok pratik.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-24), HelpfulCount = 28, TagsJson = """["bakım","kullanım"]""" },
            new() { ProductId = "bot-chelsea-kahve", AuthorName = "Mert Do", Rating = 4, Title = "Rahat ama sert taban", Text = "İlk günler taban sertti, birkaç kullanımda oturdu. Süet kalitesi iyi, numara tam. Sonbahar-kış için ideal.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-29), HelpfulCount = 19, TagsJson = """["konfor","numara"]""" },

            // ─── Siyah Puffer Mont ───
            new() { ProductId = "mont-puffer-siyah", AuthorName = "Cenk Ar", Rating = 5, Title = "Kış kombinin dış katmanı", Text = "Triko + kot üstüne giydiğimde hem sıcak hem şık. Su itici, çiseleyen yağmurda ıslanmadım. Çok memnunum.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-13), HelpfulCount = 40, TagsJson = """["kombin","su direnci"]""" },
            new() { ProductId = "mont-puffer-siyah", AuthorName = "Esra Ün", Rating = 4, Title = "Sıcak ama hacimli", Text = "Çok sıcak tutuyor, eksi derecede bile üşümedim. Sadece dolgu hacimli, ince görünüm sevenler için olmayabilir.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-21), HelpfulCount = 31, TagsJson = """["sıcaklık","kalıp"]""" },
            new() { ProductId = "mont-puffer-siyah", AuthorName = "Barış Ka", Rating = 5, Title = "Kapüşon çıkıyor, pratik", Text = "Kapüşon çıkarılabiliyor, havaya göre kullanıyorum. Siyah her kombine uyuyor. Fermuar kaliteli, dikişler sağlam.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-9), HelpfulCount = 23, TagsJson = """["kullanım","dayanıklılık"]""" },
            new() { ProductId = "mont-puffer-siyah", AuthorName = "Gül Ta", Rating = 4, Title = "Beden büyük geliyor", Text = "İçine kalın giyeceğim diye normal aldım ama bol oldu, bir küçük alınmalıymış. Sıcaklık ve kalite süper.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-34), HelpfulCount = 17, TagsJson = """["beden","sıcaklık"]""" },

            // ─── Bej Trençkot ───
            new() { ProductId = "trenchcoat-bej", AuthorName = "Sinem Bo", Rating = 5, Title = "Zarif sonbahar parçası", Text = "Gömlek + chino üzerine giydiğimde çok zarif bir hava kattı. Bej ton her şeye uyuyor, süet botla mükemmel.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-14), HelpfulCount = 32, TagsJson = """["kombin","tasarım"]""" },
            new() { ProductId = "trenchcoat-bej", AuthorName = "Ali Ka", Rating = 4, Title = "Mevsimlik, kışın yetmez", Text = "İlkbahar-sonbahar için ideal, su itici özelliği işe yarıyor. Ama kışın tek başına soğuk, içine triko şart.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-23), HelpfulCount = 26, TagsJson = """["mevsim","sıcaklık"]""" },
            new() { ProductId = "trenchcoat-bej", AuthorName = "Defne Or", Rating = 5, Title = "Kemeri şıklık katıyor", Text = "Bağlamalı kemer beli toparlıyor, duruşu çok güzel. Kumaş dökümlü, ucuz durmuyor. Smart-casual kombinin yıldızı.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-10), HelpfulCount = 21, TagsJson = """["tasarım","kumaş"]""" },

            // ─── Gri Sweatshirt ───
            new() { ProductId = "sweatshirt-kapusonlu-gri", AuthorName = "Eren Yı", Rating = 5, Title = "Jogger ile tam spor-casual", Text = "Jogger + sneaker ile rahat günlük kombinim oldu. Mont altına da giriyor. Gri melanj her şeye uyuyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-13), HelpfulCount = 34, TagsJson = """["kombin","çok yönlü"]""" },
            new() { ProductId = "sweatshirt-kapusonlu-gri", AuthorName = "Asya Ka", Rating = 4, Title = "Oversize gerçekten bol", Text = "Oversize olduğu net, dar sevenler bir küçük alsın. Kumaş içi yumuşak şardonlu, sıcak tutuyor. Rahat.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-22), HelpfulCount = 27, TagsJson = """["kalıp","kumaş"]""" },
            new() { ProductId = "sweatshirt-kapusonlu-gri", AuthorName = "Kuzey Su", Rating = 4, Title = "Fiyatına iyi", Text = "Bu paraya kapüşonlu kalitesi gayet iyi. Birkaç yıkamada bozulmadı, tüylenme yok. Günlük kombin için pratik.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-29), HelpfulCount = 18, TagsJson = """["fiyat/performans","dayanıklılık"]""" },

            // ─── Siyah Jogger ───
            new() { ProductId = "jogger-esofman-siyah", AuthorName = "Tan Er", Rating = 5, Title = "Sweatshirt + sneaker üçlüsü", Text = "Sweatshirt ve sneaker ile günlük spor kombinim hazır. Siyah leke göstermiyor, çok pratik. Cepleri derin.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-12), HelpfulCount = 29, TagsJson = """["kombin","kullanım"]""" },
            new() { ProductId = "jogger-esofman-siyah", AuthorName = "Lale Ün", Rating = 4, Title = "Paça dar", Text = "Slim jogger kalıbı, lastikli paça baldırı dar olanlara dar gelebilir. Kumaş kaliteli, dökümü iyi. Rahat.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-21), HelpfulCount = 22, TagsJson = """["kalıp","konfor"]""" },
            new() { ProductId = "jogger-esofman-siyah", AuthorName = "Bora Sa", Rating = 4, Title = "Yazın tişörtle de olur", Text = "Sadece eşofman değil, tişört ile yazlık rahat kombin de yapılıyor. Pamuk ağırlıklı, terletmiyor.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-33), HelpfulCount = 14, TagsJson = """["kombin","kumaş"]""" },

            // ─── Yün Bere ───
            new() { ProductId = "sapka-bere-yun", AuthorName = "Umut Ak", Rating = 5, Title = "Puffer montla tamamlandı", Text = "Mont + triko kış kombinime bere ekleyince hem sıcak hem şık oldu. Antrasit nötr, her şeye uyuyor.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-12), HelpfulCount = 25, TagsJson = """["kombin","renk"]""" },
            new() { ProductId = "sapka-bere-yun", AuthorName = "Sena Bo", Rating = 4, Title = "Sıcak ama hafif kaşındırır", Text = "Çok sıcak tutuyor, kışın vazgeçilmez. Yün içerikli olduğu için hassas alında hafif kaşıntı yapıyor, içine bandana taktım.", VerifiedPurchase = true, Date = DateTime.UtcNow.AddDays(-24), HelpfulCount = 19, TagsJson = """["sıcaklık","konfor"]""" },
            new() { ProductId = "sapka-bere-yun", AuthorName = "Efe Ün", Rating = 5, Title = "Fiyatına süper aksesuar", Text = "200 liraya bu kalite bere iyi. Katlamalı, esnek, kafayı sıkmıyor. Kış kombinlerini tamamlayan ucuz detay.", VerifiedPurchase = false, Date = DateTime.UtcNow.AddDays(-30), HelpfulCount = 12, TagsJson = """["fiyat/performans","konfor"]""" },
        };
        var missingReviews = reviews.Where(r => !existingReviewProductIds.Contains(r.ProductId)).ToList();
        if (missingReviews.Count > 0)
        {
            db.ProductReviews.AddRange(missingReviews);
            await db.SaveChangesAsync();
        }

        // ── Seller User & Seller (create if missing) ──
        var sellerUser = await db.Users.FirstOrDefaultAsync(u => u.Email == "mehmet@ornekstore.com");
        if (sellerUser is null)
        {
            sellerUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "mehmet@ornekstore.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Seller123!"),
                FullName = "Mehmet Kaya",
                Role = UserRole.Seller,
            };
            db.Users.Add(sellerUser);
            await db.SaveChangesAsync();
        }

        var seller = await db.Sellers.FirstOrDefaultAsync(s => s.UserId == sellerUser.Id);
        if (seller is null)
        {
            seller = new Seller
            {
                Id = Guid.NewGuid(),
                UserId = sellerUser.Id,
                StoreName = "Mehmet Elektronik",
                OwnerName = "Mehmet Kaya",
                TrustScore = 64,
                StoreRating = 4.6,
                TotalReviewCount = 1642,
                FastShipping = true,
                ReturnDays = 14,
                ApiKey = "am_live_demo_mehmet_elektronik_2024",
            };
            db.Sellers.Add(seller);
            await db.SaveChangesAsync();
        }
        else if (seller.ApiKey != "am_live_demo_mehmet_elektronik_2024")
        {
            seller.ApiKey = "am_live_demo_mehmet_elektronik_2024";
            await db.SaveChangesAsync();
        }

        // ── SellerProducts — add only if missing ──
        var existingSellerProductIds = await db.SellerProducts
            .Where(sp => sp.SellerId == seller.Id)
            .Select(sp => sp.ProductId)
            .ToHashSetAsync();

        var missingSellerProducts = products
            .Where(p => p.SellerName == seller.StoreName && !existingSellerProductIds.Contains(p.Id))
            .ToList();

        if (missingSellerProducts.Count > 0)
        {
            foreach (var p in missingSellerProducts)
            {
                db.SellerProducts.Add(new SellerProduct
                {
                    SellerId = seller.Id,
                    ProductId = p.Id,
                    IsPublished = true,
                });
            }
            await db.SaveChangesAsync();
        }

        // ── ProductBundles — add only if missing ──
        if (!await db.ProductBundles.AnyAsync(b => b.SellerId == seller.Id))
        {
            db.ProductBundles.AddRange(
                new ProductBundle
                {
                    SellerId = seller.Id,
                    PrimaryProductId = "bluetooth-kulaklik-pro-x1",
                    ComplementaryProductId = "telefon-kilifi-magsafe",
                    Title = "Günlük Teknoloji Paketi",
                    ShortDescription = "Kulaklık deneyimini telefon korumasıyla tamamla.",
                    CampaignText = "İkisini birlikte al, sepette %5 avantaj yakala.",
                    DiscountPercent = 5,
                    Status = ProductBundleStatus.Published,
                    RecommendationReason = "Aksesuar kategorisi elektronik ürünlerle birlikte sepet değerini artırır.",
                    Score = 94,
                    PublishedAt = DateTime.UtcNow,
                },
                new ProductBundle
                {
                    SellerId = seller.Id,
                    PrimaryProductId = "kahve-degirmeni-burr",
                    ComplementaryProductId = "mutfak-robotu-compact",
                    Title = "Mutfak Hazırlık Paketi",
                    ShortDescription = "Taze kahve ve pratik hazırlık ekipmanını birlikte sun.",
                    CampaignText = "Mutfakta iki tamamlayıcı ürünü birlikte al, %5 tasarruf et.",
                    DiscountPercent = 5,
                    Status = ProductBundleStatus.Published,
                    RecommendationReason = "Aynı mutfak kategorisindeki tamamlayıcı ürünler birlikte kullanım ihtiyacına hitap eder.",
                    Score = 91,
                    PublishedAt = DateTime.UtcNow,
                }
            );
            await db.SaveChangesAsync();
        }

        // ── Additional Sellers (TechZone, MobilePro, AudioMaster, HomeStyle, SporTech) ──
        var extraSellers = new[]
        {
            (Email: "techzone@store.com",    Store: "TechZone Bilgisayar",      Owner: "Ahmet Yıldız", Trust: 78, Rating: 4.4, Reviews: 980,  Fast: true,  ReturnDays: 14, Api: "am_live_demo_techzone_2024"),
            (Email: "mobilepro@store.com",   Store: "MobilePro Telefon",        Owner: "Selin Arslan", Trust: 72, Rating: 4.2, Reviews: 1310, Fast: true,  ReturnDays: 30, Api: "am_live_demo_mobilepro_2024"),
            (Email: "audiomaster@store.com", Store: "AudioMaster Ses",          Owner: "Kemal Doğan",  Trust: 85, Rating: 4.7, Reviews: 640,  Fast: false, ReturnDays: 14, Api: "am_live_demo_audiomaster_2024"),
            (Email: "homestyle@store.com",   Store: "HomeStyle Ev Elektroniği", Owner: "Fatma Şahin",  Trust: 69, Rating: 3.9, Reviews: 720,  Fast: true,  ReturnDays: 14, Api: "am_live_demo_homestyle_2024"),
            (Email: "sportech@store.com",    Store: "SporTech Aktif",           Owner: "Okan Çelik",   Trust: 81, Rating: 4.5, Reviews: 510,  Fast: true,  ReturnDays: 30, Api: "am_live_demo_sportech_2024"),
            (Email: "modatrend@store.com",   Store: "ModaTrend Giyim",          Owner: "Elif Yılmaz", Trust: 76, Rating: 4.4, Reviews: 1840, Fast: true,  ReturnDays: 30, Api: "am_live_demo_modatrend_2024"),
            (Email: "urbanstyle@store.com",  Store: "UrbanStyle Butik",         Owner: "Deniz Kara",  Trust: 80, Rating: 4.5, Reviews: 1120, Fast: true,  ReturnDays: 30, Api: "am_live_demo_urbanstyle_2024"),
        };

        foreach (var s in extraSellers)
        {
            var su = await db.Users.FirstOrDefaultAsync(u => u.Email == s.Email);
            if (su is null)
            {
                su = new User
                {
                    Id = Guid.NewGuid(),
                    Email = s.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Seller123!"),
                    FullName = s.Owner,
                    Role = UserRole.Seller,
                };
                db.Users.Add(su);
                await db.SaveChangesAsync();
            }

            var sl = await db.Sellers.FirstOrDefaultAsync(x => x.UserId == su.Id);
            if (sl is null)
            {
                sl = new Seller
                {
                    Id = Guid.NewGuid(),
                    UserId = su.Id,
                    StoreName = s.Store,
                    OwnerName = s.Owner,
                    TrustScore = s.Trust,
                    StoreRating = s.Rating,
                    TotalReviewCount = s.Reviews,
                    FastShipping = s.Fast,
                    ReturnDays = s.ReturnDays,
                    ApiKey = s.Api,
                };
                db.Sellers.Add(sl);
                await db.SaveChangesAsync();
            }

            var slExistingProductIds = await db.SellerProducts
                .Where(sp => sp.SellerId == sl.Id)
                .Select(sp => sp.ProductId)
                .ToHashSetAsync();

            var slMissing = products
                .Where(p => p.SellerName == sl.StoreName && !slExistingProductIds.Contains(p.Id))
                .ToList();

            if (slMissing.Count > 0)
            {
                foreach (var p in slMissing)
                {
                    db.SellerProducts.Add(new SellerProduct
                    {
                        SellerId = sl.Id,
                        ProductId = p.Id,
                        IsPublished = true,
                    });
                }
                await db.SaveChangesAsync();
            }
        }

        // ── Buyer Users — add only if missing ──
        if (!await db.Users.AnyAsync(u => u.Email == "burak@ornekstore.com"))
        {
            db.Users.AddRange(
                new User { Id = Guid.NewGuid(), Email = "burak@ornekstore.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Buyer123!"), FullName = "Burak Yılmaz", Role = UserRole.Buyer },
                new User { Id = Guid.NewGuid(), Email = "ali@test.com",         PasswordHash = BCrypt.Net.BCrypt.HashPassword("Buyer123!"), FullName = "Ali Demir",    Role = UserRole.Buyer }
            );
            await db.SaveChangesAsync();
        }

        Console.WriteLine("✅ Database seeded successfully.");
    }
}
