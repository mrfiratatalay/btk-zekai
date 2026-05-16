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
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<User>().HasIndex(u => u.Email).IsUnique();

        mb.Entity<Product>().HasKey(p => p.Id);
        mb.Entity<Product>().Property(p => p.Price).HasColumnType("numeric(10,2)");
        mb.Entity<Product>().Property(p => p.OriginalPrice).HasColumnType("numeric(10,2)");

        mb.Entity<SellerProduct>()
            .HasIndex(sp => new { sp.SellerId, sp.ProductId }).IsUnique();
        mb.Entity<SellerProduct>()
            .Property(sp => sp.LostProfitMonthly).HasColumnType("numeric(10,2)");
        mb.Entity<SellerProduct>()
            .Property(sp => sp.ImprovableRevenueMonthly).HasColumnType("numeric(10,2)");

        mb.Entity<Order>().HasIndex(o => o.OrderNumber).IsUnique();
        mb.Entity<Order>().Property(o => o.Total).HasColumnType("numeric(10,2)");

        mb.Entity<OrderItem>().Property(oi => oi.Price).HasColumnType("numeric(10,2)");

        mb.Entity<Seller>()
            .HasOne(s => s.User)
            .WithOne(u => u.Seller)
            .HasForeignKey<Seller>(s => s.UserId);

        mb.Entity<RefreshToken>()
            .HasOne(rt => rt.User)
            .WithMany()
            .HasForeignKey(rt => rt.UserId);
        mb.Entity<RefreshToken>()
            .HasIndex(rt => rt.Token).IsUnique();
    }
}
