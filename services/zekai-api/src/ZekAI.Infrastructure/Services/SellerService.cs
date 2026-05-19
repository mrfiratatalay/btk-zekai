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
    private const string ContentModel = "gemini-2.5-flash-lite";
    private const string SocialModel = "gemini-2.5-flash-lite";
    private const string SimulationModel = "gemini-2.5-flash-lite";
    private const string SimulationInputVersion = "reviews-aware-v3";
    private const string BundleModel = "gemini-2.5-flash-lite";
    private const string ImageModel = "gemini-3.1-flash-image-preview";

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
        return await commerce.GetSellerProductDetailAsync(conn.CommerceAccessToken, productId);
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

    public async Task<List<AiArtifactDto>> GetAllAiArtifactsAsync(Guid userId)
    {
        var artifacts = await db.SellerAiArtifacts
            .Where(a => a.UserId == userId && a.Status == "ready")
            .OrderByDescending(a => a.UpdatedAt)
            .ToListAsync();
        return artifacts.Select(ToArtifactDto).ToList();
    }

    public async Task<List<AiArtifactDto>> GetProductAiArtifactsAsync(Guid userId, string productId)
    {
        var artifacts = await db.SellerAiArtifacts
            .Where(a => a.UserId == userId && a.CommerceProductId == productId && a.Status == "ready")
            .OrderByDescending(a => a.UpdatedAt)
            .ToListAsync();
        return artifacts.Select(ToArtifactDto).ToList();
    }

    public async Task<bool> DeleteAiArtifactAsync(Guid userId, Guid artifactId)
    {
        var artifact = await db.SellerAiArtifacts
            .FirstOrDefaultAsync(a => a.Id == artifactId && a.UserId == userId);
        if (artifact is null) return false;
        artifact.Status = "archived";
        artifact.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreAiArtifactAsync(Guid userId, Guid artifactId)
    {
        var artifact = await db.SellerAiArtifacts
            .FirstOrDefaultAsync(a => a.Id == artifactId && a.UserId == userId);
        if (artifact is null) return false;
        artifact.Status = "ready";
        artifact.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<List<ProductDraftDto>> GetProductDraftsAsync(Guid userId, string productId)
    {
        var drafts = await db.SellerProductDrafts
            .Where(d => d.UserId == userId && d.CommerceProductId == productId && d.Status == "ready")
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
        return drafts.Select(ToDto).ToList();
    }

    public async Task<List<ProductDraftDto>> GetAllDraftsAsync(Guid userId)
    {
        var drafts = await db.SellerProductDrafts
            .Where(d => d.UserId == userId && d.Status == "ready")
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
        return drafts.Select(ToDto).ToList();
    }

    public async Task<bool> DeleteDraftAsync(Guid userId, Guid draftId)
    {
        var draft = await db.SellerProductDrafts
            .FirstOrDefaultAsync(d => d.Id == draftId && d.UserId == userId);
        if (draft is null) return false;
        draft.Status = "archived";
        draft.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreDraftAsync(Guid userId, Guid draftId)
    {
        var draft = await db.SellerProductDrafts
            .FirstOrDefaultAsync(d => d.Id == draftId && d.UserId == userId);
        if (draft is null) return false;
        draft.Status = "ready";
        draft.UpdatedAt = DateTime.UtcNow;
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
        d.Source,
        string.IsNullOrWhiteSpace(d.AiModel) ? null : d.AiModel,
        d.CreatedAt
    );

    // ── Sosyal Medya Taslakları ───────────────────────────────────────────
    // Markete gitmez; localStorage yerine DB'de saklanan varyasyonlar.

    public async Task<List<SocialDraftDto>> GetProductSocialDraftsAsync(Guid userId, string productId)
    {
        var drafts = await db.SellerSocialDrafts
            .Where(d => d.UserId == userId && d.CommerceProductId == productId && d.Status == "ready")
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
        return drafts.Select(ToSocialDto).ToList();
    }

    public async Task<SocialDraftDto> SaveSocialDraftAsync(Guid userId, string productId, SaveSocialDraftRequest req)
    {
        await GetOwnedProductDetailAsync(userId, productId);

        var platforms = (req.Platforms ?? [])
            .Select(p => (p ?? "").Trim().ToLowerInvariant() == "x" ? "twitter" : (p ?? "").Trim().ToLowerInvariant())
            .Where(p => p is "instagram" or "tiktok" or "twitter")
            .Distinct()
            .ToList();
        if (platforms.Count == 0) platforms = ["instagram"];

        var now = DateTime.UtcNow;
        var contentJson = JsonSerializer.Serialize(req.Content, DraftJsonOpts);
        var draft = new SellerSocialDraft
        {
            UserId = userId,
            CommerceProductId = productId,
            Label = string.IsNullOrWhiteSpace(req.Label) ? $"Onayli sosyal icerik - {now:dd.MM HH:mm}" : req.Label.Trim(),
            Tone = string.IsNullOrWhiteSpace(req.Tone) ? "samimi" : req.Tone.Trim(),
            Purpose = string.IsNullOrWhiteSpace(req.Purpose) ? "guven" : req.Purpose.Trim(),
            PlatformsJson = JsonSerializer.Serialize(platforms, DraftJsonOpts),
            ContentJson = contentJson,
            InputHash = $"manual:{Guid.NewGuid():N}",
            AiModel = "seller-edited",
            Source = "manual",
            IsActive = req.Activate,
            Status = "ready",
            CreatedAt = now,
            UpdatedAt = now,
        };

        if (req.Activate)
        {
            var siblings = await db.SellerSocialDrafts
                .Where(d => d.UserId == userId && d.CommerceProductId == productId && d.Status == "ready")
                .ToListAsync();
            foreach (var sibling in siblings) sibling.IsActive = false;
        }

        db.SellerSocialDrafts.Add(draft);
        await db.SaveChangesAsync();
        return ToSocialDto(draft);
    }

    public async Task<List<SocialDraftDto>> GetAllSocialDraftsAsync(Guid userId)
    {
        var drafts = await db.SellerSocialDrafts
            .Where(d => d.UserId == userId && d.Status == "ready")
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
        return drafts.Select(ToSocialDto).ToList();
    }

    public async Task<bool> DeleteSocialDraftAsync(Guid userId, Guid draftId)
    {
        var draft = await db.SellerSocialDrafts
            .FirstOrDefaultAsync(d => d.Id == draftId && d.UserId == userId);
        if (draft is null) return false;
        draft.Status = "archived";
        draft.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreSocialDraftAsync(Guid userId, Guid draftId)
    {
        var draft = await db.SellerSocialDrafts
            .FirstOrDefaultAsync(d => d.Id == draftId && d.UserId == userId);
        if (draft is null) return false;
        draft.Status = "ready";
        draft.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    /// <summary>Bir varyasyonu ürün için "Aktif" işaretler (diğerlerini pasifleştirir).</summary>
    public async Task<bool> SetActiveSocialDraftAsync(Guid userId, Guid draftId)
    {
        var draft = await db.SellerSocialDrafts
            .FirstOrDefaultAsync(d => d.Id == draftId && d.UserId == userId);
        if (draft is null) return false;

        var siblings = await db.SellerSocialDrafts
            .Where(d => d.UserId == userId && d.CommerceProductId == draft.CommerceProductId)
            .ToListAsync();
        foreach (var s in siblings) s.IsActive = s.Id == draftId;

        await db.SaveChangesAsync();
        return true;
    }

    private static SocialDraftDto ToSocialDto(SellerSocialDraft d) => new(
        d.Id,
        d.CommerceProductId,
        d.Label,
        d.Tone,
        d.Purpose,
        JsonSerializer.Deserialize<List<string>>(d.PlatformsJson, DraftJsonOpts) ?? new(),
        JsonDocument.Parse(string.IsNullOrWhiteSpace(d.ContentJson) ? "{}" : d.ContentJson).RootElement.Clone(),
        d.IsActive,
        d.Source,
        string.IsNullOrWhiteSpace(d.AiModel) ? null : d.AiModel,
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

    private async Task<(SellerStoreConnection Conn, CommerceProductDetailDto Product)> GetOwnedProductDetailAsync(
        Guid userId,
        string productId)
    {
        var conn = await GetActiveConnectionAsync(userId);
        var product = await commerce.GetSellerProductDetailAsync(conn.CommerceAccessToken, productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");
        return (conn, product);
    }

    public async Task<object?> GenerateSocialContentAsync(Guid userId, string productId, object body)
    {
        var conn = await GetActiveConnectionAsync(userId);

        // Seller-owned detail endpoint returns unpublished products too.
        var pd = await commerce.GetSellerProductDetailAsync(conn.CommerceAccessToken, productId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        var features = pd.Features?.Values.ToList() ?? [];

        // Üretim ayarlarını body'den parse et
        var tone = "samimi";
        if (body is JsonElement bodyEl && bodyEl.TryGetProperty("tone", out var toneEl))
            tone = toneEl.GetString() ?? "samimi";
        var purpose = "guven";
        if (body is JsonElement purposeBodyEl && purposeBodyEl.TryGetProperty("purpose", out var purposeEl))
            purpose = purposeEl.GetString() ?? "guven";
        string? note = null;
        if (body is JsonElement noteBodyEl && noteBodyEl.TryGetProperty("note", out var noteEl))
            note = noteEl.GetString()?.Trim();
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
        var inputHash = BuildHash(new
        {
            type = "social_content",
            product = ProductSignature(pd),
            tone,
            purpose,
            note,
            platforms = platforms.OrderBy(p => p).ToList(),
        });
        var cachedDraft = await db.SellerSocialDrafts
            .Where(d => d.UserId == userId && d.CommerceProductId == productId && d.InputHash == inputHash)
            .OrderByDescending(d => d.UpdatedAt)
            .FirstOrDefaultAsync();
        if (cachedDraft is not null)
        {
            cachedDraft.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return AddMetadataToJson(cachedDraft.ContentJson, cachedDraft.Id, cached: true);
        }

        var aiResult = await aiService.GenerateSocialContentAsync(
            pd.Title, pd.Category, pd.Price, pd.Description, features, tone, purpose, platforms, note);

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
            var mockPayload = new
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
            var mockDraft = await SaveGeneratedSocialDraftAsync(userId, productId, tone, purpose, platforms, mockPayload, inputHash, "mock");
            return AddMetadataToJson(JsonSerializer.Serialize(mockPayload, DraftJsonOpts), mockDraft.Id, cached: false);
        }

        var contentJson = saved?.RootElement.GetRawText()
            ?? JsonSerializer.Serialize(new
            {
                tone,
                purpose,
                platforms,
                instagram = aiResult.Instagram,
                tiktok = aiResult.Tiktok,
                twitter = aiResult.Twitter,
                generatedAt = DateTime.UtcNow,
                _mock = false,
            }, DraftJsonOpts);
        var draft = await SaveGeneratedSocialDraftAsync(userId, productId, tone, purpose, platforms, contentJson, inputHash, "gemini");
        return AddMetadataToJson(contentJson, draft.Id, cached: false);
    }

    public async Task<object?> GenerateAiContentAsync(Guid userId, string productId, SimulationInsightDto? simulationInsight = null)
    {
        var (_, pd) = await GetOwnedProductDetailAsync(userId, productId);

        var features = pd.Features?.Values.ToList() ?? [];
        var imageUrl = pd.Images?.FirstOrDefault();
        var inputHash = BuildHash(new
        {
            type = "product_content",
            product = ProductSignature(pd),
            imageUrl,
            simulationInsight,
        });
        var cachedDraft = await db.SellerProductDrafts
            .Where(d => d.UserId == userId && d.CommerceProductId == productId && d.InputHash == inputHash)
            .OrderByDescending(d => d.UpdatedAt)
            .FirstOrDefaultAsync();
        if (cachedDraft is not null)
        {
            cachedDraft.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            var cachedFeatures = JsonSerializer.Deserialize<Dictionary<string, string>>(cachedDraft.FeaturesJson, DraftJsonOpts) ?? new();
            return new
            {
                title = cachedDraft.Title,
                shortDescription = cachedDraft.ShortDescription,
                description = cachedDraft.Description,
                features = cachedFeatures.Values.ToList(),
                whatIImproved = "Kayıtlı AI taslağı tekrar kullanıldı.",
                _mock = false,
                _cached = true,
                draftId = cachedDraft.Id,
            };
        }

        var aiResult = await aiService.GenerateProductContentAsync(
            pd.Title, pd.Category, pd.Price, pd.Description, features, imageUrl, simulationInsight);

        if (aiResult is null) return null;

        var draft = await SaveGeneratedProductDraftAsync(userId, productId, pd, aiResult, inputHash);
        return new
        {
            aiResult.Title,
            aiResult.ShortDescription,
            aiResult.Description,
            aiResult.Features,
            aiResult.WhatIImproved,
            _mock = aiResult.Mock,
            _cached = false,
            draftId = draft.Id,
        };
    }

    public async Task<object?> GenerateSeoAsync(Guid userId, string productId)
    {
        var (_, pd) = await GetOwnedProductDetailAsync(userId, productId);

        var features = pd.Features?.Values.ToList() ?? [];
        var inputHash = BuildHash(new { type = "seo", product = ProductSignature(pd), brand = pd.Brand });
        var cached = await GetReadyArtifactAsync(userId, productId, "seo", inputHash);
        if (cached is not null) return await MarkArtifactUsedAsync(cached, cached: true);

        var aiResult = await aiService.GenerateSeoAsync(
            pd.Title, pd.Category, pd.Price, pd.Description, features, pd.Brand);
        if (aiResult is null) return null;

        var artifact = await SaveAiArtifactAsync(
            userId, productId, "seo", "SEO Optimizasyonu", inputHash, aiResult,
            "gemini-2.5-flash-lite", aiResult.Mock ? "mock" : "gemini");
        return await MarkArtifactUsedAsync(artifact, cached: false);
    }

    public async Task<object?> SimulateProductAsync(Guid userId, string productId)
    {
        var (_, pd) = await GetOwnedProductDetailAsync(userId, productId);

        var features = pd.Features?.Values.ToList() ?? [];
        var reviews = await GetSimulationReviewsAsync(productId);

        var inputHash = BuildHash(new { type = "simulation", version = SimulationInputVersion, product = ProductSignature(pd), reviews });
        var cached = await GetReadyArtifactAsync(userId, productId, "simulation", inputHash);
        if (cached is not null) return await MarkArtifactUsedAsync(cached, cached: true);

        var result = await aiService.SimulateProductAsync(pd.Title, pd.Category, pd.Price, pd.Description, features, reviews);
        if (result is null) return null;
        var artifact = await SaveAiArtifactAsync(
            userId, productId, "simulation", "Müşteri Simülasyonu", inputHash, result, SimulationModel, result.Mock ? "mock" : "gemini");
        return await MarkArtifactUsedAsync(artifact, cached: false);
    }

    public async Task<SimulationProductPayload> GetSimulationPayloadAsync(Guid userId, string productId)
    {
        var (_, pd) = await GetOwnedProductDetailAsync(userId, productId);

        var features = pd.Features?.Values.ToList() ?? [];
        var reviews = await GetSimulationReviewsAsync(productId);

        return new SimulationProductPayload(pd.Title, pd.Category, pd.Price, pd.Description, features, reviews);
    }

    public async Task<AiArtifactDto?> GetCachedSimulationArtifactAsync(Guid userId, string productId)
    {
        var (_, pd) = await GetOwnedProductDetailAsync(userId, productId);
        var reviews = await GetSimulationReviewsAsync(productId);
        var inputHash = BuildHash(new { type = "simulation", version = SimulationInputVersion, product = ProductSignature(pd), reviews });
        var cached = await GetReadyArtifactAsync(userId, productId, "simulation", inputHash);
        if (cached is null) return null;
        cached.LastUsedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return ToArtifactDto(cached);
    }

    public async Task<AiArtifactDto> SaveSimulationArtifactAsync(Guid userId, string productId, object payload)
    {
        var (_, pd) = await GetOwnedProductDetailAsync(userId, productId);
        var reviews = await GetSimulationReviewsAsync(productId);
        var inputHash = BuildHash(new { type = "simulation", version = SimulationInputVersion, product = ProductSignature(pd), reviews });
        var source = PayloadIsMock(payload) ? "mock" : "gemini";
        var artifact = await SaveAiArtifactAsync(
            userId, productId, "simulation", "Müşteri Simülasyonu", inputHash, payload, SimulationModel, source);
        return ToArtifactDto(artifact);
    }

    public async Task<object?> GenerateProductImageAsync(Guid userId, string productId, string style)
    {
        var (conn, pd) = await GetOwnedProductDetailAsync(userId, productId);

        var normalizedStyle = string.IsNullOrWhiteSpace(style) ? "studio" : style.Trim().ToLowerInvariant();
        var inputHash = BuildHash(new { type = "image_generation", product = ProductSignature(pd), style = normalizedStyle });
        var cached = await GetReadyArtifactAsync(userId, productId, "image_generation", inputHash);
        if (cached is not null) return await MarkArtifactUsedAsync(cached, cached: true);

        var result = await aiService.GenerateProductImageAsync(pd.Title, pd.Category, pd.Description, normalizedStyle);
        if (result is null) return null;
        var artifact = await SaveAiArtifactAsync(
            userId, productId, "image_generation", $"AI Görsel · {normalizedStyle}", inputHash, result, ImageModel, result.Mock ? "mock" : "gemini");

        // Eksik parça: üretilen görseli, ürünün en güncel otomatik içerik taslağına da iliştir.
        // Storage'a yazılır + ImagesJson'a (aynı stil varsa üzerine) eklenir. Taslak yoksa atlanır
        // (görsel zaten artifact olarak saklanıyor).
        await AttachGeneratedImageToLatestDraftAsync(
            userId, productId, conn.CommerceAccessToken,
            result.ImageBase64, result.MimeType, normalizedStyle);

        return await MarkArtifactUsedAsync(artifact, cached: false);
    }

    private async Task AttachGeneratedImageToLatestDraftAsync(
        Guid userId, string productId, string commerceToken,
        string imageBase64, string mimeType, string style)
    {
        if (string.IsNullOrWhiteSpace(imageBase64)) return;

        var latest = await db.SellerProductDrafts
            .Where(d => d.UserId == userId && d.CommerceProductId == productId)
            .OrderByDescending(d => d.UpdatedAt)
            .FirstOrDefaultAsync();
        if (latest is null) return;

        var doc = await commerce.ProxyPostAsync(
            commerceToken,
            $"/api/seller/products/{productId}/draft-image",
            new { imageBase64, mimeType });
        var url = doc?.RootElement.TryGetProperty("imageUrl", out var u) == true ? u.GetString() : null;
        if (string.IsNullOrWhiteSpace(url)) return;

        var images = JsonSerializer.Deserialize<List<DraftImageDto>>(latest.ImagesJson, DraftJsonOpts) ?? new();
        var label = style switch
        {
            "unboxing" => "Kutu Açma",
            "lifestyle" => "Kullanım",
            _ => "Stüdyo",
        };
        images.RemoveAll(i => i.Type == style);
        images.Add(new DraftImageDto(style, label, url!));
        latest.ImagesJson = JsonSerializer.Serialize(images, DraftJsonOpts);
        latest.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    public async Task<object?> GenerateProductImagesAsync(Guid userId, string productId)
    {
        var (_, pd) = await GetOwnedProductDetailAsync(userId, productId);

        var inputHash = BuildHash(new { type = "image_generation", product = ProductSignature(pd), style = "all" });
        var cached = await GetReadyArtifactAsync(userId, productId, "image_generation", inputHash);
        if (cached is not null) return await MarkArtifactUsedAsync(cached, cached: true);

        var result = await aiService.GenerateProductImagesAsync(pd.Title, pd.Category, pd.Description);
        if (result is null) return null;
        var artifact = await SaveAiArtifactAsync(
            userId, productId, "image_generation", "AI Görsel Seti", inputHash, result, ImageModel, result.Mock ? "mock" : "gemini");
        return await MarkArtifactUsedAsync(artifact, cached: false);
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

        // Fetch primary product and all seller candidates from commerce-api.
        var pd = await commerce.GetSellerProductDetailAsync(conn.CommerceAccessToken, productId)
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
            var artifact = await GetReadyArtifactAsync(userId, productId, "bundle_recommendation", productListHash);
            if (artifact is not null) return await MarkArtifactUsedAsync(artifact, cached: true);

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
                {
                    cachedObject["_cached"] = true;
                    var cacheArtifact = await SaveAiArtifactAsync(
                        userId, productId, "bundle_recommendation", "Birlikte Sat Kampanyası", productListHash, cachedObject, BundleModel, "cache");
                    cachedObject["artifactId"] = cacheArtifact.Id;
                }
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

        var savedArtifact = await SaveAiArtifactAsync(
            userId, productId, "bundle_recommendation", "Birlikte Sat Kampanyası", productListHash, response, BundleModel, aiResult.Mock ? "mock" : "gemini");
        return AddMetadataToJson(JsonSerializer.Serialize(response, DraftJsonOpts), savedArtifact.Id, cached: false);

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

    private async Task<SellerProductDraft> SaveGeneratedProductDraftAsync(
        Guid userId,
        string productId,
        CommerceProductDetailDto pd,
        AiContentResult aiResult,
        string inputHash)
    {
        var now = DateTime.UtcNow;
        var existing = await db.SellerProductDrafts
            .FirstOrDefaultAsync(d => d.UserId == userId && d.CommerceProductId == productId && d.InputHash == inputHash);

        var featureRecord = aiResult.Features
            .Select((value, index) => new { key = index.ToString(), value })
            .ToDictionary(x => x.key, x => x.value);
        var images = (pd.Images ?? [])
            .Take(1)
            .Select(url => new DraftImageDto("current", "Mevcut", url))
            .ToList();

        var draft = existing ?? new SellerProductDraft
        {
            UserId = userId,
            CommerceProductId = productId,
            InputHash = inputHash,
            CreatedAt = now,
        };

        draft.Label = $"AI İçerik · {now:dd.MM HH:mm}";
        draft.Title = aiResult.Title;
        draft.ShortDescription = aiResult.ShortDescription;
        draft.Description = aiResult.Description;
        draft.FeaturesJson = JsonSerializer.Serialize(featureRecord, DraftJsonOpts);
        draft.Price = pd.Price;
        draft.OriginalPrice = pd.OriginalPrice;
        draft.Stock = pd.Stock;
        draft.Brand = pd.Brand;
        draft.CargoText = pd.CargoText ?? "";
        draft.CategoryId = CategoryIdFromName(pd.Category);
        draft.ImagesJson = JsonSerializer.Serialize(images, DraftJsonOpts);
        draft.AiModel = ContentModel;
        draft.Source = aiResult.Mock ? "mock" : "gemini";
        draft.UpdatedAt = now;

        if (existing is null) db.SellerProductDrafts.Add(draft);
        await db.SaveChangesAsync();
        return draft;
    }

    private async Task<SellerSocialDraft> SaveGeneratedSocialDraftAsync(
        Guid userId,
        string productId,
        string tone,
        string purpose,
        List<string> platforms,
        object content,
        string inputHash,
        string source)
    {
        var now = DateTime.UtcNow;
        var contentJson = content is string s ? s : JsonSerializer.Serialize(content, DraftJsonOpts);
        var existing = await db.SellerSocialDrafts
            .FirstOrDefaultAsync(d => d.UserId == userId && d.CommerceProductId == productId && d.InputHash == inputHash);
        var draft = existing ?? new SellerSocialDraft
        {
            UserId = userId,
            CommerceProductId = productId,
            InputHash = inputHash,
            CreatedAt = now,
        };

        draft.Label = $"Sosyal AI · {now:dd.MM HH:mm}";
        draft.Tone = tone;
        draft.Purpose = purpose;
        draft.PlatformsJson = JsonSerializer.Serialize(platforms, DraftJsonOpts);
        draft.ContentJson = contentJson;
        draft.AiModel = SocialModel;
        draft.Source = source;
        draft.UpdatedAt = now;

        if (existing is null) db.SellerSocialDrafts.Add(draft);
        await db.SaveChangesAsync();
        return draft;
    }

    private async Task<SellerAiArtifact?> GetReadyArtifactAsync(Guid userId, string productId, string artifactType, string inputHash)
    {
        return await db.SellerAiArtifacts
            .Where(a =>
                a.UserId == userId &&
                a.CommerceProductId == productId &&
                a.ArtifactType == artifactType &&
                a.InputHash == inputHash &&
                a.Status == "ready")
            .OrderByDescending(a => a.UpdatedAt)
            .FirstOrDefaultAsync();
    }

    private async Task<SellerAiArtifact> SaveAiArtifactAsync(
        Guid userId,
        string productId,
        string artifactType,
        string label,
        string inputHash,
        object payload,
        string model,
        string source)
    {
        var now = DateTime.UtcNow;
        var payloadJson = payload is string s ? s : JsonSerializer.Serialize(payload, DraftJsonOpts);
        var existing = await db.SellerAiArtifacts.FirstOrDefaultAsync(a =>
            a.UserId == userId &&
            a.CommerceProductId == productId &&
            a.ArtifactType == artifactType &&
            a.InputHash == inputHash);

        var artifact = existing ?? new SellerAiArtifact
        {
            UserId = userId,
            CommerceProductId = productId,
            ArtifactType = artifactType,
            InputHash = inputHash,
            CreatedAt = now,
        };

        artifact.Label = label;
        artifact.PayloadJson = payloadJson;
        artifact.AiModel = model;
        artifact.Source = source;
        artifact.Status = "ready";
        artifact.UpdatedAt = now;
        artifact.LastUsedAt = null;

        if (existing is null) db.SellerAiArtifacts.Add(artifact);
        await db.SaveChangesAsync();
        return artifact;
    }

    private async Task<JsonElement> MarkArtifactUsedAsync(SellerAiArtifact artifact, bool cached)
    {
        artifact.LastUsedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return AddMetadataToJson(artifact.PayloadJson, artifact.Id, cached);
    }

    private static JsonElement AddMetadataToJson(string json, Guid id, bool cached)
    {
        var node = JsonNode.Parse(string.IsNullOrWhiteSpace(json) ? "{}" : json) ?? new JsonObject();
        if (node is not JsonObject obj) obj = new JsonObject { ["value"] = node.DeepClone() };
        obj["artifactId"] = id;
        obj["draftId"] = id;
        obj["_cached"] = cached;
        return JsonDocument.Parse(obj.ToJsonString()).RootElement.Clone();
    }

    private static AiArtifactDto ToArtifactDto(SellerAiArtifact artifact) => new(
        artifact.Id,
        artifact.CommerceProductId,
        artifact.ArtifactType,
        artifact.Label,
        JsonDocument.Parse(string.IsNullOrWhiteSpace(artifact.PayloadJson) ? "{}" : artifact.PayloadJson).RootElement.Clone(),
        artifact.AiModel,
        artifact.Source,
        artifact.Status,
        artifact.CreatedAt,
        artifact.UpdatedAt,
        artifact.LastUsedAt
    );

    private static object ProductSignature(CommerceProductDetailDto pd) => new
    {
        pd.Id,
        pd.Title,
        pd.Category,
        pd.Price,
        pd.OriginalPrice,
        pd.Stock,
        pd.Description,
        features = pd.Features?.OrderBy(kv => kv.Key).ToList(),
        images = pd.Images?.OrderBy(x => x).ToList(),
    };

    private async Task<List<SimulationReviewDto>> GetSimulationReviewsAsync(string productId)
    {
        var reviews = await commerce.GetProductReviewsAsync(productId);
        return reviews
            .OrderByDescending(r => r.VerifiedPurchase)
            .ThenByDescending(r => r.Rating < 5 ? 1 : 0)
            .ThenByDescending(r => r.Id)
            .Take(12)
            .Select(r => new SimulationReviewDto(
                r.AuthorName,
                r.Rating,
                r.Title,
                r.Text,
                r.VerifiedPurchase))
            .ToList();
    }

    private static string BuildHash(object value)
    {
        var json = JsonSerializer.Serialize(value, DraftJsonOpts);
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(json))).ToLowerInvariant();
    }

    private static int CategoryIdFromName(string? category) => category?.Trim().ToLowerInvariant() switch
    {
        "elektronik" => 1,
        "spor & outdoor" => 2,
        "mutfak" => 3,
        "ev & yaşam" => 4,
        "ev & yasam" => 4,
        "aksesuar" => 5,
        "anne & bebek" => 6,
        _ => 1,
    };

    private static bool PayloadIsMock(object payload)
    {
        var node = JsonSerializer.SerializeToNode(payload, DraftJsonOpts);
        return node is JsonObject obj &&
               obj.TryGetPropertyValue("_mock", out var mockNode) &&
               mockNode?.GetValue<bool>() == true;
    }
}
