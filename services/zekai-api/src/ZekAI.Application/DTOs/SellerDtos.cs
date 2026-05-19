namespace ZekAI.Application.DTOs;

public record StoreConnectRequest(string Platform, string ApiKey, string? StoreName = null);

// Matches the frontend StoreConnection interface
public record StoreConnectionDto(
    Guid Id,
    string Platform,
    string StoreName,
    string Status,
    DateTime? LastSyncAt,
    int ProductCount,
    bool HasApiKey
);

public record PublishRequest(bool Published);
public record UpdateProductImageRequest(string ImageBase64, string MimeType);
public record BundleRecommendationRequest(bool Force = false);
public record AiArtifactDto(
    Guid Id,
    string CommerceProductId,
    string ArtifactType,
    string Label,
    System.Text.Json.JsonElement Payload,
    string AiModel,
    string Source,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? LastUsedAt
);

// Payload passed to ai-service for simulation stream
public record SimulationInsightDto(
    int BuyCount,
    int SkipCount,
    int UndecidedCount,
    List<string> SkipperReasons,
    List<string> UndecidedConcerns,
    List<string> Recommendations
);

public record AiContentRequest(SimulationInsightDto? SimulationInsight);

public record AiImageRequest(string? Style);

public record SimulationReviewDto(
    string AuthorName,
    int Rating,
    string Title,
    string Text,
    bool VerifiedPurchase
);

public record SimulationProductPayload(
    string ProductTitle,
    string Category,
    decimal Price,
    string? Description,
    List<string> Features,
    List<SimulationReviewDto> Reviews
);

// ── Seller Product Drafts ────────────────────────────────────────────────

public record DraftImageDto(string Type, string Label, string Url);

public record ProductDraftDto(
    Guid Id,
    string CommerceProductId,
    string Label,
    string Title,
    string ShortDescription,
    string Description,
    Dictionary<string, string> Features,
    decimal Price,
    decimal? OriginalPrice,
    int Stock,
    string Brand,
    string CargoText,
    int CategoryId,
    List<DraftImageDto> Images,
    string Source,
    string? AiModel,
    DateTime CreatedAt
);

// ── Sosyal Medya Taslakları (markete gitmez; varyasyon saklama) ──────────

public record SocialDraftDto(
    Guid Id,
    string CommerceProductId,
    string Label,
    string Tone,
    string Purpose,
    List<string> Platforms,
    System.Text.Json.JsonElement Content,
    bool IsActive,
    string Source,
    string? AiModel,
    DateTime CreatedAt
);

public record SaveSocialDraftRequest(
    string Label,
    string Tone,
    string Purpose,
    List<string> Platforms,
    System.Text.Json.JsonElement Content,
    bool Activate = true
);

// Mirrors commerce-api's SellerProductDto — must stay in sync
public record CommerceProductDto(
    string Id,
    string Title,
    string PrimaryImage,
    string Category,
    decimal Price,
    int Stock,
    bool IsPublished,
    DateTime UpdatedAt
);
