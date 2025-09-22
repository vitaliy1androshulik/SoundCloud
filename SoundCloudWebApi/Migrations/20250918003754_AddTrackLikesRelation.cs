using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoundCloudWebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddTrackLikesRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TrackEntityId",
                table: "TrackLikes",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrackLikes_TrackEntityId",
                table: "TrackLikes",
                column: "TrackEntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_TrackLikes_Tracks_TrackEntityId",
                table: "TrackLikes",
                column: "TrackEntityId",
                principalTable: "Tracks",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TrackLikes_Tracks_TrackEntityId",
                table: "TrackLikes");

            migrationBuilder.DropIndex(
                name: "IX_TrackLikes_TrackEntityId",
                table: "TrackLikes");

            migrationBuilder.DropColumn(
                name: "TrackEntityId",
                table: "TrackLikes");
        }
    }
}
