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
        if (await db.Categories.AnyAsync()) return; // already seeded

        // ── Categories ──
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

        var elec   = categories[0].Id;
        var spor   = categories[1].Id;
        var mut    = categories[2].Id;
        var ev     = categories[3].Id;
        var akc    = categories[4].Id;
        var bebek  = categories[5].Id;

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
        };
        db.Products.AddRange(products);
        await db.SaveChangesAsync();

        // ── Product Images ──
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
        };
        db.ProductImages.AddRange(images);
        await db.SaveChangesAsync();

        // ── Price History ──
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
        db.ProductPriceHistories.AddRange(priceHistories);
        await db.SaveChangesAsync();

        // ── Reviews for Bluetooth Kulaklık ──
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
        };
        db.ProductReviews.AddRange(reviews);
        await db.SaveChangesAsync();

        // ── Seller User ──
        var sellerUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "mehmet@ornekstore.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Seller123!"),
            FullName = "Mehmet Kaya",
            Role = UserRole.Seller,
        };
        db.Users.Add(sellerUser);
        await db.SaveChangesAsync();

        // ── Seller ──
        var seller = new Seller
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
        };
        db.Sellers.Add(seller);
        await db.SaveChangesAsync();

        // ── SellerProducts ──
        var sellerProductData = new[]
        {
            ("bluetooth-kulaklik-pro-x1", 142, 23, 5,  72, 34, 6500m, 4200m, ProductStatus.Urgent, "Mikrofon, oyun gecikmesi ve premium kanıt eksikliği"),
            ("spor-ayakkabi-runflex",     64,  27, 7,  76, 29, 3600m, 2600m, ProductStatus.Urgent, "Beden kalıbı ve ölçü beklentisi net değil"),
            ("mutfak-robotu-compact",     26,  21, 6,  74, 38, 1900m, 1700m, ProductStatus.Urgent, "Kutu içeriği ve ses seviyesi beklentisi karışık"),
            ("akilli-saat-fit-neo",       87,  15, 9,  58, 58, 1650m, 1400m, ProductStatus.Watch,  "Pil ömrü senaryoları açık değil"),
            ("ergonomik-calisma-sandalyesi", 54, 19, 5, 69, 49, 2800m, 2100m, ProductStatus.Watch, "Bel desteği ve ölçü beklentisi uyuşmuyor"),
            ("hava-temizleyici-mini",     31,  11, 9,  42, 67, 740m,  850m,  ProductStatus.Watch,  "Oda metrekare sınırı daha net yazılmalı"),
            ("telefon-kilifi-magsafe",    96,  13, 12, 46, 52, 680m,  950m,  ProductStatus.Watch,  "Uyumlu model listesi ve sararma bilgisi eksik"),
            ("usb-c-hub-pro",            33,  16, 7,  51, 61, 980m,  1200m, ProductStatus.Watch,  "Cihaz uyumluluğu ve ısınma beklentisi net değil"),
            ("seramik-taki-seti-beyaz",  22,  8,  11, 36, 78, 320m,  300m,  ProductStatus.Healthy,"Kırılganlık uyarısı daha görünür olabilir"),
            ("bebek-kamerasi-nightview", 14,  9,  10, 28, 82, 260m,  280m,  ProductStatus.Healthy,"Kurulum soruları destek içeriğiyle çözülebilir"),
            ("masa-lambasi-led",         38,  6,  13, 25, 88, 180m,  220m,  ProductStatus.Healthy,"Renk sıcaklığı bilgisi daha net olabilir"),
            ("kahve-degirmeni-burr",     19,  7,  8,  31, 74, 210m,  260m,  ProductStatus.Healthy,"Öğütme ayarı görseli daha iyi anlatılabilir"),
        };

        foreach (var (pid, sales, ret, conv, risk, health, lost, impr, status, issue) in sellerProductData)
        {
            db.SellerProducts.Add(new()
            {
                SellerId = seller.Id,
                ProductId = pid,
                Sales30d = sales,
                ReturnRate = ret,
                ConversionRate = conv,
                AiRiskScore = risk,
                HealthScore = health,
                LostProfitMonthly = lost,
                ImprovableRevenueMonthly = impr,
                Status = status,
                MainIssue = issue,
                LastAction = "Analiz bekleniyor",
            });
        }
        await db.SaveChangesAsync();

        // ── Buyer Users ──
        db.Users.AddRange(
            new User { Id = Guid.NewGuid(), Email = "burak@ornekstore.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Buyer123!"), FullName = "Burak Yılmaz", Role = UserRole.Buyer },
            new User { Id = Guid.NewGuid(), Email = "ali@test.com",         PasswordHash = BCrypt.Net.BCrypt.HashPassword("Buyer123!"), FullName = "Ali Demir",    Role = UserRole.Buyer }
        );
        await db.SaveChangesAsync();

        Console.WriteLine("✅ Database seeded successfully.");
    }
}
