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

public record ProductReviewDto(
    int Id,
    string AuthorName,
    int Rating,
    string Title,
    string Text,
    bool VerifiedPurchase,
    DateTime Date,
    int HelpfulCount,
    List<string> Tags
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
