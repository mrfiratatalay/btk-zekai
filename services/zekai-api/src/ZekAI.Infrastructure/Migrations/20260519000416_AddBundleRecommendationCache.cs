using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZekAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBundleRecommendationCache : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BundleRecommendationCaches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SellerKey = table.Column<string>(type: "text", nullable: false),
                    PrimaryProductId = table.Column<string>(type: "text", nullable: false),
                    ProductListHash = table.Column<string>(type: "text", nullable: false),
                    ResponseJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BundleRecommendationCaches", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BundleRecommendationCaches_SellerKey_PrimaryProductId_Produ~",
                table: "BundleRecommendationCaches",
                columns: new[] { "SellerKey", "PrimaryProductId", "ProductListHash" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BundleRecommendationCaches");
        }
    }
}
