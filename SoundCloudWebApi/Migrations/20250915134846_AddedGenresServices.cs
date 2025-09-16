using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoundCloudWebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddedGenresServices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PlayCount",
                table: "Categories",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PlayCount",
                table: "Categories");
        }
    }
}
