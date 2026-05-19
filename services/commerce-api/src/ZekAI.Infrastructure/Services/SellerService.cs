using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ZekAI.Application.DTOs.Seller;
using ZekAI.Domain.Entities;
using ZekAI.Domain.Enums;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Infrastructure.Services;

public class SellerService(AppDbContext db, IHttpClientFactory httpClientFactory, IConfiguration config)
{
    private string AkilliMarketBaseUrl => config["AkilliMarket:BaseUrl"] ?? "http://localhost:5001";
    private async Task<Seller> GetSellerByUserIdAsync(Guid userId)
    {
        return await db.Sellers.FirstOrDefaultAsync(s => s.UserId == userId)
            ?? throw new KeyNotFoundException("Satıcı profili bulunamadı.");
    }

    public async Task<string> GetApiKeyAsync(Guid userId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        return seller.ApiKey;
    }

    public async Task<string> RegenerateApiKeyAsync(Guid userId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        seller.ApiKey = $"am_live_{Guid.NewGuid():N}";
        await db.SaveChangesAsync();
        return seller.ApiKey;
    }

    public async Task<SellerProfileDto> GetProfileAsync(Guid userId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        return new SellerProfileDto(
            seller.Id, seller.StoreName, seller.OwnerName,
            seller.TrustScore, seller.StoreRating, seller.TotalReviewCount,
            seller.FastShipping, seller.ReturnDays
        );
    }

    public async Task<List<SellerProductDto>> GetProductsAsync(Guid userId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        return await db.SellerProducts
            .Where(sp => sp.SellerId == seller.Id)
            .Include(sp => sp.Product).ThenInclude(p => p!.Images)
            .Include(sp => sp.Product).ThenInclude(p => p!.Category)
            .Select(sp => new SellerProductDto(
                sp.ProductId,
                sp.Product!.Title,
                sp.Product.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault() ?? "",
                sp.Product.Category!.Name,
                sp.Product.Price,
                sp.Product.Stock,
                sp.IsPublished,
                sp.UpdatedAt
            )).ToListAsync();
    }

    public async Task<SellerProductDto?> GetProductAsync(Guid userId, string productId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var sp = await db.SellerProducts
            .Where(sp => sp.SellerId == seller.Id && sp.ProductId == productId)
            .Include(sp => sp.Product).ThenInclude(p => p!.Images)
            .Include(sp => sp.Product).ThenInclude(p => p!.Category)
            .FirstOrDefaultAsync();

        if (sp is null) return null;
        return new SellerProductDto(
            sp.ProductId, sp.Product!.Title,
            sp.Product.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault() ?? "",
            sp.Product.Category!.Name, sp.Product.Price, sp.Product.Stock,
            sp.IsPublished, sp.UpdatedAt
        );
    }

    public async Task<SellerProductDto> CreateProductAsync(Guid userId, CreateProductRequest req)
    {
        var seller = await GetSellerByUserIdAsync(userId);

        var category = await db.Categories.FindAsync(req.CategoryId)
            ?? throw new KeyNotFoundException("Kategori bulunamadı.");

        var slug = GenerateSlug(req.Title);
        if (await db.Products.AnyAsync(p => p.Id == slug))
            slug = $"{slug}-{Guid.NewGuid().ToString("N")[..6]}";

        var product = new Product
        {
            Id = slug,
            Title = req.Title,
            Brand = req.Brand,
            SellerName = seller.StoreName,
            CategoryId = req.CategoryId,
            Price = req.Price,
            OriginalPrice = req.OriginalPrice,
            ShortDescription = req.ShortDescription,
            Description = req.Description,
            CargoText = req.CargoText,
            Stock = req.Stock,
            FeaturesJson = req.Features is { Count: > 0 }
                ? JsonSerializer.Serialize(req.Features)
                : "{}",
            BadgesJson = "[]",
        };

        db.Products.Add(product);

        if (!string.IsNullOrWhiteSpace(req.PrimaryImageUrl))
        {
            db.ProductImages.Add(new ProductImage
            {
                ProductId = slug,
                Url = req.PrimaryImageUrl,
                IsPrimary = true,
                SortOrder = 0,
            });
        }

        var sellerProduct = new SellerProduct
        {
            SellerId = seller.Id,
            ProductId = slug,
            IsPublished = true,
        };
        db.SellerProducts.Add(sellerProduct);

        await db.SaveChangesAsync();

        return new SellerProductDto(
            slug, product.Title,
            req.PrimaryImageUrl ?? "",
            category.Name, product.Price, product.Stock,
            true, sellerProduct.UpdatedAt
        );
    }

