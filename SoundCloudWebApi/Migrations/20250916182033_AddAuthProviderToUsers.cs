using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoundCloudWebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthProviderToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AuthProvider",
                table: "Users",
                type: "text",
                //nullable: false,
                nullable: true,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "GoogleSubject",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocalPasswordSet",
                table: "Users",
                type: "boolean",
                //nullable: false,
                nullable: true,
                defaultValue: false);

            //new
            // 2) Бекфіл значень для існуючих рядків
            migrationBuilder.Sql(@"
        UPDATE ""Users""
        SET
            ""AuthProvider"" = CASE
                WHEN COALESCE(octet_length(""PasswordHash""),0) = 0
                  OR COALESCE(octet_length(""PasswordSalt""),0) = 0
                THEN 'Google' ELSE 'Local' END,
            ""IsLocalPasswordSet"" = CASE
                WHEN COALESCE(octet_length(""PasswordHash""),0) > 0
                 AND COALESCE(octet_length(""PasswordSalt""),0) > 0
                THEN TRUE ELSE FALSE END
    ");

            // 3) Тепер робимо NOT NULL + дефолти для нових вставок
            migrationBuilder.AlterColumn<string>(
                name: "AuthProvider",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "Local",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsLocalPasswordSet",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "boolean",
                oldNullable: true);
            //---

            migrationBuilder.CreateIndex(
                name: "IX_Users_GoogleSubject",
                table: "Users",
                column: "GoogleSubject",
                unique: true,
                filter: "\"GoogleSubject\" IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Users_AuthProvider",
                table: "Users",
                sql: "\"AuthProvider\" in ('Local','Google')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_GoogleSubject",
                table: "Users");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Users_AuthProvider",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AuthProvider",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "GoogleSubject",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsLocalPasswordSet",
                table: "Users");
        }
    }
}
