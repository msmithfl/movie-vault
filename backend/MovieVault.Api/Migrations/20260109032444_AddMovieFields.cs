using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MovieVault.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMovieFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Collection",
                table: "Movies",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Condition",
                table: "Movies",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "HDDriveNumber",
                table: "Movies",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsOnPlex",
                table: "Movies",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<float>(
                name: "Rating",
                table: "Movies",
                type: "REAL",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<string>(
                name: "Review",
                table: "Movies",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ShelfNumber",
                table: "Movies",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ShelfSection",
                table: "Movies",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Collection",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "Condition",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "HDDriveNumber",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "IsOnPlex",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "Review",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "ShelfNumber",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "ShelfSection",
                table: "Movies");
        }
    }
}
