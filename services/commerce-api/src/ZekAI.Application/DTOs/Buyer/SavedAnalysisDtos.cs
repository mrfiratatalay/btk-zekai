namespace ZekAI.Application.DTOs.Buyer;

public record SaveAnalysisRequest(
    string ExternalId,
    string ProductId,
    string ProductTitle,
    string ProductImage,
    string ProductPrice,
    string SellerName,
    string UserNeedText,
    double OverallRiskPercent,
    string RecommendationLevel,
    string ScoresJson
);

public record UpdateAnalysisRequest(
    string? Status,
    string? UserNote
);

public record SavedAnalysisDto(
    Guid Id,
    string ExternalId,
    string ProductId,
    string ProductTitle,
    string ProductImage,
    string ProductPrice,
    string SellerName,
    string UserNeedText,
    double OverallRiskPercent,
    string RecommendationLevel,
    string ScoresJson,
    string Status,
    string? UserNote,
    DateTime SavedAt
);
