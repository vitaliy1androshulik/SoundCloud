using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Models.Playlist
{
    public class CreatePlaylistDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        // Власник (обов'язковий)
        [Required]
        public int OwnerId { get; set; }
    }
}