using SoundCloudWebApi.Models.Playlist;
using SoundCloudWebApi.Models.Track;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IPlaylistService
    {
        // Отримати всі плейлисти конкретного користувача
        Task<IEnumerable<PlaylistDto>> GetAllAsync(int userId);

        // Отримати плейлист за ID
        Task<PlaylistDto?> GetByIdAsync(int id);

        // Створити плейлист для конкретного користувача
        Task<PlaylistDto> CreateAsync(CreatePlaylistDto dto);

        // Оновити плейлист
        Task UpdateAsync(int playlistId, CreatePlaylistDto dto);

        // Видалити плейлист
        Task DeleteAsync(int playlistId);

        // Оновити обкладинку плейлиста
        Task SetCoverAsync(int playlistId, IFormFile url);


        //
        Task AddTrackAsync(int playlistId, int trackId);
        Task RemoveTrackAsync(int playlistId, int trackId);

        Task<IEnumerable<TrackDto>> GetTracksByPlaylistAsync(int playlistId);


        //Task<IEnumerable<TrackDto>> GetTracksByPlaylistAsync(int playlistId);

        Task<IEnumerable<PlaylistDto>> GetAllByUserIdAsync(int userId);


    }
}