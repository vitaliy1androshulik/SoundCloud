using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace SoundCloudWebApi.Models.Track
{
    public class CreateTrackDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        // Тепер обов'язково передаємо AuthorId

        // Для файлу треку
        [Required]
        public IFormFile File { get; set; }

        // Обкладинка
        [Required]
        public IFormFile Cover { get; set; }

        // Тривалість треку
        [Required]
        public TimeSpan Duration { get; set; }

        // Альбом (обов’язково)
        [Required]
        public int AlbumId { get; set; }

        // Опційно: жанр
        public int? GenreId { get; set; }

        // Тут додаємо список ID альбомів
        public List<int>? AlbumIds { get; set; }
    }
}
