namespace SoundCloudWebApi.Models.Playlist
{
    public class PlaylistSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Owner { get; set; } = "";
        public string? CoverUrl { get; set; }
    }
}
