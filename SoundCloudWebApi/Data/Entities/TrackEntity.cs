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

        // Автор як UserEntity (обов’язковий)
        [Required]
        public int AuthorId { get; set; }
        public UserEntity Author { get; set; }

        // Тривалість треку
        [Required]
        public TimeSpan Duration { get; set; }

        // URL або шлях до файлу
        [Required]
        public string Url { get; set; }
        public int PlayCount { get; set; } = 0;


        // Лічильник прослуховувань
        public ICollection<TrackListenEntity>? UserPlays { get; set; }

        // Для модерації: якщо прихований — не показуємо
        public bool IsHidden { get; set; } = false;

        // Зв’язок «один трек — багато альбомів» (many-to-many)
        public ICollection<AlbumTrackEntity> AlbumTracks { get; set; } = new List<AlbumTrackEntity>();

        // Зв’язок «один трек — багато плейлистів»
        public ICollection<PlaylistEntity> Playlists { get; set; }

        public string? ImageUrl { get; set; }

        // нові
        public int? GenreId { get; set; }
        public GenreEntity? Genre { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public int? UpdatedById { get; set; }
    }
}