    public async Task DeleteProductAsync(Guid userId, string productId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var sp = await db.SellerProducts
            .FirstOrDefaultAsync(sp => sp.SellerId == seller.Id && sp.ProductId == productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var product = await db.Products
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .Include(p => p.PriceHistory)
            .FirstOrDefaultAsync(p => p.Id == productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        db.ProductImages.RemoveRange(product.Images);
        db.ProductReviews.RemoveRange(product.Reviews);
        db.ProductPriceHistories.RemoveRange(product.PriceHistory);
        var bundles = await db.ProductBundles
            .Where(b => b.SellerId == seller.Id &&
                        (b.PrimaryProductId == productId || b.ComplementaryProductId == productId))
            .ToListAsync();
        foreach (var bundle in bundles)
        {
            bundle.Status = ProductBundleStatus.Archived;
            bundle.ArchivedAt = DateTime.UtcNow;
            bundle.UpdatedAt = DateTime.UtcNow;
        }
        db.SellerProducts.Remove(sp);
        db.Products.Remove(product);
        await db.SaveChangesAsync();
    }

    public async Task<List<StoreConnectionDto>> GetConnectionsAsync(Guid userId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        return await db.StoreConnections
            .Where(c => c.SellerId == seller.Id)
            .Select(c => new StoreConnectionDto(
                c.Id,
                c.Platform.ToString(),
                c.StoreName,
                c.Status.ToString(),
                c.LastSyncAt,
                c.ProductCount,
                c.StoreApiKey != ""))
            .ToListAsync();
    }

    public async Task<StoreConnectionDto> ConnectStoreAsync(Guid userId, ConnectStoreRequest req)
    {
        var seller = await GetSellerByUserIdAsync(userId);

        if (!Enum.TryParse<StorePlatform>(req.Platform, true, out var platform))
            platform = StorePlatform.DemoStore;

        var existing = await db.StoreConnections
            .FirstOrDefaultAsync(c => c.SellerId == seller.Id && c.Platform == platform);

        if (existing is not null)
        {
            existing.StoreApiKey = req.StoreApiKey;
            existing.StoreName = req.StoreName;
            existing.Status = StoreConnectionStatus.Connected;
        }
        else
        {
            existing = new StoreConnection
            {
                SellerId = seller.Id,
                Platform = platform,
                StoreName = req.StoreName,
                StoreApiKey = req.StoreApiKey,
                Status = StoreConnectionStatus.Connected,
            };
            db.StoreConnections.Add(existing);
        }

        await db.SaveChangesAsync();
        return new StoreConnectionDto(existing.Id, existing.Platform.ToString(), existing.StoreName,
            existing.Status.ToString(), existing.LastSyncAt, existing.ProductCount, true);
    }

    public async Task DisconnectStoreAsync(Guid userId, int connectionId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var conn = await db.StoreConnections
            .FirstOrDefaultAsync(c => c.Id == connectionId && c.SellerId == seller.Id)
            ?? throw new KeyNotFoundException("Bağlantı bulunamadı.");

        conn.StoreApiKey = "";
        conn.Status = StoreConnectionStatus.NotConnected;
        await db.SaveChangesAsync();
    }

    public async Task SetProductPublishedAsync(Guid userId, string productId, bool published)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var sp = await db.SellerProducts
            .FirstOrDefaultAsync(sp => sp.SellerId == seller.Id && sp.ProductId == productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        // Bağlı DemoStore (Akıllı Market) varsa harici API'ye de yayınla
        var connection = await db.StoreConnections
            .FirstOrDefaultAsync(c => c.SellerId == seller.Id &&
                                      c.Status == StoreConnectionStatus.Connected &&
                                      c.StoreApiKey != "");

        if (connection is not null && published)
        {
            var client = httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", connection.StoreApiKey);

            var body = new StringContent(
                JsonSerializer.Serialize(new { published = true }),
                Encoding.UTF8, "application/json");

            var url = $"{AkilliMarketBaseUrl}/api/seller/products/{productId}/publish";
            var response = await client.PutAsync(url, body);

            if (!response.IsSuccessStatusCode)
                throw new InvalidOperationException("Akıllı Market'e yayınlama başarısız oldu.");
        }

        sp.IsPublished = published;
        sp.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    public async Task UpdateProductContentAsync(Guid userId, string productId, UpdateProductContentRequest req)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var sp = await db.SellerProducts
            .FirstOrDefaultAsync(sp => sp.SellerId == seller.Id && sp.ProductId == productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var product = await db.Products.FindAsync(productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        if (req.Title is not null) product.Title = req.Title;
        if (req.ShortDescription is not null) product.ShortDescription = req.ShortDescription;
        if (req.Description is not null) product.Description = req.Description;
        if (req.Features is not null) product.FeaturesJson = JsonSerializer.Serialize(req.Features);
        if (req.Price.HasValue) product.Price = req.Price.Value;
        if (req.Stock.HasValue) product.Stock = req.Stock.Value;
        if (req.Brand is not null) product.Brand = req.Brand;
        if (req.ClearOriginalPrice) product.OriginalPrice = null;
        else if (req.OriginalPrice.HasValue) product.OriginalPrice = req.OriginalPrice.Value;
        if (req.CargoText is not null) product.CargoText = req.CargoText;
        if (req.CategoryId.HasValue)
        {
            _ = await db.Categories.FindAsync(req.CategoryId.Value)
                ?? throw new KeyNotFoundException("Kategori bulunamadı.");
            product.CategoryId = req.CategoryId.Value;
        }
        if (!string.IsNullOrWhiteSpace(req.PrimaryImageUrl))
        {
            var existing = await db.ProductImages
                .FirstOrDefaultAsync(i => i.ProductId == productId && i.IsPrimary);
            if (existing is not null)
                existing.Url = req.PrimaryImageUrl;
            else
                db.ProductImages.Add(new ProductImage
                {
                    ProductId = productId,
                    Url = req.PrimaryImageUrl,
                    IsPrimary = true,
                    SortOrder = 0,
                });
        }

        product.UpdatedAt = DateTime.UtcNow;
        sp.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
    }

    public async Task<string> UpdateProductImageAsync(Guid userId, string productId, string imageBase64, string mimeType, string webRootPath)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var sp = await db.SellerProducts
            .FirstOrDefaultAsync(sp => sp.SellerId == seller.Id && sp.ProductId == productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var imageUrl = await SaveImageFileAsync(productId, imageBase64, mimeType, webRootPath);

        // Update or replace primary image record
        var existing = await db.ProductImages
            .FirstOrDefaultAsync(i => i.ProductId == productId && i.IsPrimary);

        if (existing is not null)
        {
            existing.Url = imageUrl;
        }
        else
        {
            db.ProductImages.Add(new ProductImage
            {
                ProductId = productId,
                Url = imageUrl,
                IsPrimary = true,
                SortOrder = 0,
            });
        }

        sp.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return imageUrl;
    }

    /// <summary>
    /// AI ile üretilen görseli commerce storage'a kaydeder ama ürünü DEĞİŞTİRMEZ
    /// (primary image / UpdatedAt'e dokunmaz). Taslak görsellerini kalıcılaştırmak için.
    /// </summary>
    public async Task<string> SaveDraftImageAsync(Guid userId, string productId, string imageBase64, string mimeType, string webRootPath)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var owns = await db.SellerProducts
            .AnyAsync(sp => sp.SellerId == seller.Id && sp.ProductId == productId);
        if (!owns) throw new KeyNotFoundException("Ürün bulunamadı.");

        return await SaveImageFileAsync(productId, imageBase64, mimeType, webRootPath);
    }

    private static async Task<string> SaveImageFileAsync(string productId, string imageBase64, string mimeType, string webRootPath)
    {
        var ext = mimeType.Contains("png") ? "png" : "jpg";
        var fileName = $"{productId}_{Guid.NewGuid():N}.{ext}";
        var imagesDir = Path.Combine(webRootPath, "images", "products");
        Directory.CreateDirectory(imagesDir);
        var filePath = Path.Combine(imagesDir, fileName);
        var imageBytes = Convert.FromBase64String(imageBase64);
        await File.WriteAllBytesAsync(filePath, imageBytes);
        return $"/images/products/{fileName}";
    }

    public async Task<SocialMediaContentDto> GenerateSocialContentAsync(Guid userId, string productId, GenerateSocialContentRequest req)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var sp = await db.SellerProducts
            .FirstOrDefaultAsync(sp => sp.SellerId == seller.Id && sp.ProductId == productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var product = await db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var tone = NormalizeTone(req.Tone);
        var purpose = NormalizePurpose(req.Purpose);
        var platforms = NormalizePlatforms(req.Platforms);
        var fallback = BuildFallbackSocialContent(product.Title, product.Category?.Name ?? "Ürün", product.Price, tone, purpose, platforms);

        var existing = await db.SocialMediaContents
            .FirstOrDefaultAsync(s => s.SellerId == seller.Id && s.ProductId == productId && s.Tone == tone);

        if (existing is null)
        {
            existing = new ZekAI.Domain.Entities.SocialMediaContent
            {
                SellerId = seller.Id,
                ProductId = productId,
                Tone = tone,
            };
            db.SocialMediaContents.Add(existing);
        }

        existing.InstagramContent = fallback.Instagram is null ? "" : JsonSerializer.Serialize(fallback.Instagram);
        existing.TiktokScriptJson = fallback.Tiktok is null ? "" : JsonSerializer.Serialize(fallback.Tiktok);
        existing.TwitterContent = fallback.Twitter is null ? "" : JsonSerializer.Serialize(fallback.Twitter);
        existing.GeneratedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return new SocialMediaContentDto(tone, purpose, platforms, fallback.Instagram, fallback.Tiktok, fallback.Twitter, existing.GeneratedAt);
    }

    public async Task<SocialMediaContentDto> SaveSocialContentAsync(Guid userId, string productId, SaveSocialContentRequest req)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var sellerProduct = await db.SellerProducts
            .Where(sp => sp.SellerId == seller.Id && sp.ProductId == productId)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var existing = await db.SocialMediaContents
            .FirstOrDefaultAsync(s => s.SellerId == seller.Id && s.ProductId == productId && s.Tone == req.Tone);

        if (existing is null)
        {
            existing = new ZekAI.Domain.Entities.SocialMediaContent
            {
                SellerId = seller.Id,
                ProductId = productId,
                Tone = req.Tone,
            };
            db.SocialMediaContents.Add(existing);
        }

        var instagram = req.Instagram ?? DeserializeInstagram(existing.InstagramContent);
        var tiktok = req.Tiktok ?? DeserializeTiktok(existing.TiktokScriptJson);
        var twitter = req.Twitter ?? DeserializeTwitter(existing.TwitterContent);

        if (req.Instagram is not null)
            existing.InstagramContent = JsonSerializer.Serialize(req.Instagram);
        if (req.Tiktok is not null)
            existing.TiktokScriptJson = JsonSerializer.Serialize(req.Tiktok);
        if (req.Twitter is not null)
            existing.TwitterContent = JsonSerializer.Serialize(req.Twitter);
        existing.GeneratedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        var platforms = NormalizePlatforms(req.Platforms);
        if (req.Platforms.Count == 0)
        {
            platforms = [];
            if (instagram is not null) platforms.Add("instagram");
            if (tiktok is not null) platforms.Add("tiktok");
            if (twitter is not null) platforms.Add("twitter");
        }

        return new SocialMediaContentDto(
            NormalizeTone(req.Tone),
            NormalizePurpose(req.Purpose),
            platforms,
            instagram,
            tiktok,
            twitter,
            existing.GeneratedAt);
    }

    private static string NormalizeTone(string? tone)
    {
        var value = string.IsNullOrWhiteSpace(tone) ? "samimi" : tone.Trim().ToLowerInvariant();
        return value is "profesyonel" or "samimi" or "mizahi" ? value : "samimi";
    }

    private static string NormalizePurpose(string? purpose)
    {
        var value = string.IsNullOrWhiteSpace(purpose) ? "guven" : purpose.Trim().ToLowerInvariant();
        return value is "satis" or "guven" or "tanitim" ? value : "guven";
    }

    private static List<string> NormalizePlatforms(List<string>? platforms)
    {
        var result = new List<string>();
        foreach (var raw in platforms ?? [])
        {
            var key = raw.Trim().ToLowerInvariant();
            if (key is "x") key = "twitter";
            if ((key is "instagram" or "tiktok" or "twitter") && !result.Contains(key))
                result.Add(key);
        }
        return result.Count > 0 ? result : ["instagram"];
    }

    private static SocialMediaContentDto BuildFallbackSocialContent(
        string title,
        string category,
        decimal price,
        string tone,
        string purpose,
        List<string> platforms)
    {
        var priceText = price.ToString("N0");
        SocialInstagramContentDto? instagram = null;
        SocialTiktokContentDto? tiktok = null;
        SocialTwitterContentDto? twitter = null;

        if (platforms.Contains("instagram"))
        {
            instagram = new SocialInstagramContentDto(
                $"{title} ile ihtiyacına güvenilir bir çözüm ekle.\n\n{category} kategorisinde pratik kullanım, net fayda ve hızlı teslimat bir arada. ₺{priceText} fiyatıyla mağazada seni bekliyor.",
                ["#alışveriş", "#kalite", "#güvenlialışveriş", $"#{category.Replace(" ", "")}", "#zekai"],
                "Ürünü şimdi incele.",
                "Her An Yanınızda, Her An Güvende"
            );
        }

        if (platforms.Contains("tiktok"))
        {
            tiktok = new SocialTiktokContentDto(
                "Bu ürünü görünce alışveriş listen değişebilir.",
                [
                    new SocialTiktokSceneDto("Sahne 1", $"{title} yakın planda gösterilir ve ihtiyaç hızlıca kurulur."),
                    new SocialTiktokSceneDto("Sahne 2", $"{category} kullanım senaryosunda ürünün ana faydası anlatılır."),
                    new SocialTiktokSceneDto("Sahne 3", $"₺{priceText} fiyat, stok ve inceleme çağrısı ile kapanış yapılır."),
                ],
                $"{title} ile günlük ihtiyacına pratik bir çözüm ekle. Ürünü incele, kararını rahat ver.",
                ["#ZekAI", "#Ürünİncelemesi", "#AkıllıAlışveriş", $"#{category.Replace(" ", "")}"]
            );
        }

        if (platforms.Contains("twitter"))
        {
            twitter = new SocialTwitterContentDto(
                $"{title} şimdi ₺{priceText}. {category} kategorisinde net fayda, pratik kullanım ve güvenli alışveriş deneyimi arayanlar için.",
                ["#alışveriş", "#fırsat"],
                "Ürünü incele"
            );
        }

        return new SocialMediaContentDto(tone, purpose, platforms, instagram, tiktok, twitter, DateTime.UtcNow);
    }

    private static SocialInstagramContentDto? DeserializeInstagram(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            var parsed = JsonSerializer.Deserialize<SocialInstagramContentDto>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (parsed is not null) return parsed;
        }
        catch (JsonException) { }

        var lines = json.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var hashtags = lines.Where(l => l.StartsWith('#')).SelectMany(l => l.Split(' ', StringSplitOptions.RemoveEmptyEntries)).ToList();
        var caption = string.Join("\n", lines.Where(l => !l.StartsWith('#')));
        return new SocialInstagramContentDto(caption, hashtags, "Ürünü şimdi incele.", "");
    }

    private static SocialTiktokContentDto? DeserializeTiktok(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            var parsed = JsonSerializer.Deserialize<SocialTiktokContentDto>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (parsed is not null) return parsed;
        }
        catch (JsonException) { }

        try
        {
            using var doc = JsonDocument.Parse(json);
            if (doc.RootElement.ValueKind != JsonValueKind.Array) return null;
            var scenes = doc.RootElement.EnumerateArray()
                .Select((e, index) => new SocialTiktokSceneDto(
                    e.TryGetProperty("time", out var time) ? time.GetString() ?? $"Sahne {index + 1}" : $"Sahne {index + 1}",
                    e.TryGetProperty("text", out var text) ? text.GetString() ?? "" : ""))
                .ToList();
            return new SocialTiktokContentDto(scenes.FirstOrDefault()?.Description ?? "", scenes, "", []);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static SocialTwitterContentDto? DeserializeTwitter(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            var parsed = JsonSerializer.Deserialize<SocialTwitterContentDto>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (parsed is not null) return parsed;
        }
        catch (JsonException) { }

        return new SocialTwitterContentDto(json, [], "Ürünü incele");
    }

    public async Task<List<ProductBundleDto>> GetBundlesAsync(Guid userId, string productId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        await EnsureSellerProductAsync(seller.Id, productId);

        var bundles = await db.ProductBundles
            .Where(b => b.SellerId == seller.Id && b.PrimaryProductId == productId && b.Status != ProductBundleStatus.Archived)
            .Include(b => b.PrimaryProduct).ThenInclude(p => p!.Images)
            .Include(b => b.PrimaryProduct).ThenInclude(p => p!.Category)
            .Include(b => b.ComplementaryProduct).ThenInclude(p => p!.Images)
            .Include(b => b.ComplementaryProduct).ThenInclude(p => p!.Category)
            .OrderByDescending(b => b.UpdatedAt)
            .ToListAsync();

        return bundles.Select(MapBundle).ToList();
    }

    public async Task<BundleRecommendationResponse> GenerateBundleRecommendationsAsync(Guid userId, string productId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var primarySp = await db.SellerProducts
            .Where(sp => sp.SellerId == seller.Id && sp.ProductId == productId)
            .Include(sp => sp.Product).ThenInclude(p => p!.Images)
            .Include(sp => sp.Product).ThenInclude(p => p!.Category)
            .Include(sp => sp.Product).ThenInclude(p => p!.Reviews)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Urun bulunamadi.");

        var primary = primarySp.Product!;
        var candidates = await db.SellerProducts
            .Where(sp => sp.SellerId == seller.Id &&
                         sp.ProductId != productId &&
                         sp.IsPublished &&
                         sp.Product!.Stock > 0)
            .Include(sp => sp.Product).ThenInclude(p => p!.Images)
            .Include(sp => sp.Product).ThenInclude(p => p!.Category)
            .Include(sp => sp.Product).ThenInclude(p => p!.Reviews)
            .Select(sp => sp.Product!)
            .ToListAsync();

        var recommendations = candidates
            .Select(candidate => BuildRecommendation(primary, candidate))
            .Where(r => r.Score >= 30)
            .OrderByDescending(r => r.Score)
            .Take(3)
            .ToList();

        MissingBundleOpportunityDto? missing = recommendations.Count == 0
            ? new MissingBundleOpportunityDto(
                "Eksik Firsat",
                "Bu urunle birlikte satilabilecek uygun tamamlayici urun magazada bulunamadi.",
                BuildMissingIdeas(primary.Category?.Slug ?? ""))
            : null;

        return new BundleRecommendationResponse(recommendations, missing);
    }

    public async Task<ProductBundleDto> CreateBundleAsync(Guid userId, string productId, CreateProductBundleRequest req)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var (primary, complementary) = await ValidateBundleProductsAsync(seller.Id, productId, req.ComplementaryProductId);
        ValidateDiscount(req.DiscountPercent);

        var duplicate = await db.ProductBundles.AnyAsync(b =>
            b.SellerId == seller.Id &&
            b.PrimaryProductId == productId &&
            b.ComplementaryProductId == req.ComplementaryProductId &&
            b.Status != ProductBundleStatus.Archived);
        if (duplicate) throw new InvalidOperationException("Bu urunler icin aktif bir paket zaten var.");

        var bundle = new ProductBundle
        {
            SellerId = seller.Id,
            PrimaryProductId = productId,
            ComplementaryProductId = req.ComplementaryProductId,
            Title = string.IsNullOrWhiteSpace(req.Title) ? $"{primary.Brand} + {complementary.Brand} Paketi" : req.Title.Trim(),
            ShortDescription = req.ShortDescription.Trim(),
            CampaignText = req.CampaignText.Trim(),
            CtaLabel = string.IsNullOrWhiteSpace(req.CtaLabel) ? "Paketi Sepete Ekle" : req.CtaLabel.Trim(),
            DiscountPercent = req.DiscountPercent,
            RecommendationReason = req.RecommendationReason.Trim(),
            Score = req.Score,
            Status = req.Publish ? ProductBundleStatus.Published : ProductBundleStatus.Draft,
            PublishedAt = req.Publish ? DateTime.UtcNow : null,
        };

        if (req.Publish)
            EnsurePublishable(primary, complementary);

        db.ProductBundles.Add(bundle);
        await db.SaveChangesAsync();

        return await GetBundleByIdAsync(seller.Id, productId, bundle.Id);
    }

