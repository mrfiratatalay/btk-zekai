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
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<SocialMediaContent> SocialMediaContents => Set<SocialMediaContent>();
    public DbSet<ProductBundle> ProductBundles => Set<ProductBundle>();
    public DbSet<StoreConnection> StoreConnections => Set<StoreConnection>();
    public DbSet<ReviewReply> ReviewReplies => Set<ReviewReply>();
    public DbSet<ProductFaq> ProductFaqs => Set<ProductFaq>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<User>().HasIndex(u => u.Email).IsUnique();

        mb.Entity<Product>().HasKey(p => p.Id);
        mb.Entity<Product>().Property(p => p.Price).HasColumnType("numeric(10,2)");
        mb.Entity<Product>().Property(p => p.OriginalPrice).HasColumnType("numeric(10,2)");

        mb.Entity<SellerProduct>()
            .HasIndex(sp => new { sp.SellerId, sp.ProductId }).IsUnique();

        mb.Entity<Order>().HasIndex(o => o.OrderNumber).IsUnique();
        mb.Entity<Order>().Property(o => o.Subtotal).HasColumnType("numeric(10,2)");
        mb.Entity<Order>().Property(o => o.DiscountTotal).HasColumnType("numeric(10,2)");
        mb.Entity<Order>().Property(o => o.Total).HasColumnType("numeric(10,2)");

        mb.Entity<OrderItem>().Property(oi => oi.Price).HasColumnType("numeric(10,2)");
        mb.Entity<OrderItem>().Property(oi => oi.OriginalUnitPrice).HasColumnType("numeric(10,2)");
        mb.Entity<OrderItem>().Property(oi => oi.DiscountAmount).HasColumnType("numeric(10,2)");

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

        mb.Entity<Cart>()
            .HasIndex(c => c.BuyerId).IsUnique();
        mb.Entity<Cart>()
            .HasOne(c => c.Buyer)
            .WithMany()
            .HasForeignKey(c => c.BuyerId);
        mb.Entity<CartItem>()
            .HasOne(ci => ci.Cart)
            .WithMany(c => c.Items)
            .HasForeignKey(ci => ci.CartId);
        mb.Entity<CartItem>()
            .Property(ci => ci.Price).HasColumnType("numeric(10,2)");
        mb.Entity<CartItem>()
            .Property(ci => ci.OriginalPrice).HasColumnType("numeric(10,2)");
        mb.Entity<CartItem>()
            .Property(ci => ci.DiscountAmount).HasColumnType("numeric(10,2)");

        mb.Entity<Favorite>()
            .HasIndex(f => new { f.UserId, f.ProductId }).IsUnique();
        mb.Entity<Favorite>()
            .HasOne(f => f.User)
            .WithMany()
            .HasForeignKey(f => f.UserId);

        mb.Entity<ProductReview>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.SetNull);
        mb.Entity<ProductReview>()
            .HasIndex(r => new { r.ProductId, r.UserId })
            .HasFilter("\"UserId\" IS NOT NULL");

        mb.Entity<SocialMediaContent>()
            .HasIndex(s => new { s.SellerId, s.ProductId, s.Tone }).IsUnique();
        mb.Entity<SocialMediaContent>()
            .HasOne(s => s.Seller)
            .WithMany()
            .HasForeignKey(s => s.SellerId)
            .OnDelete(DeleteBehavior.Cascade);

        mb.Entity<ProductBundle>()
            .Property(pb => pb.DiscountPercent).HasColumnType("numeric(5,2)");
        mb.Entity<ProductBundle>()
            .HasIndex(pb => new { pb.SellerId, pb.PrimaryProductId, pb.ComplementaryProductId })
            .IsUnique()
            .HasFilter("\"Status\" <> 2");
        mb.Entity<ProductBundle>()
            .HasOne(pb => pb.Seller)
            .WithMany(s => s.ProductBundles)
            .HasForeignKey(pb => pb.SellerId)
            .OnDelete(DeleteBehavior.Cascade);
        mb.Entity<ProductBundle>()
            .HasOne(pb => pb.PrimaryProduct)
            .WithMany()
            .HasForeignKey(pb => pb.PrimaryProductId)
            .OnDelete(DeleteBehavior.Cascade);
        mb.Entity<ProductBundle>()
            .HasOne(pb => pb.ComplementaryProduct)
            .WithMany()
            .HasForeignKey(pb => pb.ComplementaryProductId)
            .OnDelete(DeleteBehavior.Cascade);

        mb.Entity<StoreConnection>()
            .ToTable("StoreConnections");
        mb.Entity<StoreConnection>()
            .HasOne(sc => sc.Seller)
            .WithMany(s => s.StoreConnections)
            .HasForeignKey(sc => sc.SellerId)
            .OnDelete(DeleteBehavior.Cascade);

        mb.Entity<ReviewReply>()
            .HasOne(rr => rr.Review)
            .WithMany()
            .HasForeignKey(rr => rr.ReviewId)
            .OnDelete(DeleteBehavior.Cascade);
        mb.Entity<ReviewReply>()
            .HasOne(rr => rr.Seller)
            .WithMany()
            .HasForeignKey(rr => rr.SellerId)
            .OnDelete(DeleteBehavior.Cascade);
        mb.Entity<ReviewReply>()
            .HasIndex(rr => rr.ReviewId).IsUnique();

        mb.Entity<ProductFaq>()
            .HasOne(f => f.Seller)
            .WithMany()
            .HasForeignKey(f => f.SellerId)
            .OnDelete(DeleteBehavior.Cascade);
        mb.Entity<ProductFaq>()
            .HasIndex(f => new { f.ProductId, f.SellerId, f.Question });
    }
}
