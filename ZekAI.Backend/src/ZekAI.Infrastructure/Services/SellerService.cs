using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs.Seller;
using ZekAI.Domain.Entities;
using ZekAI.Domain.Enums;
using ZekAI.Infrastructure.Data;

namespace ZekAI.Infrastructure.Services;

public class SellerService(AppDbContext db)
{
    private async Task<Seller> GetSellerByUserIdAsync(Guid userId)
    {
        return await db.Sellers.FirstOrDefaultAsync(s => s.UserId == userId)
            ?? throw new KeyNotFoundException("Satıcı profili bulunamadı.");
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

    public async Task<StoreConnectionDto?> GetStoreAsync(Guid userId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var conn = await db.StoreConnections
            .Where(c => c.SellerId == seller.Id && c.Status == StoreConnectionStatus.Connected)
            .FirstOrDefaultAsync();
        if (conn is null) return null;
        return new StoreConnectionDto(
            conn.Platform.ToString(), conn.StoreName,
            conn.Status.ToString(), conn.LastSyncAt, conn.ProductCount
        );
    }

    public async Task<StoreConnectionDto> ConnectStoreAsync(Guid userId, ConnectStoreRequest req)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var existing = await db.StoreConnections.FirstOrDefaultAsync(c => c.SellerId == seller.Id);
        if (existing is not null)
        {
            existing.Status = StoreConnectionStatus.Connected;
            existing.LastSyncAt = DateTime.UtcNow;
            existing.ProductCount = await db.SellerProducts.CountAsync(sp => sp.SellerId == seller.Id);
        }
        else
        {
            existing = new StoreConnection
            {
                SellerId = seller.Id,
                Platform = StorePlatform.DemoStore,
                StoreName = seller.StoreName,
                Status = StoreConnectionStatus.Connected,
                LastSyncAt = DateTime.UtcNow,
                ProductCount = await db.SellerProducts.CountAsync(sp => sp.SellerId == seller.Id),
            };
            db.StoreConnections.Add(existing);
        }
        await db.SaveChangesAsync();
        return new StoreConnectionDto(existing.Platform.ToString(), existing.StoreName, existing.Status.ToString(), existing.LastSyncAt, existing.ProductCount);
    }

