namespace ZekAI.Domain.Entities;

public class ZekaiUser
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Role { get; set; } = "buyer"; // buyer | seller
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ProfileName { get; set; }
    public bool Onboarded { get; set; } = false;

    public ICollection<ZekaiRefreshToken> RefreshTokens { get; set; } = [];
    public ICollection<SellerStoreConnection> StoreConnections { get; set; } = [];
    public ICollection<BuyerAnalysis> Analyses { get; set; } = [];
    public ICollection<ShoppingProject> ShoppingProjects { get; set; } = [];
    public ICollection<SavedKombin> SavedKombins { get; set; } = [];
}
