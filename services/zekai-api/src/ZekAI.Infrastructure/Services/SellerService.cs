using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs;
using ZekAI.Domain.Entities;
using ZekAI.Infrastructure.Data;
using ZekAI.Infrastructure.Http;

namespace ZekAI.Infrastructure.Services;

public class SellerService(ZekaiDbContext db, CommerceApiClient commerce)
{
    public async Task<StoreConnectionDto?> GetStoreAsync(Guid userId)
    {
        var conn = await db.StoreConnections
            .FirstOrDefaultAsync(sc => sc.ZekaiUserId == userId && sc.Status == "connected");
        if (conn is null) return null;

        var profile = await commerce.GetSellerProfileAsync(conn.CommerceAccessToken);
        var products = await commerce.GetSellerProductsAsync(conn.CommerceAccessToken);
        var storeName = profile?.StoreName ?? "Mağaza";
        return new StoreConnectionDto("Akıllı Market", storeName, "Connected", conn.LastSyncedAt, products.Count);
    }

    public async Task<StoreConnectionDto> ConnectStoreAsync(Guid userId, StoreConnectRequest req)
    {
        var profile = await commerce.GetSellerProfileAsync(req.ApiKey)
            ?? throw new UnauthorizedAccessException("API anahtarı geçersiz.");

        var existing = await db.StoreConnections.FirstOrDefaultAsync(sc => sc.ZekaiUserId == userId);
        if (existing is not null)
        {
            existing.CommerceAccessToken = req.ApiKey;
            existing.CommerceSellerId = profile.Id.ToString();
            existing.Status = "connected";
            existing.ConnectedAt = DateTime.UtcNow;
            existing.LastSyncedAt = null;
            existing.ProviderName = req.Platform;
        }
        else
        {
            existing = new SellerStoreConnection
            {
                ZekaiUserId = userId,
                ProviderName = req.Platform,
                CommerceSellerId = profile.Id.ToString(),
                CommerceAccessToken = req.ApiKey,
                Status = "connected",
            };
            db.StoreConnections.Add(existing);
        }

        await db.SaveChangesAsync();
        var products = await commerce.GetSellerProductsAsync(req.ApiKey);
        return new StoreConnectionDto(req.Platform, profile.StoreName, "Connected", null, products.Count);
    }

    public async Task<object?> GetProfileAsync(Guid userId)
    {
        var conn = await GetActiveConnectionAsync(userId);
        return await commerce.GetSellerProfileAsync(conn.CommerceAccessToken);
    }

    public async Task<List<CommerceProductDto>> GetProductsAsync(Guid userId)
    {
        var conn = await GetActiveConnectionAsync(userId);
        return await commerce.GetSellerProductsAsync(conn.CommerceAccessToken);
    }

    public async Task<object?> GetProductAsync(Guid userId, string productId)
    {
        var conn = await GetActiveConnectionAsync(userId);
        var doc = await commerce.ProxyGetAsync(conn.CommerceAccessToken, $"/api/seller/products/{productId}");
        return doc?.RootElement;
    }

    public async Task<bool> PublishUpdateAsync(Guid userId, string productId, object updatePayload)
    {
        var conn = await GetActiveConnectionAsync(userId);
        return await commerce.UpdateProductAsync(conn.CommerceAccessToken, productId, updatePayload);
    }

    public async Task SyncAsync(Guid userId)
    {
        var conn = await GetActiveConnectionAsync(userId);
        conn.LastSyncedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    public async Task<object?> ProxyGetAsync(Guid userId, string path)
    {
        var conn = await GetActiveConnectionAsync(userId);
        var doc = await commerce.ProxyGetAsync(conn.CommerceAccessToken, path);
        return doc?.RootElement;
    }

    public async Task<object?> ProxyPutAsync(Guid userId, string path, object body)
    {
        var conn = await GetActiveConnectionAsync(userId);
        var doc = await commerce.ProxyPutAsync(conn.CommerceAccessToken, path, body);
        return doc?.RootElement;
    }

    public async Task<object?> GenerateSocialContentAsync(Guid userId, string productId, object body)
    {
        var conn = await GetActiveConnectionAsync(userId);
        var doc = await commerce.ProxyPostAsync(
            conn.CommerceAccessToken,
            $"/api/seller/products/{productId}/social-content",
            body);
        return doc?.RootElement;
    }

    private async Task<SellerStoreConnection> GetActiveConnectionAsync(Guid userId)
    {
        return await db.StoreConnections
            .FirstOrDefaultAsync(sc => sc.ZekaiUserId == userId && sc.Status == "connected")
            ?? throw new InvalidOperationException("Bağlı mağaza bulunamadı. Önce mağazanızı bağlayın.");
    }
}
