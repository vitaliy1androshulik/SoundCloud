using SoundCloudWebApi.Models.Album;
using System;

namespace SoundCloudWebApi.Models.Track
{
    public class TrackDto
    {
        public int Id { get; set; }

        public string Title { get; set; }

        // Тепер Author — це зв’язок з User
        public int AuthorId { get; set; }

        // Опційно: ім’я автора для фронтенду
        public string Author { get; set; }
        public int? GenreId { get; set; }

        // Опційно: категорія для фронтенду
        public string? Genre { get; set; }

        public TimeSpan Duration { get; set; }

        public bool IsHidden { get; set; }

        // Зв’язок з альбомом
        //public int AlbumId { get; set; }

        public string? Url { get; set; }

        public string? ImageUrl { get; set; }

        // Нове поле: кількість прослуховувань
        public int PlayCount { get; set; }

        public List<AlbumDto>? Albums { get; set; } = new List<AlbumDto>();

        public int LikesCount { get; set; }              // кількість лайків
        public bool IsLikedByCurrentUser { get; set; }  // чи лайкнув поточний користувач
    }
}
