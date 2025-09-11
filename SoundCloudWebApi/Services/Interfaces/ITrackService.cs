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
        //Task<IEnumerable<TrackDto>> GetAllAsync(int userId);
        Task<IEnumerable<TrackDto>> GetAllAsync();
        Task<TrackDto?> GetByIdAsync(int id);
        //Task<TrackDto> CreateAsync(CreateTrackDto dto, int userId);
        Task<IEnumerable<TrackDto>> GetAllTracksAsync();
        Task<TrackDto> CreateAsync(CreateTrackDto dto);
        Task<TrackDto> CreateAsyncFile(CreateTrackDto dto);
        Task UpdateAsync(int trackId, UpdateTrackDto dto);

        Task DeleteAsync(int trackId);

        Task HideAsync(int id);
        Task UnhideAsync(int id);
        Task SetImageAsync(int trackId, string imageUrl);

        // НОВЕ:
        Task AddListenAsync(int trackId, int userId);
        Task LikeAsync(int trackId, int userId);
        Task UnlikeAsync(int trackId, int userId);

        Task<TrackStatsDto> GetTrackStatsAsync(int trackId);
        Task<AuthorStatsDto> GetAuthorStatsAsync(int authorId);

    }
}
