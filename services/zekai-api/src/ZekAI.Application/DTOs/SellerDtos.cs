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

public record SimulationProductPayload(
    string ProductTitle,
    string Category,
    decimal Price,
    string? Description,
    List<string> Features
);

// ── Seller Product Drafts ────────────────────────────────────────────────

public record DraftImageInput(string Type, string Label, string? ImageBase64, string? MimeType, string? Url);

public class SaveProductDraftRequest
{
    public string Label { get; set; } = "";
    public string Title { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Description { get; set; } = "";
    public Dictionary<string, string> Features { get; set; } = new();
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int Stock { get; set; }
    public string Brand { get; set; } = "";
    public string CargoText { get; set; } = "";
    public int CategoryId { get; set; }
    public List<DraftImageInput> Images { get; set; } = new();
}

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

public class SaveSocialDraftRequest
{
    public string Label { get; set; } = "";
    public string Tone { get; set; } = "";
    public string Purpose { get; set; } = "";
    public List<string> Platforms { get; set; } = new();
    public System.Text.Json.JsonElement Content { get; set; }
}

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
