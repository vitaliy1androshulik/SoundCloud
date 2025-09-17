using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

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

        public IFormFile? CoverUrl { get; set; }

        // Нове поле: публічність альбому
        public bool IsPublic { get; set; } = true; // за замовчуванням публічний
    }
}
