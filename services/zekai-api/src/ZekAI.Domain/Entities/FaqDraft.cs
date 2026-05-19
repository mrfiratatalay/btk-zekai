namespace ZekAI.Domain.Entities;

public class FaqDraft
{
    public int Id { get; set; }
    public Guid ZekaiUserId { get; set; }
    public string ProductId { get; set; } = "";
    public string Question { get; set; } = "";
    public string Answer { get; set; } = "";
    public string SourceReviewIdsJson { get; set; } = "[]";
    public string CategoryTag { get; set; } = "";
    // draft | approved | published | rejected
    public string Status { get; set; } = "draft";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
}
