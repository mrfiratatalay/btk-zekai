using System.Text.Json;
using System.Text.Json.Nodes;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using ZekAI.Application.DTOs;
using ZekAI.Domain.Entities;
using ZekAI.Infrastructure.Data;
using ZekAI.Infrastructure.Http;

namespace ZekAI.Infrastructure.Services;

public class SellerService(ZekaiDbContext db, CommerceApiClient commerce, AiServiceClient aiService)
{
    private static readonly TimeSpan BundleRecommendationCacheTtl = TimeSpan.FromDays(7);
    private const decimal BundleRecommendationDiscountPercent = 5m;
    private const string BundleRecommendationDiscountPolicyVersion = "backend-fixed-5-v1";

    public async Task<List<StoreConnectionDto>> GetConnectionsAsync(Guid userId)
    {
        var connections = await db.StoreConnections
            .Where(sc => sc.ZekaiUserId == userId)
            .ToListAsync();

        var result = new List<StoreConnectionDto>();
        foreach (var conn in connections)
        {
            int productCount = 0;
            var storeName = conn.ProviderName;
            if (conn.Status == "connected" && !string.IsNullOrEmpty(conn.CommerceAccessToken))
            {
                var profile = await commerce.GetSellerProfileAsync(conn.CommerceAccessToken);
                storeName = profile?.StoreName ?? conn.ProviderName;
                var products = await commerce.GetSellerProductsAsync(conn.CommerceAccessToken);
                productCount = products.Count;
            }
            result.Add(new StoreConnectionDto(
                conn.Id,
                conn.ProviderName,
                storeName,
                conn.Status == "connected" ? "Connected" : "Disconnected",
                conn.LastSyncedAt,
                productCount,
                !string.IsNullOrEmpty(conn.CommerceAccessToken)
            ));
        }
        return result;
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
        return new StoreConnectionDto(existing.Id, req.Platform, profile.StoreName, "Connected", null, products.Count, true);
    }

    public async Task DisconnectStoreAsync(Guid userId, Guid connectionId)
    {
        var conn = await db.StoreConnections
            .FirstOrDefaultAsync(sc => sc.ZekaiUserId == userId && sc.Id == connectionId)
            ?? throw new KeyNotFoundException("Bağlantı bulunamadı.");

        conn.Status = "disconnected";
        conn.CommerceAccessToken = "";
        await db.SaveChangesAsync();
    }

    public async Task<bool> PublishProductAsync(Guid userId, string productId, bool published)
    {
        var conn = await GetActiveConnectionAsync(userId);
        return await commerce.PublishProductAsync(conn.CommerceAccessToken, productId, published);
    }

