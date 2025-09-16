using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Models.Album
{
    public class CreateAlbumDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        public string Description { get; set; }

        // Обов'язковий власник альбому
        [Required]
        public int OwnerId { get; set; }
    }
}