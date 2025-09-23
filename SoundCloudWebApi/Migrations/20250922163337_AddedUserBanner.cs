using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoundCloudWebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddedUserBanner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BannerUrl",
                table: "Users",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BannerUrl",
                table: "Users");
        }
    }
}
