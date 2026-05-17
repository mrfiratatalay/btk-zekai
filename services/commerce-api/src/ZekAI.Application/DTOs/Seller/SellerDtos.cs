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
    bool IsPublished,
    DateTime UpdatedAt
);

public class UpdateProductContentRequest
{
    public string? Title { get; set; }
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public List<string>? Features { get; set; }
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

public record GenerateSocialContentRequest(string Tone);

public record TiktokScene(string Time, string Text);

public record SocialMediaContentDto(
    string Tone,
    string Instagram,
    List<TiktokScene> Tiktok,
    string Twitter,
    DateTime GeneratedAt
);

public record StoreConnectionDto(
    string Platform,
    string StoreName,
    string Status,
    DateTime? LastSyncAt,
    int ProductCount
);

public record ConnectStoreRequest(string StoreUrl, string Platform = "demo-store");

