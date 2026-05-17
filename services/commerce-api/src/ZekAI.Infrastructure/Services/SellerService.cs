using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs.Seller;
using ZekAI.Domain.Entities;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Infrastructure.Services;

public class SellerService(AppDbContext db)
{
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
            FeaturesJson = "{}",
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
        db.SellerProducts.Remove(sp);
        db.Products.Remove(product);
        await db.SaveChangesAsync();
    }

    public async Task SetProductPublishedAsync(Guid userId, string productId, bool published)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var sp = await db.SellerProducts
            .FirstOrDefaultAsync(sp => sp.SellerId == seller.Id && sp.ProductId == productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

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
        if (req.Features is not null)
        {
            var dict = req.Features
                .Select((f, i) => new { Key = i.ToString(), Value = f })
                .ToDictionary(x => x.Key, x => x.Value);
            product.FeaturesJson = JsonSerializer.Serialize(dict);
        }
        if (req.Price.HasValue) product.Price = req.Price.Value;
        if (req.Stock.HasValue) product.Stock = req.Stock.Value;
        product.UpdatedAt = DateTime.UtcNow;
        sp.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
    }

    public async Task<SocialMediaContentDto> GenerateSocialContentAsync(Guid userId, string productId, string tone)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var sp = await db.SellerProducts
            .FirstOrDefaultAsync(sp => sp.SellerId == seller.Id && sp.ProductId == productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var product = await db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var title = product.Title;
        var category = product.Category?.Name ?? "Ürün";
        var price = product.Price.ToString("N0");

        var (instagram, tiktokJson, twitter) = tone switch
        {
            "profesyonel" => (
                $"{title} ile farkı hissedin.\n\n{category} kategorisinde üstün kalite ve güvenilir performans. " +
                $"Her detayda mükemmellik arayan profesyoneller için.\n\n" +
                $"₺{price} · Ücretsiz Kargo · Hızlı Teslimat\n\n#Profesyonel #Kalite #{category.Replace(" ", "")}",
                JsonSerializer.Serialize(new[]
                {
                    new { time = "00:00-00:03", text = $"{title} — profesyonel seçim." },
                    new { time = "00:03-00:08", text = $"Üstün kalite, güvenilir performans." },
                    new { time = "00:08-00:15", text = $"₺{price} ile şimdi sahip ol. Link bio'da." },
                }),
                $"{title} — {category} kategorisinde profesyonel tercih. " +
                $"Kalite ve performansta taviz yok. ₺{price} · Ücretsiz Kargo"
            ),
            "mizahi" => (
                $"Bunu almazsanız pişman olursunuz (söz!) 😅\n\n{title} kapınıza kadar gelsin, " +
                $"siz sadece unboxing videosunu çekin 🎉\n\n" +
                $"₺{price} · Kargo bizden · Gülümseme garantili 😄\n\n#{category.Replace(" ", "")} #AlışverişKeyfi #ÜcretsizKargo",
                JsonSerializer.Serialize(new[]
                {
                    new { time = "00:00-00:03", text = $"Bunu görünce duramadım 😂" },
                    new { time = "00:03-00:08", text = $"{title} — {category} dünyasını değiştirir!" },
                    new { time = "00:08-00:15", text = $"₺{price} mi? Yani bu bir şaka mı? 😅 Al gitsin!" },
                }),
                $"Fiyatı görünce ben de şaşırdım 😂 {title} sadece ₺{price}! " +
                $"Hızlı ol, stok bitmeden kapısından gir 🏃‍♂️ #{category.Replace(" ", "")}"
            ),
            _ => (
                $"{title} ile hayatın kolaylaşsın 💫\n\n{category} kategorisinde seni bekleyen " +
                $"bu harika ürünü keşfet. Kaliteli, uygun fiyatlı ve hızlı teslimat!\n\n" +
                $"₺{price} · Ücretsiz Kargo\n\n#{category.Replace(" ", "")} #ÜcretsizKargo #AkıllıAlışveriş",
                JsonSerializer.Serialize(new[]
                {
                    new { time = "00:00-00:03", text = $"Merhaba! Sana harika bir ürün tanıtacağım 🎉" },
                    new { time = "00:03-00:08", text = $"{title} — kaliteli, uygun fiyatlı!" },
                    new { time = "00:08-00:15", text = $"₺{price} ile hemen sipariş ver, ücretsiz kargo!" },
                }),
                $"Aradığın ürünü buldun! {title} ile {category.ToLower()} deneyimini yükselt. " +
                $"₺{price} + ücretsiz kargo 🚀 #{category.Replace(" ", "")}"
            )
        };

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

        existing.InstagramContent = instagram;
        existing.TiktokScriptJson = tiktokJson;
        existing.TwitterContent = twitter;
        existing.GeneratedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        var scenes = JsonSerializer.Deserialize<List<JsonElement>>(tiktokJson)!
            .Select(e => new TiktokScene(e.GetProperty("time").GetString()!, e.GetProperty("text").GetString()!))
            .ToList();

        return new SocialMediaContentDto(tone, instagram, scenes, twitter, existing.GeneratedAt);
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
