using Microsoft.EntityFrameworkCore;
using ZekAI.Domain.Entities;

namespace ZekAI.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<ProductPriceHistory> ProductPriceHistories => Set<ProductPriceHistory>();
    public DbSet<Seller> Sellers => Set<Seller>();
    public DbSet<SellerProduct> SellerProducts => Set<SellerProduct>();
    public DbSet<StoreConnection> StoreConnections => Set<StoreConnection>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Return> Returns => Set<Return>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<SavedAnalysis> SavedAnalyses => Set<SavedAnalysis>();
    public DbSet<ShoppingProject> ShoppingProjects => Set<ShoppingProject>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // User
        mb.Entity<User>().HasIndex(u => u.Email).IsUnique();

        // Product — string PK (slug)
        mb.Entity<Product>().HasKey(p => p.Id);
        mb.Entity<Product>().Property(p => p.Price).HasColumnType("numeric(10,2)");
        mb.Entity<Product>().Property(p => p.OriginalPrice).HasColumnType("numeric(10,2)");

        // SellerProduct — unique per seller+product
        mb.Entity<SellerProduct>()
            .HasIndex(sp => new { sp.SellerId, sp.ProductId }).IsUnique();
        mb.Entity<SellerProduct>()
            .Property(sp => sp.LostProfitMonthly).HasColumnType("numeric(10,2)");
        mb.Entity<SellerProduct>()
            .Property(sp => sp.ImprovableRevenueMonthly).HasColumnType("numeric(10,2)");

        // Order
        mb.Entity<Order>().HasIndex(o => o.OrderNumber).IsUnique();
        mb.Entity<Order>().Property(o => o.Total).HasColumnType("numeric(10,2)");

        // OrderItem
        mb.Entity<OrderItem>().Property(oi => oi.Price).HasColumnType("numeric(10,2)");

        // Return — one per order
        mb.Entity<Return>()
            .HasOne(r => r.Order)
            .WithOne(o => o.Return)
            .HasForeignKey<Return>(r => r.OrderId);
        mb.Entity<Return>().Property(r => r.Amount).HasColumnType("numeric(10,2)");

        // Seller → User (1:1)
        mb.Entity<Seller>()
            .HasOne(s => s.User)
            .WithOne(u => u.Seller)
            .HasForeignKey<Seller>(s => s.UserId);

        // RefreshToken → User
        mb.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany()
            .HasForeignKey(rt => rt.UserId);
        mb.Entity<RefreshToken>()
            .HasIndex(rt => rt.Token).IsUnique();

        // SavedAnalysis → Buyer (User)
        mb.Entity<SavedAnalysis>()
            .HasOne(sa => sa.Buyer)
            .WithMany()
            .HasForeignKey(sa => sa.BuyerId);
        mb.Entity<SavedAnalysis>()
            .HasIndex(sa => new { sa.BuyerId, sa.ExternalId }).IsUnique();

        // ShoppingProject -> Buyer (User)
        mb.Entity<ShoppingProject>()
            .HasOne(sp => sp.Buyer)
            .WithMany()
            .HasForeignKey(sp => sp.BuyerId);
        mb.Entity<ShoppingProject>()
            .HasIndex(sp => new { sp.BuyerId, sp.ExternalId }).IsUnique();
        mb.Entity<ShoppingProject>()
            .Property(sp => sp.Budget).HasColumnType("numeric(10,2)");
    }
}
