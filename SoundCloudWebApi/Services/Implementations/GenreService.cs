using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Genre;
using SoundCloudWebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Services.Implementations
{
    public class GenreService : IGenreService
    {
        private readonly SoundCloudDbContext _db;

        public GenreService(SoundCloudDbContext db)
        {
            _db = db;
        }

        // Отримати всі жанри
        public async Task<IEnumerable<GenreDto>> GetAllAsync()
        {
            return await _db.Genres
                .Select(g => new GenreDto
                {
                    Id = g.Id,
                    Name = g.Name,
                    PlayCount = g.PlayCount
                })
                .ToListAsync();
        }

        // Отримати жанр за ID
        public async Task<GenreDto?> GetByIdAsync(int id)
        {
            var genre = await _db.Genres.FindAsync(id);
            if (genre == null) return null;

            return new GenreDto
            {
                Id = genre.Id,
                Name = genre.Name,
                PlayCount = genre.PlayCount
            };
        }

        // Створити новий жанр
        public async Task<GenreDto> CreateAsync(GenreCreateDto dto)
        {
            var entity = new GenreEntity
            {
                Name = dto.Name
            };

            _db.Genres.Add(entity);
            await _db.SaveChangesAsync();

            return new GenreDto
            {
                Id = entity.Id,
                Name = entity.Name,
                PlayCount = entity.PlayCount
            };
        }

        // Оновити жанр
        public async Task UpdateAsync(int id, GenreUpdateDto dto)
        {
            var genre = await _db.Genres.FindAsync(id)
                        ?? throw new KeyNotFoundException($"Genre {id} not found");

            genre.Name = dto.Name;
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var genre = await _db.Genres.FindAsync(id)
                        ?? throw new KeyNotFoundException($"Genre {id} not found");

            _db.Genres.Remove(genre);
            await _db.SaveChangesAsync();
        }
    }
}
