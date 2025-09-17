using SoundCloudWebApi.Models.Track;

namespace SoundCloudWebApi.Models.Playlist
{
    public class PlaylistDto
    {
        public int Id { get; set; }
        public string Name { get; set; }

        // Нове поле: ID користувача-власника
        public int OwnerId { get; set; }

        // Опційно: ім'я користувача-власника для зручності фронтенду
        public string OwnerName { get; set; }

        // ✅ Додаємо треки
        public List<TrackDto> Tracks { get; set; } = new();

        // ✅ Додаємо обкладинку плейліста
        public string? CoverUrl { get; set; }
    }
}
