using System.Collections.Generic;
using System.Threading.Tasks;
using SoundCloudWebApi.Models.Album;

namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IAlbumService
    {

        Task<IEnumerable<AlbumDto>> GetAllAsync(int userId);

        Task<AlbumDto?> GetByIdAsync(int id);

        Task<AlbumDto> CreateAsync(CreateAlbumDto dto, int userId);

        Task UpdateAsync(int albumId, AlbumDto dto);

        Task DeleteAsync(int albumId);



    }
}