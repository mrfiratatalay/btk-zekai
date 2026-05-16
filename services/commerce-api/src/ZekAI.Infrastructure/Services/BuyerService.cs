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

    // ── Saved Analyses ─────────────────────────────────────────────────────

    public async Task<List<SavedAnalysisDto>> GetSavedAnalysesAsync(Guid buyerId)
    {
        return await db.SavedAnalyses
            .Where(sa => sa.BuyerId == buyerId)
            .OrderByDescending(sa => sa.SavedAt)
            .Select(sa => MapAnalysis(sa))
            .ToListAsync();
    }

    public async Task<SavedAnalysisDto> SaveAnalysisAsync(Guid buyerId, SaveAnalysisRequest req)
    {
        var existing = await db.SavedAnalyses
            .FirstOrDefaultAsync(sa => sa.BuyerId == buyerId && sa.ExternalId == req.ExternalId);

        if (existing is not null)
        {
            existing.ProductTitle = req.ProductTitle;
            existing.ProductImage = req.ProductImage;
            existing.ProductPrice = req.ProductPrice;
            existing.SellerName = req.SellerName;
            existing.UserNeedText = req.UserNeedText;
            existing.OverallRiskPercent = req.OverallRiskPercent;
            existing.RecommendationLevel = req.RecommendationLevel;
            existing.ScoresJson = req.ScoresJson;
            await db.SaveChangesAsync();
            return MapAnalysis(existing);
        }

        var analysis = new SavedAnalysis
        {
            Id = Guid.NewGuid(),
            BuyerId = buyerId,
            ExternalId = req.ExternalId,
            ProductId = req.ProductId,
            ProductTitle = req.ProductTitle,
            ProductImage = req.ProductImage,
            ProductPrice = req.ProductPrice,
            SellerName = req.SellerName,
            UserNeedText = req.UserNeedText,
            OverallRiskPercent = req.OverallRiskPercent,
            RecommendationLevel = req.RecommendationLevel,
            ScoresJson = req.ScoresJson,
        };

        db.SavedAnalyses.Add(analysis);
        await db.SaveChangesAsync();
        return MapAnalysis(analysis);
    }

    public async Task<SavedAnalysisDto> UpdateAnalysisAsync(Guid buyerId, Guid analysisId, UpdateAnalysisRequest req)
    {
        var analysis = await db.SavedAnalyses
            .FirstOrDefaultAsync(sa => sa.Id == analysisId && sa.BuyerId == buyerId)
            ?? throw new KeyNotFoundException("Analiz bulunamadı.");

        if (req.Status is not null) analysis.Status = req.Status;
        if (req.UserNote is not null) analysis.UserNote = req.UserNote;

        await db.SaveChangesAsync();
        return MapAnalysis(analysis);
    }

    public async Task DeleteAnalysisAsync(Guid buyerId, Guid analysisId)
    {
        var analysis = await db.SavedAnalyses
            .FirstOrDefaultAsync(sa => sa.Id == analysisId && sa.BuyerId == buyerId)
            ?? throw new KeyNotFoundException("Analiz bulunamadı.");

        db.SavedAnalyses.Remove(analysis);
        await db.SaveChangesAsync();
    }

    // Shopping Projects

    public async Task<List<ShoppingProjectDto>> GetProjectsAsync(Guid buyerId)
    {
        var projects = await db.ShoppingProjects
            .Where(p => p.BuyerId == buyerId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return projects.Select(MapProject).ToList();
    }

    public async Task<ShoppingProjectDto> CreateProjectAsync(Guid buyerId, CreateShoppingProjectRequest req)
    {
        var project = new ShoppingProject
        {
            Id = Guid.NewGuid(),
            BuyerId = buyerId,
            ExternalId = string.IsNullOrWhiteSpace(req.ExternalId)
                ? $"project-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}-{Guid.NewGuid().ToString("N")[..7]}"
                : req.ExternalId,
            Title = req.Title,
            Goal = req.Goal,
            Budget = req.Budget,
            SavedAnalysisIdsJson = JsonSerializer.Serialize(req.SavedAnalysisIds ?? []),
        };

        db.ShoppingProjects.Add(project);
        await db.SaveChangesAsync();
        return MapProject(project);
    }

    public async Task<ShoppingProjectDto> UpdateProjectAsync(Guid buyerId, string externalId, UpdateShoppingProjectRequest req)
    {
        var project = await db.ShoppingProjects
            .FirstOrDefaultAsync(p => p.BuyerId == buyerId && p.ExternalId == externalId)
            ?? throw new KeyNotFoundException("Karar odasi bulunamadi.");

        if (req.Title is not null) project.Title = req.Title;
        if (req.Goal is not null) project.Goal = req.Goal;
        if (req.Budget is not null) project.Budget = req.Budget;
        if (req.SavedAnalysisIds is not null)
            project.SavedAnalysisIdsJson = JsonSerializer.Serialize(req.SavedAnalysisIds);
        project.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return MapProject(project);
    }

    public async Task DeleteProjectAsync(Guid buyerId, string externalId)
    {
        var project = await db.ShoppingProjects
            .FirstOrDefaultAsync(p => p.BuyerId == buyerId && p.ExternalId == externalId)
            ?? throw new KeyNotFoundException("Karar odasi bulunamadi.");

        db.ShoppingProjects.Remove(project);
        await db.SaveChangesAsync();
    }

    public async Task<ShoppingProjectDto> AddAnalysisToProjectAsync(Guid buyerId, string externalId, string analysisId)
    {
        var project = await db.ShoppingProjects
            .FirstOrDefaultAsync(p => p.BuyerId == buyerId && p.ExternalId == externalId)
            ?? throw new KeyNotFoundException("Karar odasi bulunamadi.");

        var ids = ParseProjectAnalysisIds(project);
        if (!ids.Contains(analysisId)) ids.Add(analysisId);
        project.SavedAnalysisIdsJson = JsonSerializer.Serialize(ids);
        project.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return MapProject(project);
    }

    public async Task<ShoppingProjectDto> RemoveAnalysisFromProjectAsync(Guid buyerId, string externalId, string analysisId)
    {
        var project = await db.ShoppingProjects
            .FirstOrDefaultAsync(p => p.BuyerId == buyerId && p.ExternalId == externalId)
            ?? throw new KeyNotFoundException("Karar odasi bulunamadi.");

        var ids = ParseProjectAnalysisIds(project);
        ids.RemoveAll(id => id == analysisId);
        project.SavedAnalysisIdsJson = JsonSerializer.Serialize(ids);
        project.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return MapProject(project);
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

    private static SavedAnalysisDto MapAnalysis(SavedAnalysis sa) => new(
        sa.Id, sa.ExternalId, sa.ProductId, sa.ProductTitle, sa.ProductImage,
        sa.ProductPrice, sa.SellerName, sa.UserNeedText,
        sa.OverallRiskPercent, sa.RecommendationLevel, sa.ScoresJson,
        sa.Status, sa.UserNote, sa.SavedAt
    );

    private static ShoppingProjectDto MapProject(ShoppingProject p) => new(
        p.ExternalId, p.Title, p.Goal, p.Budget, p.CreatedAt, ParseProjectAnalysisIds(p)
    );

    private static List<string> ParseProjectAnalysisIds(ShoppingProject p)
        => JsonSerializer.Deserialize<List<string>>(p.SavedAnalysisIdsJson) ?? [];
}
