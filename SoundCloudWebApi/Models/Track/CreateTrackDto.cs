using System;
using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Models.Track
{
    public class CreateTrackDto
    {
        [Required]
        [MaxLength(200)]
        public required string Title { get; set; }

        //public string? Url { get; set; } = default!;
        [Required]
        public IFormFile File { get; set; }

        [Required]
        public TimeSpan Duration { get; set; }

        [Required]
        public int AlbumId { get; set; }
    }
}
