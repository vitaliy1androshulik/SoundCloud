using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Data.Entities
{
    public class TrackEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        // Тривалість треку
        public TimeSpan Duration { get; set; }

        // URL або шлях до файлу
        [Required]
        public string Url { get; set; }

        // Для модерації: якщо прихований — не показуємо
        public bool IsHidden { get; set; } = false;

        // Зв’язок «багато треків — один альбом»
        public int AlbumId { get; set; }
        public AlbumEntity Album { get; set; }

        // Зв’язок «один трек — багато плейлистів»
        public ICollection<PlaylistEntity> Playlists { get; set; }
    }
}