    public async Task<StoreConnectionDto> SyncStoreAsync(Guid userId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var conn = await db.StoreConnections
            .FirstOrDefaultAsync(c => c.SellerId == seller.Id && c.Status == StoreConnectionStatus.Connected)
            ?? throw new KeyNotFoundException("Bağlı mağaza bulunamadı. Önce mağaza bağlayın.");

        conn.LastSyncAt = DateTime.UtcNow;
        conn.ProductCount = await db.SellerProducts.CountAsync(sp => sp.SellerId == seller.Id);
        await db.SaveChangesAsync();

        return new StoreConnectionDto(conn.Platform.ToString(), conn.StoreName, conn.Status.ToString(), conn.LastSyncAt, conn.ProductCount);
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
                sp.Sales30d,
                sp.ReturnRate,
                sp.ConversionRate,
                sp.HealthScore,
                sp.LostProfitMonthly,
                sp.ImprovableRevenueMonthly,
                sp.Status.ToString(),
                sp.MainIssue,
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
            sp.Sales30d, sp.ReturnRate, sp.ConversionRate, sp.HealthScore,
            sp.LostProfitMonthly, sp.ImprovableRevenueMonthly,
            sp.Status.ToString(), sp.MainIssue, sp.UpdatedAt
        );
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
        if (req.Description is not null) product.Description = req.Description;
        if (req.Price.HasValue) product.Price = req.Price.Value;
        if (req.Stock.HasValue) product.Stock = req.Stock.Value;
        product.UpdatedAt = DateTime.UtcNow;
        sp.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
    }

    public async Task<List<KpiDto>> GetKpisAsync(Guid userId)
    {
        var seller = await GetSellerByUserIdAsync(userId);
        var products = await db.SellerProducts.Where(sp => sp.SellerId == seller.Id).ToListAsync();

        var totalLost = products.Sum(p => p.LostProfitMonthly);
        var active = products.Count;
        var avgReturn = products.Any() ? products.Average(p => p.ReturnRate) : 0;
        var totalOpportunity = products.Sum(p => p.ImprovableRevenueMonthly);

        return
        [
            new("Aylık Tahmini Kayıp", $"₺{totalLost:N0}", "İade ve düşük dönüşüm etkisi", "danger"),
            new("Aktif Ürün", active.ToString(), "Demo Store'dan senkronize", "neutral"),
            new("Ort. İade Oranı", $"%{avgReturn:F0}", "Sektör ortalaması %12", "warning"),
            new("İyileştirme Fırsatı", $"+₺{totalOpportunity:N0}", "Aylık potansiyel gelir", "success"),
        ];
    }

    public async Task<List<ReturnReasonDto>> GetReturnReasonsAsync(Guid userId)
    {
        var seller = await GetSellerByUserIdAsync(userId);

        var sellerProductIds = await db.SellerProducts
            .Where(sp => sp.SellerId == seller.Id)
            .Select(sp => sp.ProductId)
            .ToListAsync();

        var returns = await db.Returns
            .Include(r => r.Order).ThenInclude(o => o!.Items)
            .Where(r => r.Order!.Items.Any(i => sellerProductIds.Contains(i.ProductId)))
            .ToListAsync();

        if (returns.Count == 0) return [];

        var total = returns.Count;
        return returns
            .GroupBy(r => r.Reason)
            .OrderByDescending(g => g.Count())
            .Select(g => new ReturnReasonDto(
                GetReasonLabel(g.Key),
                Math.Round((double)g.Count() / total * 100, 1),
                GetReasonRootCause(g.Key),
                GetReasonSolution(g.Key),
                GetReasonExpectedImpact(g.Key)
            ))
            .ToList();
    }

    public async Task<List<SellerReturnDto>> GetReturnsAsync(Guid userId)
    {
        var seller = await GetSellerByUserIdAsync(userId);

        var sellerProductIds = await db.SellerProducts
            .Where(sp => sp.SellerId == seller.Id)
            .Select(sp => sp.ProductId)
            .ToListAsync();

        return await db.Returns
            .Include(r => r.Order).ThenInclude(o => o!.Items)
            .Where(r => r.Order!.Items.Any(i => sellerProductIds.Contains(i.ProductId)))
            .OrderByDescending(r => r.RequestedAt)
            .Select(r => new SellerReturnDto(
                r.Id,
                r.OrderId,
                r.Order!.OrderNumber,
                r.Order.Items.FirstOrDefault(i => sellerProductIds.Contains(i.ProductId))!.Title,
                r.Reason.ToString(),
                r.BuyerClaim,
                r.SellerResponse,
                r.Status.ToString(),
                r.Amount,
                r.RequestedAt,
                r.UpdatedAt
            ))
            .ToListAsync();
    }

    public async Task<SellerReturnDto> RespondToReturnAsync(Guid userId, Guid returnId, SellerRespondReturnRequest req)
    {
        var seller = await GetSellerByUserIdAsync(userId);

        var sellerProductIds = await db.SellerProducts
            .Where(sp => sp.SellerId == seller.Id)
            .Select(sp => sp.ProductId)
            .ToListAsync();

        var ret = await db.Returns
            .Include(r => r.Order).ThenInclude(o => o!.Items)
            .FirstOrDefaultAsync(r =>
                r.Id == returnId &&
                r.Order!.Items.Any(i => sellerProductIds.Contains(i.ProductId)))
            ?? throw new KeyNotFoundException("İade talebi bulunamadı.");

        if (ret.Status != ReturnStatus.SellerReview)
            throw new InvalidOperationException("Bu iade talebi artık yanıtlanamaz.");

        var action = req.Action.ToLowerInvariant();
        if (action == "accept")
        {
            ret.SellerResponse = req.Response ?? "Satıcı iade talebini kabul etti.";
            ret.Status = ReturnStatus.Resolved;
            ret.Order!.Status = OrderStatus.Completed;
        }
        else if (action == "dispute")
        {
            if (string.IsNullOrWhiteSpace(req.Response))
                throw new InvalidOperationException("İtiraz için açıklama zorunludur.");
            ret.SellerResponse = req.Response;
            ret.Status = ReturnStatus.ArbiterReview;
        }
        else
        {
            throw new InvalidOperationException("Geçersiz işlem. 'accept' veya 'dispute' kullanın.");
        }

        ret.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return new SellerReturnDto(
            ret.Id, ret.OrderId, ret.Order!.OrderNumber,
            ret.Order.Items.FirstOrDefault(i => sellerProductIds.Contains(i.ProductId))!.Title,
            ret.Reason.ToString(), ret.BuyerClaim, ret.SellerResponse,
            ret.Status.ToString(), ret.Amount, ret.RequestedAt, ret.UpdatedAt
        );
    }

    private static string GetReasonLabel(ReturnReasonKey reason) => reason switch
    {
        ReturnReasonKey.Damaged => "Hasarlı / Kırık ürün",
        ReturnReasonKey.NotAsExpected => "Ürün beklentiyi karşılamadı",
        ReturnReasonKey.WrongProduct => "Yanlış ürün gönderildi",
        ReturnReasonKey.LowQuality => "Düşük kalite",
        ReturnReasonKey.Other => "Diğer nedenler",
        _ => reason.ToString()
    };

    private static string GetReasonRootCause(ReturnReasonKey reason) => reason switch
    {
        ReturnReasonKey.Damaged => "Paketleme yetersizliği veya kargo hasarı.",
        ReturnReasonKey.NotAsExpected => "Ürün görselleri veya açıklaması gerçekle örtüşmüyor.",
        ReturnReasonKey.WrongProduct => "Stok/sipariş yönetiminde karışıklık.",
        ReturnReasonKey.LowQuality => "Ürün kalitesi müşteri beklentisinin altında.",
        ReturnReasonKey.Other => "Çeşitli müşteri kaynaklı nedenler.",
        _ => ""
    };

    private static string GetReasonSolution(ReturnReasonKey reason) => reason switch
    {
        ReturnReasonKey.Damaged => "Paketleme kalitesini artır, kırılgan uyarısı ekle.",
        ReturnReasonKey.NotAsExpected => "Ürün açıklamasını ve görsellerini gerçekçi hale getir.",
        ReturnReasonKey.WrongProduct => "Stok barkod kontrolünü güçlendir.",
        ReturnReasonKey.LowQuality => "Ürün sayfasına dürüst kullanım senaryoları ekle.",
        ReturnReasonKey.Other => "Müşteri yorumlarını düzenli takip et.",
        _ => ""
    };

    private static string GetReasonExpectedImpact(ReturnReasonKey reason) => reason switch
    {
        ReturnReasonKey.Damaged => "Hasar iadeleri %40-60 azalabilir.",
        ReturnReasonKey.NotAsExpected => "Beklenti iadeleri %20-30 düşebilir.",
        ReturnReasonKey.WrongProduct => "Yanlış ürün iadeleri ortadan kalkar.",
        ReturnReasonKey.LowQuality => "Kalite iadeleri %15-25 azalabilir.",
        ReturnReasonKey.Other => "Genel iade oranı iyileşir.",
        _ => ""
    };
}
