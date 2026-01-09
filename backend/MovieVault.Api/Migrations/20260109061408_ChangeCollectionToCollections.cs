using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MovieVault.Api.Migrations
{
    /// <inheritdoc />
    public partial class ChangeCollectionToCollections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Collection",
                table: "Movies",
                newName: "Collections");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Collections",
                table: "Movies",
                newName: "Collection");
        }
    }
}