    public async Task<object?> UpdateProductImageAsync(Guid userId, string productId, string imageBase64, string mimeType)
    {
        var conn = await GetActiveConnectionAsync(userId);
        var doc = await commerce.UpdateProductImageAsync(conn.CommerceAccessToken, productId, imageBase64, mimeType);
        return doc?.RootElement;
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

    // ── Seller Product Drafts ─────────────────────────────────────────────
    // AI çıktısı DB'de saklanır; yayınlama bu kayıttan kopyalanır → tekrar AI
    // maliyeti oluşmaz. Çoklu varyasyon: ürün başına birden fazla taslak.

    private static readonly JsonSerializerOptions DraftJsonOpts = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public async Task<ProductDraftDto> SaveDraftAsync(Guid userId, string productId, SaveProductDraftRequest req)
    {
        var conn = await GetActiveConnectionAsync(userId);

        // Üretilen görselleri commerce storage'a kalıcılaştır (ürünü değiştirmeden)
        var images = new List<DraftImageDto>();
        foreach (var img in req.Images)
        {
            if (!string.IsNullOrWhiteSpace(img.Url))
            {
                images.Add(new DraftImageDto(img.Type, img.Label, img.Url!));
                continue;
            }
            if (string.IsNullOrWhiteSpace(img.ImageBase64)) continue;

            var doc = await commerce.ProxyPostAsync(
                conn.CommerceAccessToken,
                $"/api/seller/products/{productId}/draft-image",
                new { imageBase64 = img.ImageBase64, mimeType = img.MimeType ?? "image/png" });

            var url = doc?.RootElement.TryGetProperty("imageUrl", out var u) == true ? u.GetString() : null;
            if (!string.IsNullOrWhiteSpace(url))
                images.Add(new DraftImageDto(img.Type, img.Label, url!));
        }

        var draft = new SellerProductDraft
        {
            UserId = userId,
            CommerceProductId = productId,
            Label = string.IsNullOrWhiteSpace(req.Label)
                ? $"Taslak · {DateTime.UtcNow:dd.MM HH:mm}"
                : req.Label.Trim(),
            Title = req.Title,
            ShortDescription = req.ShortDescription,
            Description = req.Description,
            FeaturesJson = JsonSerializer.Serialize(req.Features, DraftJsonOpts),
            Price = req.Price,
            OriginalPrice = req.OriginalPrice,
            Stock = req.Stock,
            Brand = req.Brand,
            CargoText = req.CargoText,
            CategoryId = req.CategoryId,
            ImagesJson = JsonSerializer.Serialize(images, DraftJsonOpts),
        };

        db.SellerProductDrafts.Add(draft);
        await db.SaveChangesAsync();
        return ToDto(draft);
    }

    public async Task<List<ProductDraftDto>> GetProductDraftsAsync(Guid userId, string productId)
    {
        var drafts = await db.SellerProductDrafts
            .Where(d => d.UserId == userId && d.CommerceProductId == productId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
        return drafts.Select(ToDto).ToList();
    }

    public async Task<List<ProductDraftDto>> GetAllDraftsAsync(Guid userId)
    {
        var drafts = await db.SellerProductDrafts
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
        return drafts.Select(ToDto).ToList();
    }

    public async Task<bool> DeleteDraftAsync(Guid userId, Guid draftId)
    {
        var draft = await db.SellerProductDrafts
            .FirstOrDefaultAsync(d => d.Id == draftId && d.UserId == userId);
        if (draft is null) return false;
        db.SellerProductDrafts.Remove(draft);
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Taslağı canlı commerce ürününe kopyalar + yayına alır. Sıfır AI maliyeti.
    /// </summary>
    public async Task<bool> PublishDraftAsync(Guid userId, Guid draftId)
    {
        var conn = await GetActiveConnectionAsync(userId);
        var draft = await db.SellerProductDrafts
            .FirstOrDefaultAsync(d => d.Id == draftId && d.UserId == userId)
            ?? throw new KeyNotFoundException("Taslak bulunamadı.");

        var features = JsonSerializer.Deserialize<Dictionary<string, string>>(draft.FeaturesJson, DraftJsonOpts)
                       ?? new Dictionary<string, string>();
        var images = JsonSerializer.Deserialize<List<DraftImageDto>>(draft.ImagesJson, DraftJsonOpts)
                     ?? new List<DraftImageDto>();
        var primaryImageUrl = images.FirstOrDefault()?.Url;

        var payload = new
        {
            title = draft.Title,
            shortDescription = draft.ShortDescription,
            description = draft.Description,
            features,
            price = draft.Price,
            stock = draft.Stock,
            brand = draft.Brand,
            originalPrice = draft.OriginalPrice,
            clearOriginalPrice = draft.OriginalPrice is null,
            cargoText = draft.CargoText,
            categoryId = draft.CategoryId,
            primaryImageUrl = primaryImageUrl,
        };

        var updated = await commerce.UpdateProductAsync(conn.CommerceAccessToken, draft.CommerceProductId, payload);
        if (!updated) return false;
        return await commerce.PublishProductAsync(conn.CommerceAccessToken, draft.CommerceProductId, true);
    }

    private static ProductDraftDto ToDto(SellerProductDraft d) => new(
        d.Id,
        d.CommerceProductId,
        d.Label,
        d.Title,
        d.ShortDescription,
        d.Description,
        JsonSerializer.Deserialize<Dictionary<string, string>>(d.FeaturesJson, DraftJsonOpts) ?? new(),
        d.Price,
        d.OriginalPrice,
        d.Stock,
        d.Brand,
        d.CargoText,
        d.CategoryId,
        JsonSerializer.Deserialize<List<DraftImageDto>>(d.ImagesJson, DraftJsonOpts) ?? new(),
        d.CreatedAt
    );

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

        // Ürün bilgilerini public endpoint'ten çek (description + features dahil)
        var pd = await commerce.GetProductDetailAsync(productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var features = pd.Features?.Values.ToList() ?? [];

        // Üretim ayarlarını body'den parse et
        var tone = "samimi";
        if (body is JsonElement bodyEl && bodyEl.TryGetProperty("tone", out var toneEl))
            tone = toneEl.GetString() ?? "samimi";
        var purpose = "guven";
        if (body is JsonElement purposeBodyEl && purposeBodyEl.TryGetProperty("purpose", out var purposeEl))
            purpose = purposeEl.GetString() ?? "guven";
        var platforms = new List<string> { "instagram", "tiktok", "twitter" };
        if (body is JsonElement platformBodyEl && platformBodyEl.TryGetProperty("platforms", out var platformsEl) &&
            platformsEl.ValueKind == JsonValueKind.Array)
        {
            platforms = platformsEl.EnumerateArray()
                .Select(p => p.GetString())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Select(p => p!.Trim().ToLowerInvariant() == "x" ? "twitter" : p!.Trim().ToLowerInvariant())
                .Where(p => p is "instagram" or "tiktok" or "twitter")
                .Distinct()
                .ToList();
            if (platforms.Count == 0)
                platforms = ["instagram"];
        }

        // AI servisinden içerik üret
        var aiResult = await aiService.GenerateSocialContentAsync(
            pd.Title, pd.Category, pd.Price, pd.Description, features, tone, purpose, platforms);

        if (aiResult is null) return null;

        // commerce-api'ye kaydet
        var savePayload = new
        {
            tone,
            purpose,
            platforms,
            instagram = aiResult.Instagram,
            tiktok = aiResult.Tiktok,
            twitter = aiResult.Twitter,
        };
        var saved = await commerce.ProxyPostAsync(conn.CommerceAccessToken, $"/api/seller/products/{productId}/save-social-content", savePayload);
        if (aiResult.Mock)
        {
            return new
            {
                tone,
                purpose,
                platforms,
                instagram = aiResult.Instagram,
                tiktok = aiResult.Tiktok,
                twitter = aiResult.Twitter,
                generatedAt = DateTime.UtcNow,
                _mock = true,
            };
        }

        return saved?.RootElement;
    }

    public async Task<object?> GenerateAiContentAsync(Guid userId, string productId, SimulationInsightDto? simulationInsight = null)
    {
        await GetActiveConnectionAsync(userId);

        var pd = await commerce.GetProductDetailAsync(productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var features = pd.Features?.Values.ToList() ?? [];
        var imageUrl = pd.Images?.FirstOrDefault();

        var aiResult = await aiService.GenerateProductContentAsync(
            pd.Title, pd.Category, pd.Price, pd.Description, features, imageUrl, simulationInsight);

        return aiResult;
    }

    public async Task<object?> SimulateProductAsync(Guid userId, string productId)
    {
        await GetActiveConnectionAsync(userId);

        var pd = await commerce.GetProductDetailAsync(productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var features = pd.Features?.Values.ToList() ?? [];

        return await aiService.SimulateProductAsync(pd.Title, pd.Category, pd.Price, pd.Description, features);
    }

    public async Task<SimulationProductPayload> GetSimulationPayloadAsync(Guid userId, string productId)
    {
        await GetActiveConnectionAsync(userId);

        var pd = await commerce.GetProductDetailAsync(productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var features = pd.Features?.Values.ToList() ?? [];

        return new SimulationProductPayload(pd.Title, pd.Category, pd.Price, pd.Description, features);
    }

    public async Task<object?> GenerateProductImageAsync(Guid userId, string productId, string style)
    {
        await GetActiveConnectionAsync(userId);

        var pd = await commerce.GetProductDetailAsync(productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        return await aiService.GenerateProductImageAsync(pd.Title, pd.Category, pd.Description, style);
    }

    public async Task<object?> GenerateProductImagesAsync(Guid userId, string productId)
    {
        await GetActiveConnectionAsync(userId);

        var pd = await commerce.GetProductDetailAsync(productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        return await aiService.GenerateProductImagesAsync(pd.Title, pd.Category, pd.Description);
    }

    public async Task<object?> GetProductBundlesAsync(Guid userId, string productId)
    {
        var conn = await GetActiveConnectionAsync(userId);
        var doc = await commerce.ProxyGetAsync(conn.CommerceAccessToken, $"/api/seller/products/{productId}/bundles");
        return doc?.RootElement;
    }

    public async Task<object?> GenerateBundleRecommendationsAsync(Guid userId, string productId, bool forceRegenerate = false)
    {
        var conn = await GetActiveConnectionAsync(userId);

        // Fetch primary product and all seller candidates from commerce-api
        var pd = await commerce.GetProductDetailAsync(productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var allProducts = await commerce.GetSellerProductsAsync(conn.CommerceAccessToken);

        var primary = new AiBundleCandidate(
            pd.Id, pd.Title, pd.Category, (double)pd.Price,
            pd.Description,
            pd.Features?.Values.ToList() ?? []);

        var candidateProducts = allProducts
            .Where(p => p.Id != productId && p.Stock > 0)
            .ToList();

        var candidates = candidateProducts
            .Select(p => new AiBundleCandidate(
                p.Id, p.Title, p.Category, (double)p.Price,
                null, []))
            .ToList();

        if (candidates.Count == 0)
        {
            return new
            {
                recommendations = Array.Empty<object>(),
                missingOpportunity = new
                {
                    title = "Eksik Fırsat",
                    message = "Mağazada tamamlayıcı ürün bulunmuyor. Paket önerisi için önce stokta olan farklı bir ürün ekleyebilirsin.",
                    suggestedProductIdeas = Array.Empty<string>(),
                },
                _mock = false,
                _cached = false,
            };
        }

        var sellerKey = string.IsNullOrWhiteSpace(conn.CommerceSellerId)
            ? userId.ToString("N")
            : conn.CommerceSellerId;
        var productListHash = BuildBundleCacheHash(pd, candidateProducts);

        if (!forceRegenerate)
        {
            var cached = await db.BundleRecommendationCaches
                .FirstOrDefaultAsync(c =>
                    c.SellerKey == sellerKey &&
                    c.PrimaryProductId == productId &&
                    c.ProductListHash == productListHash &&
                    c.ExpiresAt > DateTime.UtcNow);

            if (cached is not null)
            {
                cached.LastUsedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();

                var cachedNode = JsonNode.Parse(cached.ResponseJson) ?? new JsonObject();
                if (cachedNode is JsonObject cachedObject)
                    cachedObject["_cached"] = true;
                return cachedNode;
            }
        }

        var aiResult = await aiService.GenerateBundleRecommendationsAsync(primary, candidates);
        if (aiResult is null) return null;

        // Map ai response → frontend BundleRecommendationResponse shape
        var productMap = allProducts.ToDictionary(p => p.Id);

        var recommendations = aiResult.Recommendations
            .Where(r => productMap.ContainsKey(r.ComplementaryProductId))
            .GroupBy(r => r.ComplementaryProductId)
            .Select(g => g.OrderByDescending(r => r.SemanticScore).First())
            .OrderByDescending(r => r.SemanticScore)
            .Take(3)
            .Select(r =>
            {
                var comp = productMap[r.ComplementaryProductId];
                var originalTotal = pd.Price + comp.Price;
                var discountAmount = Math.Round(originalTotal * BundleRecommendationDiscountPercent / 100m, 2);
                return new
                {
                    primaryProduct = new
                    {
                        id = pd.Id, title = pd.Title, brand = pd.Brand,
                        category = pd.Category, price = pd.Price, stock = pd.Stock,
                        image = pd.Images?.FirstOrDefault() ?? "",
                    },
                    complementaryProduct = new
                    {
                        id = comp.Id, title = comp.Title, brand = "",
                        category = comp.Category, price = comp.Price, stock = comp.Stock,
                        image = comp.PrimaryImage,
                    },
                    suggestedTitle = r.BundleTitle,
                    suggestedShortDescription = r.BundleShortDescription,
                    suggestedCampaignText = r.BundleCampaignText,
                    suggestedCtaLabel = r.CtaLabel,
                    suggestedDiscountPercent = BundleRecommendationDiscountPercent,
                    recommendationReason = r.WhyTogether,
                    score = r.SemanticScore,
                    originalTotal,
                    discountAmount,
                    bundleTotal = originalTotal - discountAmount,
                };
            }).ToList();

        object? missingOpportunity = recommendations.Count == 0 && aiResult.MissingOpportunityNote is not null
            ? new
            {
                title = "Eksik Fırsat",
                message = aiResult.MissingOpportunityNote,
                suggestedProductIdeas = new List<string>(),
            }
            : null;

        var response = new { recommendations, missingOpportunity, _mock = aiResult.Mock, _cached = false };

        if (!aiResult.Mock)
            await SaveBundleRecommendationCacheAsync(sellerKey, productId, productListHash, response);

        return response;
    }

    public async Task<object?> CreateProductBundleAsync(Guid userId, string productId, object body)
    {
        var conn = await GetActiveConnectionAsync(userId);
        var doc = await commerce.ProxyPostAsync(conn.CommerceAccessToken, $"/api/seller/products/{productId}/bundles", body);
        return doc?.RootElement;
    }

    public async Task<object?> UpdateProductBundleAsync(Guid userId, string productId, Guid bundleId, object body)
    {
        var conn = await GetActiveConnectionAsync(userId);
        var doc = await commerce.ProxyPutAsync(conn.CommerceAccessToken, $"/api/seller/products/{productId}/bundles/{bundleId}", body);
        return doc?.RootElement;
    }

    public async Task<object?> PublishProductBundleAsync(Guid userId, string productId, Guid bundleId, object body)
    {
        var conn = await GetActiveConnectionAsync(userId);
        var doc = await commerce.ProxyPostAsync(conn.CommerceAccessToken, $"/api/seller/products/{productId}/bundles/{bundleId}/publish", body);
        return doc?.RootElement;
    }

    public async Task<object?> ArchiveProductBundleAsync(Guid userId, string productId, Guid bundleId)
    {
        var conn = await GetActiveConnectionAsync(userId);
        var doc = await commerce.ProxyPostAsync(conn.CommerceAccessToken, $"/api/seller/products/{productId}/bundles/{bundleId}/archive", new { });
        return doc?.RootElement;
    }

    private async Task<SellerStoreConnection> GetActiveConnectionAsync(Guid userId)
    {
        return await db.StoreConnections
            .FirstOrDefaultAsync(sc => sc.ZekaiUserId == userId && sc.Status == "connected")
            ?? throw new InvalidOperationException("Bağlı mağaza bulunamadı. Önce mağazanızı bağlayın.");
    }

    private static string BuildBundleCacheHash(CommerceProductDetailDto primary, List<CommerceProductDto> candidates)
    {
        var signature = new
        {
            primary = new
            {
                primary.Id,
                primary.Title,
                primary.Category,
                primary.Price,
                primary.Stock,
                features = primary.Features?
                    .OrderBy(kv => kv.Key)
                    .Select(kv => new { kv.Key, kv.Value })
                    .ToList(),
            },
            discountPolicyVersion = BundleRecommendationDiscountPolicyVersion,
            candidates = candidates
                .OrderBy(c => c.Id)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.Category,
                    c.Price,
                    c.Stock,
                    c.IsPublished,
                    c.UpdatedAt,
                })
                .ToList(),
        };

        var json = JsonSerializer.Serialize(signature);
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(json))).ToLowerInvariant();
    }

    private async Task SaveBundleRecommendationCacheAsync(string sellerKey, string productId, string productListHash, object response)
    {
        var now = DateTime.UtcNow;
        var responseJson = JsonSerializer.Serialize(response);
        var existing = await db.BundleRecommendationCaches.FirstOrDefaultAsync(c =>
            c.SellerKey == sellerKey &&
            c.PrimaryProductId == productId &&
            c.ProductListHash == productListHash);

        if (existing is null)
        {
            db.BundleRecommendationCaches.Add(new BundleRecommendationCache
            {
                SellerKey = sellerKey,
                PrimaryProductId = productId,
                ProductListHash = productListHash,
                ResponseJson = responseJson,
                CreatedAt = now,
                UpdatedAt = now,
                ExpiresAt = now.Add(BundleRecommendationCacheTtl),
            });
        }
        else
        {
            existing.ResponseJson = responseJson;
            existing.UpdatedAt = now;
            existing.ExpiresAt = now.Add(BundleRecommendationCacheTtl);
            existing.LastUsedAt = null;
        }

        await db.SaveChangesAsync();
    }
}
