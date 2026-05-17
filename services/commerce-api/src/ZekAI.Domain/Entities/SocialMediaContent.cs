namespace ZekAI.Domain.Entities;

public class SocialMediaContent
{
    public int Id { get; set; }
    public Guid SellerId { get; set; }
    public string ProductId { get; set; } = "";
    public string Tone { get; set; } = "";
    public string InstagramContent { get; set; } = "";
    public string TiktokScriptJson { get; set; } = "[]";
    public string TwitterContent { get; set; } = "";
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    public Seller? Seller { get; set; }
}
