using ZekAI.Domain.Enums;

namespace ZekAI.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string FullName { get; set; } = "";
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Seller? Seller { get; set; }
    public ICollection<Order> Orders { get; set; } = [];
}
