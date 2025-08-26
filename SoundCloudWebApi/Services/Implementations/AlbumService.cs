using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Album;
using SoundCloudWebApi.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;


namespace SoundCloudWebApi.Services.Implementations
{
    public class AlbumService : IAlbumService
    {
        private readonly SoundCloudDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AlbumService(SoundCloudDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        private (int ActorId, UserRole ActorRole) GetActor()
        {
            var principal = _httpContextAccessor.HttpContext?.User
                ?? throw new UnauthorizedAccessException("No user in context");

            var idStr = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException("No NameIdentifier claim");

            var roleStr = principal.FindFirst(ClaimTypes.Role)?.Value ?? nameof(UserRole.User);
            if (!Enum.TryParse<UserRole>(roleStr, out var role)) role = UserRole.User;

            return (int.Parse(idStr), role);
        }

        public async Task<IEnumerable<AlbumDto>> GetAllAsync(int userId)
        {
            return await _db.Albums
                .Where(a => a.OwnerId == userId)
                .Select(a => new AlbumDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<AlbumDto?> GetByIdAsync(int id)
        {
            var a = await _db.Albums.FindAsync(id);
            if (a == null) return null;
            return new AlbumDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                CreatedAt = a.CreatedAt
            };
        }

        public async Task<AlbumDto> CreateAsync(CreateAlbumDto dto, int userId)
        {

            var entity = new AlbumEntity
            {
                Title = dto.Title,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                OwnerId = userId
            };
            _db.Albums.Add(entity);
            await _db.SaveChangesAsync();

            return new AlbumDto
            {
                Id = entity.Id,
                Title = entity.Title,
                Description = entity.Description,
                CreatedAt = entity.CreatedAt
            };
        }

        public async Task UpdateAsync(int id, AlbumDto dto)
        {
            var (actorId, actorRole) = GetActor();
            var a = await _db.Albums.FindAsync(id)
                    ?? throw new KeyNotFoundException($"Album {id} не знайдено");
            if (actorRole != UserRole.Admin && a.OwnerId != actorId)
                throw new UnauthorizedAccessException("You are not owner of this album");
            a.Title = dto.Title;
            a.Description = dto.Description;
            // CreatedAt це як парвило не змінюєм
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var (actorId, actorRole) = GetActor();
            var a = await _db.Albums.FindAsync(id)
                    ?? throw new KeyNotFoundException($"Album {id} не знайдено");
            if (actorRole != UserRole.Admin && a.OwnerId != actorId)
                throw new UnauthorizedAccessException("You are not owner of this album");
            _db.Albums.Remove(a);
            await _db.SaveChangesAsync();
        }
    }
}
