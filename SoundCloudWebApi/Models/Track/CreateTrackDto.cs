using System;
using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Models.Track
{
    public class CreateTrackDto
    {
        [Required]
        [MaxLength(200)]
        public required string Title { get; set; }

        [Required]
        public string Url { get; set; } = default!;

        [Required]
        public TimeSpan Duration { get; set; }

        [Required]
        public int AlbumId { get; set; }
    }
}
