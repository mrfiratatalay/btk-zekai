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