    public async Task<ProductBundleDto> UpdateBundleAsync(Guid userId, string productId, Guid bundleId, UpdateProductBundleRequest req)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var bundle = await GetOwnedBundleEntityAsync(seller.Id, productId, bundleId);

        if (req.DiscountPercent.HasValue)
        {
            ValidateDiscount(req.DiscountPercent.Value);
            bundle.DiscountPercent = req.DiscountPercent.Value;
        }
        if (req.Title is not null) bundle.Title = req.Title.Trim();
        if (req.ShortDescription is not null) bundle.ShortDescription = req.ShortDescription.Trim();
        if (req.CampaignText is not null) bundle.CampaignText = req.CampaignText.Trim();
        if (req.CtaLabel is not null) bundle.CtaLabel = string.IsNullOrWhiteSpace(req.CtaLabel) ? "Paketi Sepete Ekle" : req.CtaLabel.Trim();
        bundle.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return await GetBundleByIdAsync(seller.Id, productId, bundleId);
    }

    public async Task<ProductBundleDto> PublishBundleAsync(Guid userId, string productId, Guid bundleId, bool published)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var bundle = await GetOwnedBundleEntityAsync(seller.Id, productId, bundleId);
        var (primary, complementary) = await ValidateBundleProductsAsync(seller.Id, bundle.PrimaryProductId, bundle.ComplementaryProductId);

        if (published)
        {
            EnsurePublishable(primary, complementary);
            bundle.Status = ProductBundleStatus.Published;
            bundle.PublishedAt = DateTime.UtcNow;
            bundle.ArchivedAt = null;
        }
        else
        {
            bundle.Status = ProductBundleStatus.Draft;
            bundle.PublishedAt = null;
        }
        bundle.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return await GetBundleByIdAsync(seller.Id, productId, bundleId);
    }

    public async Task ArchiveBundleAsync(Guid userId, string productId, Guid bundleId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var bundle = await GetOwnedBundleEntityAsync(seller.Id, productId, bundleId);
        bundle.Status = ProductBundleStatus.Archived;
        bundle.ArchivedAt = DateTime.UtcNow;
        bundle.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    private async Task<ProductBundleDto> GetBundleByIdAsync(Guid sellerId, string productId, Guid bundleId)
    {
        var bundle = await db.ProductBundles
            .Where(b => b.SellerId == sellerId && b.PrimaryProductId == productId && b.Id == bundleId)
            .Include(b => b.PrimaryProduct).ThenInclude(p => p!.Images)
            .Include(b => b.PrimaryProduct).ThenInclude(p => p!.Category)
            .Include(b => b.ComplementaryProduct).ThenInclude(p => p!.Images)
            .Include(b => b.ComplementaryProduct).ThenInclude(p => p!.Category)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Paket bulunamadi.");
        return MapBundle(bundle);
    }

    private async Task<ProductBundle> GetOwnedBundleEntityAsync(Guid sellerId, string productId, Guid bundleId)
    {
        return await db.ProductBundles
            .FirstOrDefaultAsync(b => b.SellerId == sellerId && b.PrimaryProductId == productId && b.Id == bundleId && b.Status != ProductBundleStatus.Archived)
            ?? throw new KeyNotFoundException("Paket bulunamadi.");
    }

    private async Task EnsureSellerProductAsync(Guid sellerId, string productId)
    {
        if (!await db.SellerProducts.AnyAsync(sp => sp.SellerId == sellerId && sp.ProductId == productId))
            throw new KeyNotFoundException("Urun bulunamadi.");
    }

    private async Task<(Product Primary, Product Complementary)> ValidateBundleProductsAsync(Guid sellerId, string primaryProductId, string complementaryProductId)
    {
        if (primaryProductId == complementaryProductId)
            throw new InvalidOperationException("Ana urun ve tamamlayici urun ayni olamaz.");

        var products = await db.SellerProducts
            .Where(sp => sp.SellerId == sellerId && (sp.ProductId == primaryProductId || sp.ProductId == complementaryProductId))
            .Include(sp => sp.Product).ThenInclude(p => p!.Images)
            .Include(sp => sp.Product).ThenInclude(p => p!.Category)
            .ToListAsync();

        var primary = products.FirstOrDefault(sp => sp.ProductId == primaryProductId)?.Product
            ?? throw new KeyNotFoundException("Ana urun bulunamadi.");
        var complementarySp = products.FirstOrDefault(sp => sp.ProductId == complementaryProductId)
            ?? throw new KeyNotFoundException("Tamamlayici urun bulunamadi.");
        var complementary = complementarySp.Product!;

        if (complementary.Stock <= 0)
            throw new InvalidOperationException("Tamamlayici urun stokta yok.");

        return (primary, complementary);
    }

    private static void ValidateDiscount(decimal discountPercent)
    {
        if (discountPercent < 0 || discountPercent > 50)
            throw new InvalidOperationException("Indirim yuzdesi 0 ile 50 arasinda olmalidir.");
    }

    private static void EnsurePublishable(Product primary, Product complementary)
    {
        if (primary.Stock <= 0 || complementary.Stock <= 0)
            throw new InvalidOperationException("Stokta olmayan urunler yayina alinamaz.");
    }

    private static ProductBundleDto MapBundle(ProductBundle bundle)
    {
        var originalTotal = bundle.PrimaryProduct!.Price + bundle.ComplementaryProduct!.Price;
        var discountAmount = Math.Round(originalTotal * bundle.DiscountPercent / 100, 2);
        return new ProductBundleDto(
            bundle.Id,
            bundle.Title,
            bundle.ShortDescription,
            bundle.CampaignText,
            bundle.CtaLabel,
            bundle.DiscountPercent,
            bundle.Status.ToString(),
            bundle.RecommendationReason,
            bundle.Score,
            MapBundleProduct(bundle.PrimaryProduct),
            MapBundleProduct(bundle.ComplementaryProduct),
            originalTotal,
            discountAmount,
            originalTotal - discountAmount,
            bundle.CreatedAt,
            bundle.UpdatedAt,
            bundle.PublishedAt
        );
    }

    private static BundleProductDto MapBundleProduct(Product product) => new(
        product.Id,
        product.Title,
        product.Brand,
        product.Category?.Name ?? "",
        product.Price,
        product.Stock,
        product.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
            ?? product.Images.Select(i => i.Url).FirstOrDefault() ?? ""
    );

    private static BundleRecommendationDto BuildRecommendation(Product primary, Product candidate)
    {
        var score = ScoreRecommendation(primary, candidate);
        var originalTotal = primary.Price + candidate.Price;
        var discountPercent = 5m;
        var discountAmount = Math.Round(originalTotal * discountPercent / 100, 2);
        var title = $"{BuildShortName(primary)} + {BuildShortName(candidate)} Paketi";
        var reason = BuildReason(primary, candidate);
        return new BundleRecommendationDto(
            MapBundleProduct(primary),
            MapBundleProduct(candidate),
            title,
            $"{BuildShortName(primary)} urununu {BuildShortName(candidate)} ile tamamla.",
            "Ikisini birlikte al, sepette %5 avantaj yakala.",
            "Paketi Sepete Ekle",
            discountPercent,
            reason,
            score,
            originalTotal,
            discountAmount,
            originalTotal - discountAmount
        );
    }

    private static int ScoreRecommendation(Product primary, Product candidate)
    {
        var score = CategoryComplementScore(primary.Category?.Slug ?? "", candidate.Category?.Slug ?? "");
        score += KeywordOverlapScore(primary, candidate);
        score += PriceRatioScore(primary.Price, candidate.Price);
        score += Math.Min(10, candidate.Stock / 5 + 2);
        var rating = candidate.Reviews.Any() ? candidate.Reviews.Average(r => r.Rating) : candidate.Rating;
        score += Math.Min(15, (int)Math.Round(rating * 2 + Math.Min(5, candidate.Reviews.Count / 10.0)));
        score += DemoBoost(primary.Id, candidate.Id);
        return Math.Min(100, score);
    }

    private static int CategoryComplementScore(string primarySlug, string candidateSlug)
    {
        if (primarySlug == "elektronik" && candidateSlug is "aksesuar" or "elektronik") return 35;
        if (primarySlug == "aksesuar" && candidateSlug is "elektronik" or "spor-outdoor") return 30;
        if (primarySlug == "mutfak" && candidateSlug == "mutfak") return 35;
        if (primarySlug == "ev-yasam" && candidateSlug == "ev-yasam") return 30;
        if (primarySlug == "spor-outdoor" && candidateSlug is "elektronik" or "aksesuar") return 35;
        return primarySlug == candidateSlug ? 20 : 8;
    }

    private static int KeywordOverlapScore(Product primary, Product candidate)
    {
        var a = Tokenize($"{primary.Title} {primary.ShortDescription} {primary.FeaturesJson}");
        var b = Tokenize($"{candidate.Title} {candidate.ShortDescription} {candidate.FeaturesJson}");
        if (a.Count == 0 || b.Count == 0) return 0;
        var overlap = a.Intersect(b).Count();
        return Math.Min(15, overlap * 5);
    }

    private static HashSet<string> Tokenize(string text)
    {
        var normalized = text.ToLowerInvariant()
            .Replace("ı", "i").Replace("ğ", "g").Replace("ü", "u")
            .Replace("ş", "s").Replace("ö", "o").Replace("ç", "c");
        return System.Text.RegularExpressions.Regex
            .Split(normalized, @"[^a-z0-9]+")
            .Where(t => t.Length > 3)
            .ToHashSet();
    }

    private static int PriceRatioScore(decimal primaryPrice, decimal candidatePrice)
    {
        if (primaryPrice <= 0) return 0;
        var ratio = candidatePrice / primaryPrice;
        if (ratio <= 0.75m) return 20;
        if (ratio <= 1.25m) return 15;
        if (ratio <= 2.0m) return 8;
        return 2;
    }

    private static int DemoBoost(string primaryId, string candidateId)
    {
        var pair = $"{primaryId}|{candidateId}";
        return pair switch
        {
            "bluetooth-kulaklik-pro-x1|telefon-kilifi-magsafe" => 20,
            "bluetooth-kulaklik-pro-x1|usb-c-hub-pro" => 18,
            "akilli-saat-fit-neo|telefon-kilifi-magsafe" => 20,
            "kahve-degirmeni-burr|mutfak-robotu-compact" => 20,
            "masa-lambasi-led|ergonomik-calisma-sandalyesi" => 20,
            _ => 0
        };
    }

    private static string BuildReason(Product primary, Product candidate)
    {
        return $"{candidate.Category?.Name ?? "Tamamlayici urun"} kategorisi {primary.Category?.Name ?? "ana urun"} ile birlikte sepet degerini artirabilir.";
    }

    private static string BuildShortName(Product product)
    {
        return string.IsNullOrWhiteSpace(product.Brand) ? product.Title.Split(' ')[0] : product.Brand;
    }

    private static List<string> BuildMissingIdeas(string primarySlug)
    {
        return primarySlug switch
        {
            "spor-outdoor" => ["Spor corap", "Ayakkabi bakim spreyi", "Spor cantasi", "Tabanlik"],
            "elektronik" => ["Koruyucu kilif", "USB-C kablo", "Sarj adaptoru", "Stand"],
            "mutfak" => ["Olcu kasigi", "Saklama kabi", "Temizlik fircasi", "Kahve filtresi"],
            "ev-yasam" => ["Yedek ampul", "Kablo duzenleyici", "Masa organizeri", "Temizlik seti"],
            _ => ["Tamamlayici aksesuar", "Bakim urunu", "Yedek parca", "Hediye paketi"]
        };
    }

    private static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant()
            .Replace("ş", "s").Replace("ğ", "g").Replace("ü", "u")
            .Replace("ö", "o").Replace("ı", "i").Replace("ç", "c")
            .Replace(" ", "-");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\-]", "");
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-").Trim('-');
        return slug.Length > 60 ? slug[..60] : slug;
    }
}
