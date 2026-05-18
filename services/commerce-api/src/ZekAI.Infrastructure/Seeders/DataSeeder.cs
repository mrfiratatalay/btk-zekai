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

        // ── Resolve category IDs by slug ──
        var catMap = await db.Categories.ToDictionaryAsync(c => c.Slug, c => c.Id);
        if (!catMap.ContainsKey("elektronik")) return; // unexpected state — bail

        var elec  = catMap["elektronik"];
        var spor  = catMap["spor-outdoor"];
        var mut   = catMap["mutfak"];
        var ev    = catMap["ev-yasam"];
        var akc   = catMap["aksesuar"];
        var bebek = catMap["anne-bebek"];

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
            .Where(p => !existingSellerProductIds.Contains(p.Id))
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
