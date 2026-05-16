namespace ZekAI.Domain.Entities;

public class SellerStoreConnection
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ZekaiUserId { get; set; }
    public string ProviderName { get; set; } = "akilli-market-demo";
    public string CommerceSellerId { get; set; } = "";
    public string CommerceAccessToken { get; set; } = "";
    public DateTime ConnectedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastSyncedAt { get; set; }
    public string Status { get; set; } = "connected"; // connected | disconnected

    public ZekaiUser? ZekaiUser { get; set; }
}
