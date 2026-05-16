using ZekAI.Domain.Enums;

namespace ZekAI.Domain.Entities;

public class StoreConnection
{
    public int Id { get; set; }
    public Guid SellerId { get; set; }
    public StorePlatform Platform { get; set; }
    public string StoreName { get; set; } = "";
    public StoreConnectionStatus Status { get; set; }
    public DateTime? LastSyncAt { get; set; }
    public int ProductCount { get; set; }

    public Seller? Seller { get; set; }
}
