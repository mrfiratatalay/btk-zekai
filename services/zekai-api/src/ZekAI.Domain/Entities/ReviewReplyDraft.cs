namespace ZekAI.Domain.Entities;

public class ReviewReplyDraft
{
    public int Id { get; set; }
    public Guid ZekaiUserId { get; set; }
    public string ProductId { get; set; } = "";
    public int ReviewId { get; set; }
    public string ReviewText { get; set; } = "";
    public string AuthorName { get; set; } = "";
    public int Rating { get; set; }
    public string SuggestedReply { get; set; } = "";
    public string Sentiment { get; set; } = "";
    public string IssueType { get; set; } = "";
    public bool NeedsReply { get; set; }
    // draft | approved | published | rejected
    public string Status { get; set; } = "draft";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
}
