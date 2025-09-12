using System;

namespace SoundCloudWebApi.Models.Track
{
    public class TrackDto
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public TimeSpan Duration { get; set; }
        public bool IsHidden { get; set; }

        // нові поля
        public int AlbumId { get; set; }
        public string? Url { get; set; } = default!;
        public string? ImageUrl { get; set; }
    }

}
