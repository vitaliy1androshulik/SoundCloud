using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Models.Playlist
{
    public class CreatePlaylistDto
    {
        [Required]
        public string Name { get; set; }
    }
}

