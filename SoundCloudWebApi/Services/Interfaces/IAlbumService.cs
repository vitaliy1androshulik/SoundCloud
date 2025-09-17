using System.Collections.Generic;
using System.Threading.Tasks;
using SoundCloudWebApi.Models.Album;
using SoundCloudWebApi.Models.Track;

namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IAlbumService
    {
        // ===== CRUD для альбомів =====

        // Отримати всі публічні альбоми та альбоми поточного користувача
        Task<IEnumerable<AlbumDto>> GetAllByUserAsync(int userId);

        // Отримати альбом за ID
        Task<AlbumDto?> GetByIdAsync(int albumId);

        // Створити новий альбом
        Task<AlbumDto> CreateAsync(CreateAlbumDto dto);

        // Оновити альбом
        Task UpdateAsync(int albumId, CreateAlbumDto dto);

        // Видалити альбом
        Task DeleteAsync(int albumId);

        // Завантажити обкладинку альбому
        Task SetCoverAsync(int albumId, string url);

        // ===== Для адміна =====
        Task<IEnumerable<AlbumDto>> GetAllAlbumsForAdminAsync();

        // ===== Методи для треків у альбомі =====
        Task<IEnumerable<TrackDto>> GetTracksByAlbumAsync(int albumId);

        Task AddTrackToAlbumAsync(int albumId, int trackId);

        Task RemoveTrackFromAlbumAsync(int albumId, int trackId);
    }
}
