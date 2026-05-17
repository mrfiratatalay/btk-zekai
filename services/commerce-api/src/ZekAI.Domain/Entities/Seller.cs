using ZekAI.Domain.Enums;

namespace ZekAI.Domain.Entities;

public class Seller
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string StoreName { get; set; } = "";
    public string OwnerName { get; set; } = "";
    public int TrustScore { get; set; }
    public double StoreRating { get; set; }
    public int TotalReviewCount { get; set; }
    public bool FastShipping { get; set; }
    public int ReturnDays { get; set; } = 14;
    public string ApiKey { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public ICollection<SellerProduct> SellerProducts { get; set; } = [];
    public ICollection<StoreConnection> StoreConnections { get; set; } = [];
}
