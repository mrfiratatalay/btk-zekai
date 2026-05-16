using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs.Products;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Infrastructure.Services;

public class ProductService(AppDbContext db)
{
    public async Task<List<ProductListDto>> GetAllAsync(string? category = null, string? search = null)
    {
        var query = db.Products
            .Include(p => p.Images)
            .Include(p => p.Category)
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
            p.Rating,
            p.ReviewCount,
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
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p is null) return null;

        var features = JsonSerializer.Deserialize<Dictionary<string, string>>(p.FeaturesJson) ?? [];
        var badges = JsonSerializer.Deserialize<List<string>>(p.BadgesJson) ?? [];

        return new ProductDetailDto(
            p.Id, p.Title, p.Brand, p.SellerName,
            p.Category?.Name ?? "",
            p.Price, p.OriginalPrice,
            p.Rating, p.ReviewCount, p.Stock,
            p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
            p.ShortDescription, p.Description,
            features, badges, p.CargoText, p.UpdatedAt
        );
    }

    public async Task<List<ProductReviewDto>> GetReviewsAsync(string productId)
    {
        return await db.ProductReviews
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.HelpfulCount)
            .Select(r => new ProductReviewDto(
                r.Id, r.Rating, r.Title, r.Text,
                r.VerifiedPurchase, r.Date, r.HelpfulCount,
                JsonSerializer.Deserialize<List<string>>(r.TagsJson) ?? new()
            )).ToListAsync();
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
        // Desteklenen formatlar:
        // /product/{id}  veya  /urun/{id}  veya  /products/{id}
        var match = System.Text.RegularExpressions.Regex.Match(
            url, @"/(?:product|urun|products)/([^/?#]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        if (!match.Success) return null;
        var id = Uri.UnescapeDataString(match.Groups[1].Value);
        return await GetByIdAsync(id);
    }
}
