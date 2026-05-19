namespace ZekAI.Application.DTOs.Products;

public record ProductListDto(
    string Id,
    string Title,
    string Brand,
    string SellerName,
    string Category,
    decimal Price,
    decimal? OriginalPrice,
    double Rating,
    int ReviewCount,
    int Stock,
    string PrimaryImage,
    string ShortDescription,
    string CargoText
);

public record ProductDetailDto(
    string Id,
    string Title,
    string Brand,
    string SellerName,
    string Category,
    decimal Price,
    decimal? OriginalPrice,
    double Rating,
    int ReviewCount,
    int Stock,
    List<string> Images,
    string ShortDescription,
    string Description,
    Dictionary<string, string> Features,
    List<string> Badges,
    string CargoText,
    DateTime UpdatedAt
);

public record PublicBundleProductDto(
    string Id,
    string Title,
    string Brand,
    string Category,
    decimal Price,
    int Stock,
    string Image
);

public record PublicProductBundleDto(
    Guid Id,
    string Title,
    string ShortDescription,
    string CampaignText,
    string CtaLabel,
    decimal DiscountPercent,
    PublicBundleProductDto PrimaryProduct,
    PublicBundleProductDto ComplementaryProduct,
    decimal OriginalTotal,
    decimal DiscountAmount,
    decimal BundleTotal
);

public record ProductReviewDto(
    int Id,
    string AuthorName,
    int Rating,
    string Title,
    string Text,
    bool VerifiedPurchase,
    DateTime Date,
    int HelpfulCount,
    List<string> Tags,
    string? SellerReply = null
);

public class CreateProductReviewRequest
{
    public int Rating { get; init; }
    public string Title { get; init; } = "";
    public string Text { get; init; } = "";
    public List<string>? Tags { get; init; }
}

public record PriceHistoryDto(string Day, decimal Price, decimal MarketMedian);
public record CategoryDto(int Id, string Name, string Slug);

public record ReviewReplyDto(int Id, int ReviewId, string ReplyText, DateTime CreatedAt);
public record ProductFaqDto(int Id, string Question, string Answer, string CategoryTag, int SortOrder, DateTime CreatedAt);

public class PublishReviewReplyRequest
{
    public string ReplyText { get; init; } = "";
}

public class PublishFaqRequest
{
    public string Question { get; init; } = "";
    public string Answer { get; init; } = "";
    public string CategoryTag { get; init; } = "";
    public int SortOrder { get; init; }
}
