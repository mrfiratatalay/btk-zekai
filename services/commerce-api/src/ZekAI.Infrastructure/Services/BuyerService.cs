using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs.Buyer;
using ZekAI.Domain.Entities;
using ZekAI.Domain.Enums;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Infrastructure.Services;

public class BuyerService(AppDbContext db)
{
    public async Task<OrderDto> CreateOrderAsync(Guid buyerId, CreateCheckoutOrderRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.DeliveryAddress))
            throw new InvalidOperationException("Teslimat adresi gerekli.");

        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = $"ZK-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}",
            BuyerId = buyerId,
            Status = OrderStatus.Pending,
            DeliveryAddress = req.DeliveryAddress,
            PaymentMethod = req.PaymentMethod,
            OrderedAt = DateTime.UtcNow,
        };

        var orderItems = new List<OrderItem>();
        foreach (var itemReq in req.Items.Where(i => i.Quantity > 0))
        {
            var product = await db.Products.Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == itemReq.ProductId)
                ?? throw new KeyNotFoundException("Urun bulunamadi.");

            if (product.Stock < itemReq.Quantity)
                throw new InvalidOperationException("Yeterli stok yok.");

            product.Stock -= itemReq.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
            order.Subtotal += product.Price * itemReq.Quantity;
            order.Total += product.Price * itemReq.Quantity;
            orderItems.Add(BuildOrderItem(order.Id, product, itemReq.Quantity, null, null, product.Price, 0));
        }

        foreach (var bundleReq in req.Bundles.Where(b => b.Quantity > 0))
        {
            var bundle = await db.ProductBundles
                .Where(b => b.Id == bundleReq.BundleId && b.Status == ProductBundleStatus.Published)
                .Include(b => b.PrimaryProduct).ThenInclude(p => p!.SellerProduct)
                .Include(b => b.ComplementaryProduct).ThenInclude(p => p!.SellerProduct)
                .FirstOrDefaultAsync()
                ?? throw new KeyNotFoundException("Paket bulunamadi.");

            if (bundle.PrimaryProduct?.SellerProduct?.IsPublished != true ||
                bundle.ComplementaryProduct?.SellerProduct?.IsPublished != true)
                throw new InvalidOperationException("Paket yayinda degil.");
            if (bundle.PrimaryProduct.Stock < bundleReq.Quantity || bundle.ComplementaryProduct.Stock < bundleReq.Quantity)
                throw new InvalidOperationException("Paket icin yeterli stok yok.");

            var originalTotal = bundle.PrimaryProduct.Price + bundle.ComplementaryProduct.Price;
            var totalDiscount = Math.Round(originalTotal * bundle.DiscountPercent / 100, 2);

            AddBundleOrderItem(order, orderItems, bundle, bundle.PrimaryProduct, bundleReq.Quantity, originalTotal, totalDiscount);
            AddBundleOrderItem(order, orderItems, bundle, bundle.ComplementaryProduct, bundleReq.Quantity, originalTotal, totalDiscount);

            bundle.PrimaryProduct.Stock -= bundleReq.Quantity;
            bundle.ComplementaryProduct.Stock -= bundleReq.Quantity;
            bundle.PrimaryProduct.UpdatedAt = DateTime.UtcNow;
            bundle.ComplementaryProduct.UpdatedAt = DateTime.UtcNow;
        }

        if (orderItems.Count == 0)
            throw new InvalidOperationException("Siparis icin urun gerekli.");

        db.Orders.Add(order);
        db.OrderItems.AddRange(orderItems);
        await TouchSellerProductsAsync(orderItems.Select(i => i.ProductId).Distinct().ToList());
        await db.SaveChangesAsync();
        return await GetOrderAsync(buyerId, order.Id);
    }

    public async Task<List<OrderDto>> GetOrdersAsync(Guid buyerId)
    {
        var orders = await db.Orders
            .Where(o => o.BuyerId == buyerId)
            .Include(o => o.Items).ThenInclude(i => i.Product).ThenInclude(p => p!.Images)
            .OrderByDescending(o => o.OrderedAt)
            .ToListAsync();

        return orders.Select(MapOrder).ToList();
    }

    public async Task<OrderDto> GetOrderAsync(Guid buyerId, Guid orderId)
    {
        var order = await db.Orders
            .Where(o => o.BuyerId == buyerId && o.Id == orderId)
            .Include(o => o.Items).ThenInclude(i => i.Product).ThenInclude(p => p!.Images)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Siparis bulunamadi.");

        return MapOrder(order);
    }

    public async Task<OrderDto> MarkDeliveredAsync(Guid buyerId, Guid orderId)
    {
        var order = await db.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product).ThenInclude(p => p!.Images)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.BuyerId == buyerId)
            ?? throw new KeyNotFoundException("Siparis bulunamadi.");

        if (order.Status != OrderStatus.Pending)
            throw new InvalidOperationException("Yalnizca bekleyen siparisler teslim alinabilir.");

        order.Status = OrderStatus.Delivered;
        order.DeliveredAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return MapOrder(order);
    }

    private static void AddBundleOrderItem(
        Order order,
        List<OrderItem> orderItems,
        ProductBundle bundle,
        Product product,
        int quantity,
        decimal originalTotal,
        decimal totalDiscount)
    {
        var share = originalTotal <= 0 ? 0 : product.Price / originalTotal;
        var unitDiscount = Math.Round(totalDiscount * share, 2);
        var finalUnitPrice = product.Price - unitDiscount;
        order.Subtotal += product.Price * quantity;
        order.DiscountTotal += unitDiscount * quantity;
        order.Total += finalUnitPrice * quantity;
        orderItems.Add(BuildOrderItem(order.Id, product, quantity, bundle.Id, bundle.Title, finalUnitPrice, unitDiscount));
    }

    private static OrderItem BuildOrderItem(
        Guid orderId,
        Product product,
        int quantity,
        Guid? bundleId,
        string? bundleTitle,
        decimal price,
        decimal discountAmount)
    {
        return new OrderItem
        {
            OrderId = orderId,
            ProductId = product.Id,
            Title = product.Title,
            SellerName = product.SellerName,
            BundleId = bundleId,
            BundleTitle = bundleTitle,
            OriginalUnitPrice = product.Price,
            DiscountAmount = discountAmount,
            Price = price,
            Quantity = quantity,
        };
    }

    private async Task TouchSellerProductsAsync(List<string> productIds)
    {
        var sellerProducts = await db.SellerProducts
            .Where(sp => productIds.Contains(sp.ProductId))
            .ToListAsync();
        foreach (var sellerProduct in sellerProducts)
            sellerProduct.UpdatedAt = DateTime.UtcNow;
    }

    private static OrderDto MapOrder(Order o) => new(
        o.Id, o.OrderNumber, o.Subtotal, o.DiscountTotal, o.Total, o.Status.ToString(),
        o.DeliveryAddress, o.PaymentMethod, o.OrderedAt, o.DeliveredAt,
        o.Items.Select(i => new OrderItemDto(
            i.ProductId, i.Title,
            i.Product?.Images.Where(img => img.IsPrimary).Select(img => img.Url).FirstOrDefault() ?? "",
            i.SellerName, i.BundleId, i.BundleTitle, i.OriginalUnitPrice, i.DiscountAmount,
            i.Price, i.Quantity
        )).ToList()
    );
}
