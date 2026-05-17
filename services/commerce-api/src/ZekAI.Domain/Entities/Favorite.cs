namespace ZekAI.Domain.Entities;

public class Favorite
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public string ProductId { get; set; } = "";
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
