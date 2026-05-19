namespace ZekAI.Application.DTOs;

public record CommerceReviewSummaryDto(
    int Id,
    string AuthorName,
    int Rating,
    string Title,
    string Text,
    bool VerifiedPurchase,
    DateTime Date,
    List<string> Tags
);

public record ReviewReplyDraftDto(
    int Id,
    int ReviewId,
    string ReviewText,
    string AuthorName,
    int Rating,
    string SuggestedReply,
    string Sentiment,
    string IssueType,
    bool NeedsReply,
    string Status,
    DateTime CreatedAt,
    DateTime? PublishedAt
);

public record FaqDraftDto(
    int Id,
    string Question,
    string Answer,
    List<int> SourceReviewIds,
    string CategoryTag,
    string Status,
    DateTime CreatedAt,
    DateTime? PublishedAt
);

public record CustomerVoiceDto(
    List<CommerceReviewSummaryDto> Reviews,
    List<ReviewReplyDraftDto> ReplyDrafts,
    List<FaqDraftDto> FaqDrafts
);

public class UpdateReplyDraftRequest
{
    public string SuggestedReply { get; init; } = "";
}

public class UpdateFaqDraftRequest
{
    public string Question { get; init; } = "";
    public string Answer { get; init; } = "";
}

public class PublishFaqDraftRequest
{
    public int SortOrder { get; init; }
}
