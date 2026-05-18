namespace ZekAI.Domain.Entities;

public class SavedKombin
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string ExternalId { get; set; } = "";
    public string Title { get; set; } = "";
    public string GoalText { get; set; } = "";
    public decimal? Budget { get; set; }
    public string ProductsJson { get; set; } = "[]";
    public string ResultJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ZekaiUser? User { get; set; }
}
