using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs.Buyer;
using ZekAI.Domain.Entities;
using ZekAI.Domain.Enums;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Infrastructure.Services;

public class BuyerService(AppDbContext db)
{
    // ── Orders ─────────────────────────────────────────────────────────────

    public async Task<OrderDto> CreateOrderAsync(Guid buyerId, CreateOrderRequest req)
    {
        var product = await db.Products.Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == req.ProductId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        if (product.Stock < req.Quantity)
            throw new InvalidOperationException("Yeterli stok yok.");

        product.Stock -= req.Quantity;
        product.UpdatedAt = DateTime.UtcNow;

        var order = new Order
        {
            Id = Guid.NewGuid(),
            OrderNumber = $"ZK-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}",
            BuyerId = buyerId,
            Total = product.Price * req.Quantity,
            Status = OrderStatus.Pending,
            DeliveryAddress = req.DeliveryAddress,
            PaymentMethod = req.PaymentMethod,
            OrderedAt = DateTime.UtcNow,
        };

        var item = new OrderItem
        {
            OrderId = order.Id,
            ProductId = product.Id,
            Title = product.Title,
            SellerName = product.SellerName,
            Price = product.Price,
            Quantity = req.Quantity,
        };

        db.Orders.Add(order);
        db.OrderItems.Add(item);

        var sellerProduct = await db.SellerProducts.FirstOrDefaultAsync(sp => sp.ProductId == product.Id);
        if (sellerProduct is not null)
        {
            sellerProduct.Sales30d += req.Quantity;
            sellerProduct.UpdatedAt = DateTime.UtcNow;
        }

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
            ?? throw new KeyNotFoundException("Sipariş bulunamadı.");

        return MapOrder(order);
    }

    public async Task<OrderDto> MarkDeliveredAsync(Guid buyerId, Guid orderId)
    {
        var order = await db.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product).ThenInclude(p => p!.Images)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.BuyerId == buyerId)
            ?? throw new KeyNotFoundException("Sipariş bulunamadı.");

        if (order.Status != OrderStatus.Pending)
            throw new InvalidOperationException("Yalnızca bekleyen siparişler teslim alınabilir.");

        order.Status = OrderStatus.Delivered;
        order.DeliveredAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return MapOrder(order);
    }

    // ── Mappers ────────────────────────────────────────────────────────────

    private static OrderDto MapOrder(Order o) => new(
        o.Id, o.OrderNumber, o.Total, o.Status.ToString(),
        o.DeliveryAddress, o.PaymentMethod, o.OrderedAt, o.DeliveredAt,
        o.Items.Select(i => new OrderItemDto(
            i.ProductId, i.Title,
            i.Product?.Images.Where(img => img.IsPrimary).Select(img => img.Url).FirstOrDefault() ?? "",
            i.SellerName, i.Price, i.Quantity
        )).ToList()
    );
}
