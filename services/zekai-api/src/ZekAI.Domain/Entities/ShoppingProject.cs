namespace ZekAI.Domain.Entities;

public class ShoppingProject
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string ExternalId { get; set; } = "";
    public string Title { get; set; } = "";
    public string? Goal { get; set; }
    public decimal? Budget { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ZekaiUser? User { get; set; }
    public ICollection<ShoppingProjectAnalysis> ProjectAnalyses { get; set; } = [];
}

public class ShoppingProjectAnalysis
{
    public Guid ProjectId { get; set; }
    public Guid AnalysisId { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public ShoppingProject? Project { get; set; }
    public BuyerAnalysis? Analysis { get; set; }
}
