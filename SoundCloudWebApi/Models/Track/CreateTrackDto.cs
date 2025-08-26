using System;
using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Models.Track
{
    public class CreateTrackDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Url { get; set; }

        [Required]
        public TimeSpan Duration { get; set; }

        [Required]
        public int AlbumId { get; set; }
    }
}
