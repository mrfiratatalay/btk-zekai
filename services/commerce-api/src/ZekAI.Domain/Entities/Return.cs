using ZekAI.Domain.Enums;

namespace ZekAI.Domain.Entities;

public class Return
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public ReturnReasonKey Reason { get; set; }
    public string BuyerClaim { get; set; } = "";
    public string? SellerResponse { get; set; }
    public ReturnStatus Status { get; set; } = ReturnStatus.SellerReview;
    public decimal Amount { get; set; }
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Order? Order { get; set; }
}
