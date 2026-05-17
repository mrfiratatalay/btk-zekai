using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs.Buyer;
using ZekAI.Domain.Entities;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Infrastructure.Services;

public class CartService(AppDbContext db)
{
    public async Task<CartDto> GetCartAsync(Guid buyerId)
    {
        var cart = await GetOrCreateCartAsync(buyerId);
        return MapCart(cart);
    }

    public async Task<CartItemDto> AddItemAsync(Guid buyerId, AddToCartRequest req)
    {
        var product = await db.Products.Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == req.ProductId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var cart = await GetOrCreateCartAsync(buyerId);

        var existing = cart.Items.FirstOrDefault(i => i.ProductId == req.ProductId);
        if (existing is not null)
        {
            existing.Quantity = Math.Min(existing.Quantity + req.Quantity, product.Stock);
            existing.Price = product.Price;
        }
        else
        {
            var item = new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                Title = product.Title,
                Price = product.Price,
                Image = product.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
                        ?? product.Images.Select(i => i.Url).FirstOrDefault() ?? "",
                Quantity = Math.Min(req.Quantity, product.Stock),
                Stock = product.Stock,
            };
            cart.Items.Add(item);
            db.CartItems.Add(item);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var updated = cart.Items.First(i => i.ProductId == req.ProductId);
        return MapItem(updated);
    }

    public async Task<CartItemDto> UpdateItemAsync(Guid buyerId, int itemId, UpdateCartItemRequest req)
    {
        var cart = await GetOrCreateCartAsync(buyerId);
        var item = cart.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new KeyNotFoundException("Sepet öğesi bulunamadı.");

        if (req.Quantity <= 0)
        {
            cart.Items.Remove(item);
            db.CartItems.Remove(item);
        }
        else
        {
            item.Quantity = Math.Min(req.Quantity, item.Stock);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return MapItem(item);
    }

    public async Task RemoveItemAsync(Guid buyerId, int itemId)
    {
        var cart = await GetOrCreateCartAsync(buyerId);
        var item = cart.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new KeyNotFoundException("Sepet öğesi bulunamadı.");

        db.CartItems.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    public async Task ClearCartAsync(Guid buyerId)
    {
        var cart = await GetOrCreateCartAsync(buyerId);
        db.CartItems.RemoveRange(cart.Items);
        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    private async Task<Cart> GetOrCreateCartAsync(Guid buyerId)
    {
        var cart = await db.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.BuyerId == buyerId);

        if (cart is null)
        {
            cart = new Cart { Id = Guid.NewGuid(), BuyerId = buyerId };
            db.Carts.Add(cart);
            await db.SaveChangesAsync();
        }

        return cart;
    }

    private static CartDto MapCart(Cart c) => new(
        c.Id,
        c.Items.Select(MapItem).ToList()
    );

    private static CartItemDto MapItem(CartItem i) => new(
        i.Id, i.ProductId, i.Title, i.Price, i.Image, i.Quantity, i.Stock
    );
}
