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
        Task<IEnumerable<TrackDto>> GetAllAsync(int userId);
        Task<TrackDto?> GetByIdAsync(int id);
        Task<TrackDto> CreateAsync(CreateTrackDto dto, int userId);

        Task UpdateAsync(int trackId, UpdateTrackDto dto);

        Task DeleteAsync(int trackId);

        Task HideAsync(int id);
        Task UnhideAsync(int id);
    }
}
