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
        Task<IEnumerable<TrackDto>> GetAllAsync();

        // Отримати трек за ID
        Task<TrackDto?> GetByIdAsync(int id);

        // Отримати всі треки (для фронтенду)
        Task<IEnumerable<TrackDto>> GetAllTracksAsync();

        // Створити трек (DTO містить AuthorId)
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

        // Лічильник прослуховувань та лайків
        Task LikeAsync(int trackId, int userId);
        Task UnlikeAsync(int trackId, int userId);
        Task AddListenAsync(int trackId);
        // Статистика
        Task<TrackStatsDto> GetTrackStatsAsync(int trackId);
        Task<AuthorStatsDto> GetAuthorStatsAsync(int authorId);
    }
}