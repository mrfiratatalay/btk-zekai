using Microsoft.EntityFrameworkCore;
using System.Text.Json;
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
            .Include(o => o.Return)
            .OrderByDescending(o => o.OrderedAt)
            .ToListAsync();

        return orders.Select(MapOrder).ToList();
    }

    public async Task<OrderDto> GetOrderAsync(Guid buyerId, Guid orderId)
    {
        var order = await db.Orders
            .Where(o => o.BuyerId == buyerId && o.Id == orderId)
            .Include(o => o.Items).ThenInclude(i => i.Product).ThenInclude(p => p!.Images)
            .Include(o => o.Return)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException("Sipariş bulunamadı.");

        return MapOrder(order);
    }

    public async Task<OrderDto> MarkDeliveredAsync(Guid buyerId, Guid orderId)
    {
        var order = await db.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product).ThenInclude(p => p!.Images)
            .Include(o => o.Return)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.BuyerId == buyerId)
            ?? throw new KeyNotFoundException("Sipariş bulunamadı.");

        if (order.Status != OrderStatus.Pending)
            throw new InvalidOperationException("Yalnızca bekleyen siparişler teslim alınabilir.");

        order.Status = OrderStatus.Delivered;
        order.DeliveredAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return MapOrder(order);
    }

    // ── Returns ────────────────────────────────────────────────────────────

    public async Task<List<ReturnDto>> GetReturnsAsync(Guid buyerId)
    {
        var returns = await db.Returns
            .Include(r => r.Order)
            .Where(r => r.Order!.BuyerId == buyerId)
            .OrderByDescending(r => r.RequestedAt)
            .ToListAsync();

        return returns.Select(MapReturn).ToList();
    }

    public async Task<ReturnDto> CreateReturnAsync(Guid buyerId, Guid orderId, CreateReturnRequest req)
    {
        var order = await db.Orders
            .Include(o => o.Return)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.BuyerId == buyerId)
            ?? throw new KeyNotFoundException("Sipariş bulunamadı.");

        if (order.Return is not null)
            throw new InvalidOperationException("Bu sipariş için zaten iade talebi var.");

        if (order.Status != OrderStatus.Delivered)
            throw new InvalidOperationException("Yalnızca teslim edilen siparişler iade edilebilir.");

        var reason = Enum.TryParse<ReturnReasonKey>(req.Reason, true, out var r) ? r : ReturnReasonKey.Other;

        var ret = new Return
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            Reason = reason,
            BuyerClaim = req.BuyerClaim,
            Status = ReturnStatus.SellerReview,
            Amount = order.Total,
        };

        order.Status = OrderStatus.ReturnRequested;
        db.Returns.Add(ret);
        await db.SaveChangesAsync();

        return MapReturn(ret);
    }

    public async Task<ReturnDto> GetReturnAsync(Guid returnId)
    {
        var ret = await db.Returns.FindAsync(returnId)
            ?? throw new KeyNotFoundException("İade talebi bulunamadı.");
        return MapReturn(ret);
    }

    // ── Mappers ────────────────────────────────────────────────────────────

    private static OrderDto MapOrder(Order o) => new(
        o.Id, o.OrderNumber, o.Total, o.Status.ToString(),
        o.DeliveryAddress, o.PaymentMethod, o.OrderedAt, o.DeliveredAt,
        o.Items.Select(i => new OrderItemDto(
            i.ProductId, i.Title,
            i.Product?.Images.Where(img => img.IsPrimary).Select(img => img.Url).FirstOrDefault() ?? "",
            i.SellerName, i.Price, i.Quantity
        )).ToList(),
        o.Status == OrderStatus.Delivered && o.Return is null
    );

    private static ReturnDto MapReturn(Return r) => new(
        r.Id, r.OrderId, r.Reason.ToString(), r.BuyerClaim,
        r.SellerResponse, r.Status.ToString(), r.Amount, r.RequestedAt
    );
}
