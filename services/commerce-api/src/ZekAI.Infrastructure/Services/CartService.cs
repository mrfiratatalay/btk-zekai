using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs.Buyer;
using ZekAI.Domain.Entities;
using ZekAI.Domain.Enums;
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
            ?? throw new KeyNotFoundException("Urun bulunamadi.");

        if (product.Stock <= 0)
            throw new InvalidOperationException("Urun stokta yok.");

        var cart = await GetOrCreateCartAsync(buyerId);
        var existing = cart.Items.FirstOrDefault(i => i.ProductId == req.ProductId && i.BundleId == null);
        if (existing is not null)
        {
            existing.Quantity = Math.Min(existing.Quantity + Math.Max(1, req.Quantity), product.Stock);
            existing.Price = product.Price;
            existing.OriginalPrice = product.Price;
            existing.DiscountAmount = 0;
        }
        else
        {
            var item = BuildCartItem(cart.Id, product, Math.Max(1, req.Quantity), null, null, product.Price, 0);
            cart.Items.Add(item);
            db.CartItems.Add(item);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return MapItem(cart.Items.First(i => i.ProductId == req.ProductId && i.BundleId == null));
    }

    public async Task<List<CartItemDto>> AddBundleAsync(Guid buyerId, Guid bundleId, int quantity)
    {
        var bundle = await GetPublishedBundleAsync(bundleId);
        var qty = Math.Max(1, quantity);

        var cart = await GetOrCreateCartAsync(buyerId);
        var existingQty = cart.Items.Where(i => i.BundleId == bundleId).Select(i => i.Quantity).DefaultIfEmpty(0).Max();
        var nextQty = existingQty + qty;
        EnsureBundleStock(bundle, nextQty);
        UpsertBundleItem(cart, bundle, bundle.PrimaryProduct!, nextQty);
        UpsertBundleItem(cart, bundle, bundle.ComplementaryProduct!, nextQty);

        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return cart.Items
            .Where(i => i.BundleId == bundleId)
            .Select(MapItem)
            .ToList();
    }

    public async Task<CartItemDto> UpdateItemAsync(Guid buyerId, int itemId, UpdateCartItemRequest req)
    {
        var cart = await GetOrCreateCartAsync(buyerId);
        var item = cart.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new KeyNotFoundException("Sepet ogesi bulunamadi.");

        if (item.BundleId is not null)
            throw new InvalidOperationException("Paket urunleri paket olarak guncellenmelidir.");

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

    public async Task<List<CartItemDto>> UpdateBundleAsync(Guid buyerId, Guid bundleId, int quantity)
    {
        var cart = await GetOrCreateCartAsync(buyerId);
        var items = cart.Items.Where(i => i.BundleId == bundleId).ToList();
        if (items.Count == 0) throw new KeyNotFoundException("Paket sepette bulunamadi.");

        if (quantity <= 0)
        {
            db.CartItems.RemoveRange(items);
            cart.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return [];
        }

        var bundle = await GetPublishedBundleAsync(bundleId);
        EnsureBundleStock(bundle, quantity);
        foreach (var item in items)
            item.Quantity = quantity;

        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return items.Select(MapItem).ToList();
    }

    public async Task RemoveItemAsync(Guid buyerId, int itemId)
    {
        var cart = await GetOrCreateCartAsync(buyerId);
        var item = cart.Items.FirstOrDefault(i => i.Id == itemId)
            ?? throw new KeyNotFoundException("Sepet ogesi bulunamadi.");

        if (item.BundleId is not null)
        {
            var bundleItems = cart.Items.Where(i => i.BundleId == item.BundleId).ToList();
            db.CartItems.RemoveRange(bundleItems);
        }
        else
        {
            db.CartItems.Remove(item);
        }
        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    public async Task RemoveBundleAsync(Guid buyerId, Guid bundleId)
    {
        var cart = await GetOrCreateCartAsync(buyerId);
        var items = cart.Items.Where(i => i.BundleId == bundleId).ToList();
        if (items.Count == 0) throw new KeyNotFoundException("Paket sepette bulunamadi.");
        db.CartItems.RemoveRange(items);
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

    private async Task<ProductBundle> GetPublishedBundleAsync(Guid bundleId)
    {
        return await db.ProductBundles
            .Where(b => b.Id == bundleId && b.Status == ProductBundleStatus.Published)
            .Include(b => b.PrimaryProduct).ThenInclude(p => p!.Images)
            .Include(b => b.PrimaryProduct).ThenInclude(p => p!.SellerProduct)
            .Include(b => b.ComplementaryProduct).ThenInclude(p => p!.Images)
            .Include(b => b.ComplementaryProduct).ThenInclude(p => p!.SellerProduct)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Paket bulunamadi.");
    }

    private static void EnsureBundleStock(ProductBundle bundle, int quantity)
    {
        if (bundle.PrimaryProduct?.SellerProduct?.IsPublished != true ||
            bundle.ComplementaryProduct?.SellerProduct?.IsPublished != true)
            throw new InvalidOperationException("Paket yayinda degil.");
        if (bundle.PrimaryProduct.Stock < quantity || bundle.ComplementaryProduct.Stock < quantity)
            throw new InvalidOperationException("Paket icin yeterli stok yok.");
    }

    private void UpsertBundleItem(Cart cart, ProductBundle bundle, Product product, int quantity)
    {
        var originalTotal = bundle.PrimaryProduct!.Price + bundle.ComplementaryProduct!.Price;
        var totalDiscount = Math.Round(originalTotal * bundle.DiscountPercent / 100, 2);
        var productShare = originalTotal <= 0 ? 0 : product.Price / originalTotal;
        var unitDiscount = Math.Round(totalDiscount * productShare, 2);
        var existing = cart.Items.FirstOrDefault(i => i.BundleId == bundle.Id && i.ProductId == product.Id);

        if (existing is not null)
        {
            existing.Quantity = Math.Min(quantity, product.Stock);
            existing.Price = product.Price - unitDiscount;
            existing.OriginalPrice = product.Price;
            existing.DiscountAmount = unitDiscount;
            existing.Stock = product.Stock;
            existing.BundleTitle = bundle.Title;
            return;
        }

        var item = BuildCartItem(cart.Id, product, quantity, bundle.Id, bundle.Title, product.Price - unitDiscount, unitDiscount);
        cart.Items.Add(item);
        db.CartItems.Add(item);
    }

    private static CartItem BuildCartItem(
        Guid cartId,
        Product product,
        int quantity,
        Guid? bundleId,
        string? bundleTitle,
        decimal price,
        decimal discountAmount)
    {
        return new CartItem
        {
            CartId = cartId,
            ProductId = product.Id,
            Title = product.Title,
            Price = price,
            OriginalPrice = product.Price,
            DiscountAmount = discountAmount,
            Image = product.Images.Where(i => i.IsPrimary).Select(i => i.Url).FirstOrDefault()
                    ?? product.Images.Select(i => i.Url).FirstOrDefault() ?? "",
            Quantity = Math.Min(quantity, product.Stock),
            Stock = product.Stock,
            BundleId = bundleId,
            BundleTitle = bundleTitle,
        };
    }

    private static CartDto MapCart(Cart c) => new(
        c.Id,
        c.Items.OrderBy(i => i.BundleId?.ToString() ?? i.ProductId).Select(MapItem).ToList()
    );

    private static CartItemDto MapItem(CartItem i) => new(
        i.Id, i.ProductId, i.Title, i.Price, i.OriginalPrice, i.DiscountAmount,
        i.Image, i.Quantity, i.Stock, i.BundleId, i.BundleTitle
    );
}
