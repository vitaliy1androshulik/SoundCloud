namespace SoundCloudWebApi.Models.Track
{
    public class TrackSummaryDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Author { get; set; } = "";
        public string? ImageUrl { get; set; }
        public string Url { get; set; } = "";
        public int PlayCount { get; set; }
    }
}
