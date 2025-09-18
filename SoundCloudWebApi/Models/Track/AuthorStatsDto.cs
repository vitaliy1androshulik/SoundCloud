namespace SoundCloudWebApi.Models.Track
{
    public class AuthorStatsDto
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string? AvatarUrl { get; set; }
        public int TotalPlays { get; set; }
    }
}
