using SoundCloudWebApi.Models.Genre;

namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IGenreService
    {
        Task<IEnumerable<GenreDto>> GetAllAsync();
        Task<GenreDto?> GetByIdAsync(int id);
        Task<GenreDto> CreateAsync(GenreCreateDto dto);
        Task UpdateAsync(int id, GenreUpdateDto dto);
        Task DeleteAsync(int id);
    }
}
