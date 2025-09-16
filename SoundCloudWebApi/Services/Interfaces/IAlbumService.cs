using System.Collections.Generic;
using System.Threading.Tasks;
using SoundCloudWebApi.Models.Album;

namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IAlbumService
    {
        // Отримати всі альбоми конкретного користувача
        Task<IEnumerable<AlbumDto>> GetAllAsync(int userId);

        // Отримати альбом за ID
        Task<AlbumDto?> GetByIdAsync(int id);

        // Створити альбом для конкретного користувача
        Task<AlbumDto> CreateAsync(CreateAlbumDto dto);

        // Оновити альбом
        Task UpdateAsync(int albumId, CreateAlbumDto dto);

        // Видалити альбом
        Task DeleteAsync(int albumId);

        // Оновити обкладинку
        Task SetCoverAsync(int albumId, string url);

        // Для адміна: отримати всі альбоми
        Task<IEnumerable<AlbumDto>> GetAllAlbumsForAdminAsync();
    }
}