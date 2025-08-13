using System.Collections.Generic;
using System.Threading.Tasks;
using SoundCloudWebApi.Models.Playlist;

namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IPlaylistService
    {

        Task<IEnumerable<PlaylistDto>> GetAllAsync(int userId);

        Task<PlaylistDto?> GetByIdAsync(int id);

        Task<PlaylistDto> CreateAsync(CreatePlaylistDto dto, int userId);

        //Task UpdateAsync(int id, PlaylistDto dto);
        Task UpdateAsync(int playlistId, PlaylistDto dto);

        Task DeleteAsync(int playlistId);

    }
}
