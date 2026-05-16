namespace ZekAI.Domain.Entities;

public class ProductReview
{
    public int Id { get; set; }
    public string ProductId { get; set; } = "";
    public int Rating { get; set; }
    public string Title { get; set; } = "";
    public string Text { get; set; } = "";
    public bool VerifiedPurchase { get; set; }
    public DateTime Date { get; set; }
    public int HelpfulCount { get; set; }
    public string TagsJson { get; set; } = "[]";

    public Product? Product { get; set; }
}
