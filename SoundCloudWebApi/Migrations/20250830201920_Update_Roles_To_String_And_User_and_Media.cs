using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SoundCloudWebApi.Migrations
{
    /// <inheritdoc />
    public partial class Update_Roles_To_String_And_User_and_Media : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Albums_Users_OwnerId",
                table: "Albums");

            migrationBuilder.DropForeignKey(
                name: "FK_Playlists_Users_OwnerId",
                table: "Playlists");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Users",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");


            // 1) Конвертуємо існуючі значення: '0'/'1'/'2' -> 'User'/'Moderator'/'Admin'
            // (після AlterColumn<int -> string> значення в PG стають '0','1','2' як текст)
            migrationBuilder.Sql(@"
    UPDATE ""Users""
    SET ""Role"" = CASE ""Role""
        WHEN '0' THEN 'User'
        WHEN '1' THEN 'Moderator'
        WHEN '2' THEN 'Admin'
        WHEN 'User' THEN 'User'
        WHEN 'Moderator' THEN 'Moderator'
        WHEN 'Admin' THEN 'Admin'
        ELSE 'User'
    END;
");

            // 2) Дефолт для колонки Role — 'User'
            migrationBuilder.Sql(@"
    ALTER TABLE ""Users"" ALTER COLUMN ""Role"" DROP DEFAULT;
    ALTER TABLE ""Users"" ALTER COLUMN ""Role"" SET DEFAULT 'User';
");

            // 3) Підчистити можливі null/сміття
            migrationBuilder.Sql(@"
    UPDATE ""Users""
    SET ""Role"" = 'User'
    WHERE ""Role"" IS NULL OR ""Role"" NOT IN ('User','Moderator','Admin');
");

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Tracks",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "GenreId",
                table: "Tracks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Tracks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Tracks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Tracks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoverUrl",
                table: "Playlists",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Playlists",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Playlists",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Playlists",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoverUrl",
                table: "Albums",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Albums",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UpdatedById",
                table: "Albums",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_Users_Role_Enum",
                table: "Users",
                sql: "\"Role\" IN ('User','Moderator','Admin')");

            migrationBuilder.CreateIndex(
                name: "IX_Tracks_GenreId",
                table: "Tracks",
                column: "GenreId");

            migrationBuilder.AddForeignKey(
                name: "FK_Albums_Users_OwnerId",
                table: "Albums",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Playlists_Users_OwnerId",
                table: "Playlists",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tracks_Genres_GenreId",
                table: "Tracks",
                column: "GenreId",
                principalTable: "Genres",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Albums_Users_OwnerId",
                table: "Albums");

            migrationBuilder.DropForeignKey(
                name: "FK_Playlists_Users_OwnerId",
                table: "Playlists");

            migrationBuilder.DropForeignKey(
                name: "FK_Tracks_Genres_GenreId",
                table: "Tracks");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Users_Role_Enum",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Tracks_GenreId",
                table: "Tracks");


            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Tracks");

            migrationBuilder.DropColumn(
                name: "GenreId",
                table: "Tracks");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Tracks");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Tracks");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Tracks");

            migrationBuilder.DropColumn(
                name: "CoverUrl",
                table: "Playlists");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Playlists");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Playlists");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Playlists");

            migrationBuilder.DropColumn(
                name: "CoverUrl",
                table: "Albums");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Albums");

            migrationBuilder.DropColumn(
                name: "UpdatedById",
                table: "Albums");

            //migrationBuilder.AlterColumn<int>(
            //    name: "Role",
            //    table: "Users",
            //    type: "integer",
            //    nullable: false,
            //    oldClrType: typeof(string),
            //    oldType: "character varying(16)",
            //    oldMaxLength: 16);

            // 1) Повертаємо рядкові ролі назад у числа (як текст)
            migrationBuilder.Sql(@"
    UPDATE ""Users""
    SET ""Role"" = CASE ""Role""
        WHEN 'User' THEN '0'
        WHEN 'Moderator' THEN '1'
        WHEN 'Admin' THEN '2'
        ELSE '0'
    END;
");

            // 2) Безпечна зміна типу text -> integer через USING (PostgreSQL)
            migrationBuilder.Sql(@"
    ALTER TABLE ""Users""
    ALTER COLUMN ""Role"" TYPE integer
    USING ""Role""::integer;
");

            // 3) Дефолт для int — 0 (User)
            migrationBuilder.Sql(@"
    ALTER TABLE ""Users"" ALTER COLUMN ""Role"" DROP DEFAULT;
    ALTER TABLE ""Users"" ALTER COLUMN ""Role"" SET DEFAULT 0;
");

            migrationBuilder.AddForeignKey(
                name: "FK_Albums_Users_OwnerId",
                table: "Albums",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Playlists_Users_OwnerId",
                table: "Playlists",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
