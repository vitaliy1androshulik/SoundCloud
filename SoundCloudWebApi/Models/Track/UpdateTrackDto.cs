using System;
using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Models.Track
{
    public class UpdateTrackDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Url { get; set; }

        [Required]
        public TimeSpan Duration { get; set; }

        // Альтернативно можна дозволити змінювати й AlbumId:
        // [Required]
        // public int AlbumId { get; set; }
    }
}
