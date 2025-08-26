using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Models.Album
{
    public class CreateAlbumDto
    {
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
    }
}
