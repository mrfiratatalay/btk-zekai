using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZekAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductBundlesAndBundleDiscounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DiscountTotal",
                table: "Orders",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Subtotal",
                table: "Orders",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "BundleId",
                table: "OrderItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BundleTitle",
                table: "OrderItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "OrderItems",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OriginalUnitPrice",
                table: "OrderItems",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "BundleId",
                table: "CartItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BundleTitle",
                table: "CartItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "CartItems",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "OriginalPrice",
                table: "CartItems",
                type: "numeric(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "ProductBundles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SellerId = table.Column<Guid>(type: "uuid", nullable: false),
                    PrimaryProductId = table.Column<string>(type: "text", nullable: false),
                    ComplementaryProductId = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    ShortDescription = table.Column<string>(type: "text", nullable: false),
                    CampaignText = table.Column<string>(type: "text", nullable: false),
                    CtaLabel = table.Column<string>(type: "text", nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "numeric(5,2)", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RecommendationReason = table.Column<string>(type: "text", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ArchivedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductBundles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductBundles_Products_ComplementaryProductId",
                        column: x => x.ComplementaryProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductBundles_Products_PrimaryProductId",
                        column: x => x.PrimaryProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductBundles_Sellers_SellerId",
                        column: x => x.SellerId,
                        principalTable: "Sellers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductBundles_ComplementaryProductId",
                table: "ProductBundles",
                column: "ComplementaryProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBundles_PrimaryProductId",
                table: "ProductBundles",
                column: "PrimaryProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductBundles_SellerId_PrimaryProductId_ComplementaryProdu~",
                table: "ProductBundles",
                columns: new[] { "SellerId", "PrimaryProductId", "ComplementaryProductId" },
                unique: true,
                filter: "\"Status\" <> 2");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductBundles");

            migrationBuilder.DropColumn(
                name: "DiscountTotal",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Subtotal",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "BundleId",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "BundleTitle",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "OriginalUnitPrice",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "BundleId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "BundleTitle",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "OriginalPrice",
                table: "CartItems");
        }
    }
}
