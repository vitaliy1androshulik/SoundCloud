namespace SoundCloudWebApi.Models.Track
{
    public class AuthorStatsDto
    {
        public int AuthorId { get; set; }
        public int Tracks { get; set; }
        public int Listens { get; set; }
        public int Likes { get; set; }
    }
}
