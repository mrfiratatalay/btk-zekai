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

public record SimulationProductPayload(
    string ProductTitle,
    string Category,
    decimal Price,
    string? Description,
    List<string> Features
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
