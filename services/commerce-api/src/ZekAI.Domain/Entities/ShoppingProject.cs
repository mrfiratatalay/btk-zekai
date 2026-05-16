namespace ZekAI.Domain.Entities;

public class ShoppingProject
{
    public Guid Id { get; set; }
    public Guid BuyerId { get; set; }
    public string ExternalId { get; set; } = "";
    public string Title { get; set; } = "";
    public string Goal { get; set; } = "";
    public decimal? Budget { get; set; }
    public string SavedAnalysisIdsJson { get; set; } = "[]";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? Buyer { get; set; }
}
