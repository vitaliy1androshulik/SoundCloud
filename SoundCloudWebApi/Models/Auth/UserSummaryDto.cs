namespace SoundCloudWebApi.Models.Auth
{
    public class UserSummaryDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = "";
        public string? AvatarUrl { get; set; } // Фото користувача
    }
}
