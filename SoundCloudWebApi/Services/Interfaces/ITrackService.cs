using System.Collections.Generic;
using System.Threading.Tasks;
using SoundCloudWebApi.Models.Track;

namespace SoundCloudWebApi.Services.Interfaces
{
    /// <summary>
    /// Сервіс для роботи з треками
    /// </summary>
    public interface ITrackService
    {
        // Отримати всі треки
        Task<IEnumerable<TrackDto>> GetAllByUserAsync(int userId);

        Task<IEnumerable<TrackDto>> GetAllAsync();

        // Отримати трек за ID
        Task<TrackDto?> GetByIdAsync(int id);
        Task<TrackDto> GetByIdInternalAsync(int id, bool includeUserLikes);

        // Отримати всі треки (для фронтенду)
        Task<IEnumerable<TrackDto>> GetAllTracksAsync();

        // Створити трек
        Task<TrackDto> CreateAsync(CreateTrackDto dto);

        // Створення треку з файлом
        Task<TrackDto> CreateAsyncFile(CreateTrackDto dto);

        // Оновити трек
        Task<TrackDto> UpdateAsync(int trackId, UpdateTrackDto dto);

        // Видалити трек
        Task DeleteAsync(int trackId);

        // Приховати/показати трек
        Task HideAsync(int id);
        Task UnhideAsync(int id);

        // Оновити обкладинку
        Task SetImageAsync(int trackId, string imageUrl);

        // Лайки і прослуховування
        Task LikeAsync(int trackId);
        Task UnlikeAsync(int trackId);
        Task AddPlayAsync(int trackId);

        // Статистика
        Task<TrackStatsDto> GetTrackStatsAsync(int trackId);
        Task<AuthorStatsDto> GetAuthorStatsAsync(int authorId);


        Task<List<TrackDto>> GetLikedByUserAsync(int userId);

    }
}
