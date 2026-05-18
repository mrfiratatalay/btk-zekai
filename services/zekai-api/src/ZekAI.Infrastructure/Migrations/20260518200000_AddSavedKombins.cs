using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ZekAI.Infrastructure.Data;

#nullable disable

namespace ZekAI.Infrastructure.Migrations
{
    [DbContext(typeof(ZekaiDbContext))]
    [Migration("20260518200000_AddSavedKombins")]
    public partial class AddSavedKombins : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SavedKombins",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalId = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    GoalText = table.Column<string>(type: "text", nullable: false),
                    Budget = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    ProductsJson = table.Column<string>(type: "text", nullable: false),
                    ResultJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedKombins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SavedKombins_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SavedKombins_UserId_ExternalId",
                table: "SavedKombins",
                columns: new[] { "UserId", "ExternalId" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "SavedKombins");
        }
    }
}
