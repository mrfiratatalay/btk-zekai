using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ZekAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerVoiceDrafts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FaqDrafts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ZekaiUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<string>(type: "text", nullable: false),
                    Question = table.Column<string>(type: "text", nullable: false),
                    Answer = table.Column<string>(type: "text", nullable: false),
                    SourceReviewIdsJson = table.Column<string>(type: "text", nullable: false),
                    CategoryTag = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FaqDrafts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReviewReplyDrafts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ZekaiUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<string>(type: "text", nullable: false),
                    ReviewId = table.Column<int>(type: "integer", nullable: false),
                    ReviewText = table.Column<string>(type: "text", nullable: false),
                    AuthorName = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    SuggestedReply = table.Column<string>(type: "text", nullable: false),
                    Sentiment = table.Column<string>(type: "text", nullable: false),
                    IssueType = table.Column<string>(type: "text", nullable: false),
                    NeedsReply = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReviewReplyDrafts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FaqDrafts_ZekaiUserId_ProductId",
                table: "FaqDrafts",
                columns: new[] { "ZekaiUserId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_ReviewReplyDrafts_ZekaiUserId_ProductId",
                table: "ReviewReplyDrafts",
                columns: new[] { "ZekaiUserId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_ReviewReplyDrafts_ZekaiUserId_ProductId_ReviewId",
                table: "ReviewReplyDrafts",
                columns: new[] { "ZekaiUserId", "ProductId", "ReviewId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FaqDrafts");

            migrationBuilder.DropTable(
                name: "ReviewReplyDrafts");
        }
    }
}
