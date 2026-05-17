using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs.Buyer;
using ZekAI.Domain.Entities;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Infrastructure.Services;

public class FavoriteService(AppDbContext db)
{
    public async Task<List<FavoriteItemDto>> GetFavoritesAsync(Guid userId)
    {
        var favorites = await db.Favorites
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.AddedAt)
            .ToListAsync();

        var productIds = favorites.Select(f => f.ProductId).ToList();
        var products = await db.Products
            .Where(p => productIds.Contains(p.Id))
            .Include(p => p.Images)
            .ToDictionaryAsync(p => p.Id);

        return favorites
            .Where(f => products.ContainsKey(f.ProductId))
            .Select(f =>
            {
                var p = products[f.ProductId];
                var image = p.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
                            ?? p.Images.Select(i => i.Url).FirstOrDefault() ?? "";
                return new FavoriteItemDto(p.Id, p.Title, p.Price, image, f.AddedAt);
            })
            .ToList();
    }

    public async Task AddFavoriteAsync(Guid userId, string productId)
    {
        if (!await db.Products.AnyAsync(p => p.Id == productId))
            throw new KeyNotFoundException("Ürün bulunamadı.");

        var exists = await db.Favorites.AnyAsync(f => f.UserId == userId && f.ProductId == productId);
        if (exists) return;

        db.Favorites.Add(new Favorite { UserId = userId, ProductId = productId });
        await db.SaveChangesAsync();
    }

    public async Task RemoveFavoriteAsync(Guid userId, string productId)
    {
        var fav = await db.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.ProductId == productId);
        if (fav is null) return;

        db.Favorites.Remove(fav);
        await db.SaveChangesAsync();
    }
}
