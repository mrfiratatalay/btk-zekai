using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs.Products;
using ZekAI.Domain.Entities;
using ZekAI.Domain.Entities;
using ZekAI.Domain.Enums;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Infrastructure.Services;

public class ProductService(AppDbContext db)
{
    public async Task<List<ProductListDto>> GetAllAsync(string? category = null, string? search = null)
    {
        var query = db.Products
            .Include(p => p.Images)
            .Include(p => p.Category)
            .Include(p => p.Reviews)
            .Where(p => p.SellerProduct != null && p.SellerProduct.IsPublished)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category!.Slug == category);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Title.ToLower().Contains(search.ToLower()));

        return await query.Select(p => new ProductListDto(
            p.Id,
            p.Title,
            p.Brand,
            p.SellerName,
            p.Category!.Name,
            p.Price,
            p.OriginalPrice,
            p.Reviews.Any() ? Math.Round(p.Reviews.Average(r => (double)r.Rating), 1) : 0.0,
            p.Reviews.Count,
            p.Stock,
            p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault() ?? "",
            p.ShortDescription,
            p.CargoText
        )).ToListAsync();
    }

    public async Task<ProductDetailDto?> GetByIdAsync(string id)
    {
        var p = await db.Products
            .Include(p => p.Images)
            .Include(p => p.Category)
            .Include(p => p.Reviews)
            .Include(p => p.SellerProduct)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p is null) return null;
        // Yayınlanmamış ürünler storefront'ta görünmez; satıcı önizleme ProductsController içinde ayrı yol kullanır.
        if (p.SellerProduct is null || !p.SellerProduct.IsPublished) return null;

        var features = JsonSerializer.Deserialize<Dictionary<string, string>>(p.FeaturesJson) ?? [];
        var badges = JsonSerializer.Deserialize<List<string>>(p.BadgesJson) ?? [];

        var rating = p.Reviews.Any() ? Math.Round(p.Reviews.Average(r => (double)r.Rating), 1) : 0.0;
        var reviewCount = p.Reviews.Count;

        return new ProductDetailDto(
            p.Id, p.Title, p.Brand, p.SellerName,
            p.Category?.Name ?? "",
            p.Price, p.OriginalPrice,
            rating, reviewCount, p.Stock,
            p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
            p.ShortDescription, p.Description,
            features, badges, p.CargoText, p.UpdatedAt
        );
    }

    public async Task<List<ProductReviewDto>> GetReviewsAsync(string productId)
    {
        var rawReviews = await db.ProductReviews
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.HelpfulCount)
            .ToListAsync();

        var reviewIds = rawReviews.Select(r => r.Id).ToList();
        var replies = await db.ReviewReplies
            .Where(rr => reviewIds.Contains(rr.ReviewId))
            .ToDictionaryAsync(rr => rr.ReviewId, rr => rr.ReplyText);

        return rawReviews.Select(r => new ProductReviewDto(
            r.Id, r.AuthorName, r.Rating, r.Title, r.Text,
            r.VerifiedPurchase, r.Date, r.HelpfulCount,
            JsonSerializer.Deserialize<List<string>>(r.TagsJson) ?? new(),
            replies.TryGetValue(r.Id, out var reply) ? reply : null
        )).ToList();
    }

    public async Task<ProductReviewDto> CreateReviewAsync(string productId, Guid userId, CreateProductReviewRequest req)
    {
        if (!await db.Products.AnyAsync(p => p.Id == productId))
            throw new KeyNotFoundException("Ürün bulunamadı.");

        var isProductOwner = await db.SellerProducts
            .AnyAsync(sp => sp.ProductId == productId && sp.Seller!.UserId == userId);
        if (isProductOwner)
            throw new InvalidOperationException("Kendi ürününüze yorum yapamazsınız.");

        if (await db.ProductReviews.AnyAsync(r => r.ProductId == productId && r.UserId == userId))
            throw new InvalidOperationException("Bu ürün için zaten bir yorum yaptınız.");

        var user = await db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        var verifiedPurchase = await db.Orders
            .AnyAsync(o => o.BuyerId == userId &&
                           o.Items.Any(i => i.ProductId == productId));

        var tagsJson = JsonSerializer.Serialize(req.Tags ?? []);

        var review = new ZekAI.Domain.Entities.ProductReview
        {
            ProductId = productId,
            UserId = userId,
            AuthorName = user.FullName,
            Rating = Math.Clamp(req.Rating, 1, 5),
            Title = req.Title.Trim(),
            Text = req.Text.Trim(),
            VerifiedPurchase = verifiedPurchase,
            Date = DateTime.UtcNow,
            HelpfulCount = 0,
            TagsJson = tagsJson,
        };

        db.ProductReviews.Add(review);
        await db.SaveChangesAsync();

        return new ProductReviewDto(
            review.Id, review.AuthorName, review.Rating, review.Title, review.Text,
            review.VerifiedPurchase, review.Date, review.HelpfulCount,
            req.Tags ?? []
        );
    }

    public async Task<List<ProductFaqDto>> GetPublicFaqsAsync(string productId)
    {
        return await db.ProductFaqs
            .Where(f => f.ProductId == productId)
            .OrderBy(f => f.SortOrder).ThenBy(f => f.CreatedAt)
            .Select(f => new ProductFaqDto(f.Id, f.Question, f.Answer, f.CategoryTag, f.SortOrder, f.CreatedAt))
            .ToListAsync();
    }

    public async Task<List<PriceHistoryDto>> GetPriceHistoryAsync(string productId)
    {
        return await db.ProductPriceHistories
            .Where(h => h.ProductId == productId)
            .OrderBy(h => h.Id)
            .Select(h => new PriceHistoryDto(h.Day, h.Price, h.MarketMedian))
            .ToListAsync();
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync()
    {
        return await db.Categories
            .Select(c => new CategoryDto(c.Id, c.Name, c.Slug))
            .ToListAsync();
    }

    public async Task<ProductDetailDto?> GetByUrlAsync(string url)
    {
        var match = System.Text.RegularExpressions.Regex.Match(
            url, @"/(?:product|urun|products)/([^/?#]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        if (!match.Success) return null;
        var id = Uri.UnescapeDataString(match.Groups[1].Value);
        return await GetByIdAsync(id);
    }

    public async Task<List<PublicProductBundleDto>> GetPublishedBundlesAsync(string productId)
    {
        var bundles = await db.ProductBundles
            .Where(b => b.PrimaryProductId == productId && b.Status == ProductBundleStatus.Published)
            .Include(b => b.PrimaryProduct).ThenInclude(p => p!.Images)
            .Include(b => b.PrimaryProduct).ThenInclude(p => p!.Category)
            .Include(b => b.PrimaryProduct).ThenInclude(p => p!.SellerProduct)
            .Include(b => b.ComplementaryProduct).ThenInclude(p => p!.Images)
            .Include(b => b.ComplementaryProduct).ThenInclude(p => p!.Category)
            .Include(b => b.ComplementaryProduct).ThenInclude(p => p!.SellerProduct)
            .OrderByDescending(b => b.Score)
            .ToListAsync();

        return bundles
            .Where(IsPublicBundleVisible)
            .Select(MapPublicBundle)
            .ToList();
    }

    private static bool IsPublicBundleVisible(ProductBundle bundle)
    {
        return bundle.PrimaryProduct is not null &&
               bundle.ComplementaryProduct is not null &&
               bundle.PrimaryProduct.Stock > 0 &&
               bundle.ComplementaryProduct.Stock > 0 &&
               bundle.PrimaryProduct.SellerProduct is not null &&
               bundle.PrimaryProduct.SellerProduct.IsPublished &&
               bundle.ComplementaryProduct.SellerProduct is not null &&
               bundle.ComplementaryProduct.SellerProduct.IsPublished;
    }

    private static PublicProductBundleDto MapPublicBundle(ProductBundle bundle)
    {
        var originalTotal = bundle.PrimaryProduct!.Price + bundle.ComplementaryProduct!.Price;
        var discountAmount = Math.Round(originalTotal * bundle.DiscountPercent / 100, 2);
        return new PublicProductBundleDto(
            bundle.Id,
            bundle.Title,
            bundle.ShortDescription,
            bundle.CampaignText,
            bundle.CtaLabel,
            bundle.DiscountPercent,
            MapPublicBundleProduct(bundle.PrimaryProduct),
            MapPublicBundleProduct(bundle.ComplementaryProduct),
            originalTotal,
            discountAmount,
            originalTotal - discountAmount
        );
    }

    private static PublicBundleProductDto MapPublicBundleProduct(Product product) => new(
        product.Id,
        product.Title,
        product.Brand,
        product.Category?.Name ?? "",
        product.Price,
        product.Stock,
        product.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
            ?? product.Images.Select(i => i.Url).FirstOrDefault() ?? ""
    );
}
