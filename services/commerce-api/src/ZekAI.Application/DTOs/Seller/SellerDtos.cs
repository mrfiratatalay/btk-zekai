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
    public Dictionary<string, string>? Features { get; set; }
    public decimal? Price { get; set; }
    public int? Stock { get; set; }
    public string? Brand { get; set; }
    public decimal? OriginalPrice { get; set; }
    public bool ClearOriginalPrice { get; set; }
    public string? CargoText { get; set; }
    public int? CategoryId { get; set; }
    public string? PrimaryImageUrl { get; set; }
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
    public Dictionary<string, string>? Features { get; set; }
}

public record PublishProductRequest(bool Published);

public record UpdateProductImageRequest(string ImageBase64, string MimeType);
public record GenerateSocialContentRequest(string Tone, string Purpose, List<string> Platforms);

public class SaveSocialContentRequest
{
    public string Tone { get; set; } = "";
    public string Purpose { get; set; } = "";
    public List<string> Platforms { get; set; } = [];
    public SocialInstagramContentDto? Instagram { get; set; }
    public SocialTiktokContentDto? Tiktok { get; set; }
    public SocialTwitterContentDto? Twitter { get; set; }
}

public record BundleProductDto(
    string Id,
    string Title,
    string Brand,
    string Category,
    decimal Price,
    int Stock,
    string Image
);

public record ProductBundleDto(
    Guid Id,
    string Title,
    string ShortDescription,
    string CampaignText,
    string CtaLabel,
    decimal DiscountPercent,
    string Status,
    string RecommendationReason,
    int Score,
    BundleProductDto PrimaryProduct,
    BundleProductDto ComplementaryProduct,
    decimal OriginalTotal,
    decimal DiscountAmount,
    decimal BundleTotal,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? PublishedAt
);

public record BundleRecommendationDto(
    BundleProductDto PrimaryProduct,
    BundleProductDto ComplementaryProduct,
    string SuggestedTitle,
    string SuggestedShortDescription,
    string SuggestedCampaignText,
    string SuggestedCtaLabel,
    decimal SuggestedDiscountPercent,
    string RecommendationReason,
    int Score,
    decimal OriginalTotal,
    decimal DiscountAmount,
    decimal BundleTotal
);

public record MissingBundleOpportunityDto(
    string Title,
    string Message,
    List<string> SuggestedProductIdeas
);

public record BundleRecommendationResponse(
    List<BundleRecommendationDto> Recommendations,
    MissingBundleOpportunityDto? MissingOpportunity
);

public class CreateProductBundleRequest
{
    public string ComplementaryProductId { get; set; } = "";
    public string Title { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string CampaignText { get; set; } = "";
    public string CtaLabel { get; set; } = "Paketi Sepete Ekle";
    public decimal DiscountPercent { get; set; } = 5;
    public string RecommendationReason { get; set; } = "";
    public int Score { get; set; }
    public bool Publish { get; set; }
}

public class UpdateProductBundleRequest
{
    public string? Title { get; set; }
    public string? ShortDescription { get; set; }
    public string? CampaignText { get; set; }
    public string? CtaLabel { get; set; }
    public decimal? DiscountPercent { get; set; }
}

public record PublishBundleRequest(bool Published);
public record SocialInstagramContentDto(
    string Caption,
    List<string> Hashtags,
    string Cta,
    string OverlayText
);

public record SocialTiktokSceneDto(
    string Title,
    string Description
);

public record SocialTiktokContentDto(
    string Hook,
    List<SocialTiktokSceneDto> Scenes,
    string Caption,
    List<string> Hashtags
);

public record SocialTwitterContentDto(
    string Post,
    List<string> Hashtags,
    string Cta
);

public record SocialMediaContentDto(
    string Tone,
    string Purpose,
    List<string> Platforms,
    SocialInstagramContentDto? Instagram,
    SocialTiktokContentDto? Tiktok,
    SocialTwitterContentDto? Twitter,
    DateTime GeneratedAt
);

public record StoreConnectionDto(
    int Id,
    string Platform,
    string StoreName,
    string Status,
    DateTime? LastSyncAt,
    int ProductCount,
    bool HasApiKey
);

public record ConnectStoreRequest(string StoreApiKey, string StoreName, string Platform = "DemoStore");
public record DisconnectStoreRequest(int ConnectionId);
