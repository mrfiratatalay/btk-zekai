namespace ZekAI.Application.DTOs.Seller;

public record SellerProfileDto(
    Guid Id,
    string StoreName,
    string OwnerName,
    int TrustScore,
    double StoreRating,
    int TotalReviewCount,
    bool FastShipping,
    int ReturnDays
);

public record SellerProductDto(
    string Id,
    string Title,
    string PrimaryImage,
    string Category,
    decimal Price,
    int Stock,
    int Sales30d,
    double ReturnRate,
    double ConversionRate,
    int HealthScore,
    decimal LostProfitMonthly,
    decimal ImprovableRevenueMonthly,
    string Status,
    string MainIssue,
    DateTime UpdatedAt
);

public class UpdateProductContentRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public int? Stock { get; set; }
}

public class CreateProductRequest
{
    public string Title { get; set; } = "";
    public string Brand { get; set; } = "";
    public int CategoryId { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public string ShortDescription { get; set; } = "";
    public string Description { get; set; } = "";
    public string CargoText { get; set; } = "Ücretsiz Kargo";
    public int Stock { get; set; } = 1;
    public string? PrimaryImageUrl { get; set; }
}

public record PublishProductRequest(bool Published);

public record KpiDto(string Label, string Value, string Note, string Tone);

public record ReturnReasonDto(
    string Label,
    double Percent,
    string RootCause,
    string Solution,
    string ExpectedImpact
);

public record StoreConnectionDto(
    string Platform,
    string StoreName,
    string Status,
    DateTime? LastSyncAt,
    int ProductCount
);

public record ConnectStoreRequest(string StoreUrl, string Platform = "demo-store");

public record SellerReturnDto(
    Guid Id,
    Guid OrderId,
    string OrderNumber,
    string ProductTitle,
    string Reason,
    string BuyerClaim,
    string? SellerResponse,
    string Status,
    decimal Amount,
    DateTime RequestedAt,
    DateTime UpdatedAt
);

public record SellerRespondReturnRequest(
    string Action,
    string? Response
);
