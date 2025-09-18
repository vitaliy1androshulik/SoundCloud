namespace SoundCloudWebApi.Models.Album
{
    public class AlbumSummaryDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public int ArtistId { get; set; } = 0;
        public string? ImageUrl { get; set; }
    }
}
