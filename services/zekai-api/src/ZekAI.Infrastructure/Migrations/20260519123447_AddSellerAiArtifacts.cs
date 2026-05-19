using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZekAI.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerAiArtifacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AiModel",
                table: "SellerSocialDrafts",
                type: "text",
                nullable: false,
                defaultValue: "manual");

            migrationBuilder.AddColumn<string>(
                name: "InputHash",
                table: "SellerSocialDrafts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "SellerSocialDrafts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "SellerSocialDrafts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");

            migrationBuilder.AddColumn<string>(
                name: "AiModel",
                table: "SellerProductDrafts",
                type: "text",
                nullable: false,
                defaultValue: "manual");

            migrationBuilder.AddColumn<string>(
                name: "InputHash",
                table: "SellerProductDrafts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "SellerProductDrafts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "SellerProductDrafts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");

            migrationBuilder.CreateTable(
                name: "SellerAiArtifacts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CommerceProductId = table.Column<string>(type: "text", nullable: false),
                    ArtifactType = table.Column<string>(type: "text", nullable: false),
                    Label = table.Column<string>(type: "text", nullable: false),
                    InputHash = table.Column<string>(type: "text", nullable: false),
                    PayloadJson = table.Column<string>(type: "text", nullable: false),
                    AiModel = table.Column<string>(type: "text", nullable: false),
                    Source = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SellerAiArtifacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SellerAiArtifacts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SellerSocialDrafts_UserId_CommerceProductId_InputHash",
                table: "SellerSocialDrafts",
                columns: new[] { "UserId", "CommerceProductId", "InputHash" });

            migrationBuilder.CreateIndex(
                name: "IX_SellerProductDrafts_UserId_CommerceProductId_InputHash",
                table: "SellerProductDrafts",
                columns: new[] { "UserId", "CommerceProductId", "InputHash" });

            migrationBuilder.CreateIndex(
                name: "IX_SellerAiArtifacts_UserId_CommerceProductId",
                table: "SellerAiArtifacts",
                columns: new[] { "UserId", "CommerceProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_SellerAiArtifacts_UserId_CommerceProductId_ArtifactType_Inp~",
                table: "SellerAiArtifacts",
                columns: new[] { "UserId", "CommerceProductId", "ArtifactType", "InputHash" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SellerAiArtifacts");

            migrationBuilder.DropIndex(
                name: "IX_SellerSocialDrafts_UserId_CommerceProductId_InputHash",
                table: "SellerSocialDrafts");

            migrationBuilder.DropIndex(
                name: "IX_SellerProductDrafts_UserId_CommerceProductId_InputHash",
                table: "SellerProductDrafts");

            migrationBuilder.DropColumn(
                name: "AiModel",
                table: "SellerSocialDrafts");

            migrationBuilder.DropColumn(
                name: "InputHash",
                table: "SellerSocialDrafts");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "SellerSocialDrafts");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "SellerSocialDrafts");

            migrationBuilder.DropColumn(
                name: "AiModel",
                table: "SellerProductDrafts");

            migrationBuilder.DropColumn(
                name: "InputHash",
                table: "SellerProductDrafts");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "SellerProductDrafts");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "SellerProductDrafts");
        }
    }
}
