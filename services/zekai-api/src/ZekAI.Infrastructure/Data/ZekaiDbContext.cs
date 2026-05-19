using Microsoft.EntityFrameworkCore;
using ZekAI.Domain.Entities;

namespace ZekAI.Infrastructure.Data;

public class ZekaiDbContext(DbContextOptions<ZekaiDbContext> options) : DbContext(options)
{
    public DbSet<ZekaiUser> Users => Set<ZekaiUser>();
    public DbSet<ZekaiRefreshToken> RefreshTokens => Set<ZekaiRefreshToken>();
    public DbSet<SellerStoreConnection> StoreConnections => Set<SellerStoreConnection>();
    public DbSet<BundleRecommendationCache> BundleRecommendationCaches => Set<BundleRecommendationCache>();
    public DbSet<BuyerAnalysis> Analyses => Set<BuyerAnalysis>();
    public DbSet<ShoppingProject> ShoppingProjects => Set<ShoppingProject>();
    public DbSet<ShoppingProjectAnalysis> ShoppingProjectAnalyses => Set<ShoppingProjectAnalysis>();
    public DbSet<SavedKombin> SavedKombins => Set<SavedKombin>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<ZekaiUser>().HasIndex(u => u.Email).IsUnique();

        mb.Entity<ZekaiRefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UserId);
        mb.Entity<ZekaiRefreshToken>().HasIndex(rt => rt.Token).IsUnique();

        mb.Entity<SellerStoreConnection>()
            .HasOne(sc => sc.ZekaiUser)
            .WithMany(u => u.StoreConnections)
            .HasForeignKey(sc => sc.ZekaiUserId);

        mb.Entity<BundleRecommendationCache>()
            .HasIndex(c => new { c.SellerKey, c.PrimaryProductId, c.ProductListHash })
            .IsUnique();

        mb.Entity<BuyerAnalysis>()
            .HasOne(a => a.User)
            .WithMany(u => u.Analyses)
            .HasForeignKey(a => a.UserId);
        mb.Entity<BuyerAnalysis>()
            .HasIndex(a => new { a.UserId, a.ExternalId }).IsUnique();

        mb.Entity<ShoppingProject>()
            .HasOne(p => p.User)
            .WithMany(u => u.ShoppingProjects)
            .HasForeignKey(p => p.UserId);
        mb.Entity<ShoppingProject>()
            .HasIndex(p => new { p.UserId, p.ExternalId }).IsUnique();
        mb.Entity<ShoppingProject>()
            .Property(p => p.Budget).HasColumnType("numeric(10,2)");

        mb.Entity<ShoppingProjectAnalysis>()
            .HasKey(pa => new { pa.ProjectId, pa.AnalysisId });
        mb.Entity<ShoppingProjectAnalysis>()
            .HasOne(pa => pa.Project)
            .WithMany(p => p.ProjectAnalyses)
            .HasForeignKey(pa => pa.ProjectId);
        mb.Entity<ShoppingProjectAnalysis>()
            .HasOne(pa => pa.Analysis)
            .WithMany(a => a.ProjectLinks)
            .HasForeignKey(pa => pa.AnalysisId);

        mb.Entity<SavedKombin>()
            .HasOne(k => k.User)
            .WithMany(u => u.SavedKombins)
            .HasForeignKey(k => k.UserId);
        mb.Entity<SavedKombin>()
            .HasIndex(k => new { k.UserId, k.ExternalId }).IsUnique();
        mb.Entity<SavedKombin>()
            .Property(k => k.Budget).HasColumnType("numeric(10,2)");
    }
}
