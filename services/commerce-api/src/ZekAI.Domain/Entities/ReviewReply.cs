namespace ZekAI.Domain.Entities;

public class ReviewReply
{
    public int Id { get; set; }
    public string ProductId { get; set; } = "";
    public int ReviewId { get; set; }
    public Guid SellerId { get; set; }
    public string ReplyText { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Product? Product { get; set; }
    public ProductReview? Review { get; set; }
    public Seller? Seller { get; set; }
}
