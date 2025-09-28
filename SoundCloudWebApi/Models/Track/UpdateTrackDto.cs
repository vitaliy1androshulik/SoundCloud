using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace SoundCloudWebApi.Models.Track
{
    public class UpdateTrackDto
    {
        [Required]
        [MaxLength(200)]
        public string? Title { get; set; }


        // Файл треку можна оновити, опційно
        public IFormFile? File { get; set; }

        // Обкладинка можна оновити, опційно
        public IFormFile? Cover { get; set; }
        public int? GenreId { get; set; }

        // Нове поле: список альбомів, до яких належить трек
        public List<int>? AlbumIds { get; set; }
    }
}