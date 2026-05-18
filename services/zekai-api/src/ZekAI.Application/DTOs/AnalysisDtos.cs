namespace ZekAI.Application.DTOs;

public record ProductPreviewRequest(string ProductUrl);

public record ProductPreviewResponse(
    string Id,
    string Title,
    string Brand,
    string SellerName,
    string Category,
    decimal Price,
    decimal? OriginalPrice,
    double Rating,
    int ReviewCount,
    string Image,
    string ShortDescription
);

public class SaveAnalysisRequest
{
    public string ExternalId { get; set; } = "";
    public string ProductId { get; set; } = "";
    public string ProductTitle { get; set; } = "";
    public string ProductImage { get; set; } = "";
    public string ProductPrice { get; set; } = "";
    public string SellerName { get; set; } = "";
    public string UserNeedText { get; set; } = "";
    public int OverallRiskPercent { get; set; }
    public string RecommendationLevel { get; set; } = "";
    public string ScoresJson { get; set; } = "{}";
}

public class UpdateAnalysisRequest
{
    public string? Status { get; set; }
    public string? UserNote { get; set; }
}

public record AnalysisDto(
    Guid Id,
    string ExternalId,
    string ProductId,
    string ProductTitle,
    string ProductImage,
    string ProductPrice,
    string SellerName,
    string UserNeedText,
    int OverallRiskPercent,
    string RecommendationLevel,
    string ScoresJson,
    string? Status,
    string? UserNote,
    DateTime SavedAt
);

public class CreateProjectRequest
{
    public string ExternalId { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Goal { get; set; }
    public decimal? Budget { get; set; }
}

public class UpdateProjectRequest
{
    public string? Title { get; set; }
    public string? Goal { get; set; }
    public decimal? Budget { get; set; }
}

public record ProjectDto(
    Guid Id,
    string ExternalId,
    string Title,
    string? Goal,
    decimal? Budget,
    DateTime CreatedAt,
    List<string> AnalysisIds
);

public record BuyerProfileDto(string? ProfileName, bool Onboarded);

public class UpdateBuyerProfileRequest
{
    public string? ProfileName { get; set; }
    public bool? Onboarded { get; set; }
}

public class SaveKombinRequest
{
    public string ExternalId { get; set; } = "";
    public string Title { get; set; } = "";
    public string GoalText { get; set; } = "";
    public decimal? Budget { get; set; }
    public string ProductsJson { get; set; } = "[]";
    public string ResultJson { get; set; } = "{}";
}

public record SavedKombinDto(
    Guid Id,
    string ExternalId,
    string Title,
    string GoalText,
    decimal? Budget,
    string ProductsJson,
    string ResultJson,
    DateTime CreatedAt
);
