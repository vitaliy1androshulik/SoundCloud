using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoundCloudWebApi.Migrations
{
    /// <inheritdoc />
    public partial class addedAuthorTableForTracks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Author",
                table: "Tracks",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Author",
                table: "Tracks");
        }
    }
}
