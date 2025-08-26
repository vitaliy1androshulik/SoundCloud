using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Track;
using SoundCloudWebApi.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace SoundCloudWebApi.Services.Implementations
{
    public class TrackService : ITrackService
    {   
        private readonly SoundCloudDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TrackService(SoundCloudDbContext db, IHttpContextAccessor httpContextAccessor)
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

        public async Task<IEnumerable<TrackDto>> GetAllAsync(int userId)
        {
            // за потреби фільтр на userId або видимі треки
            return await _db.Tracks
                .Where(t => !t.IsHidden)
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Duration = t.Duration,
                    IsHidden = t.IsHidden
                })
                .ToListAsync();
        }

        public async Task<TrackDto?> GetByIdAsync(int id)
        {
            var t = await _db.Tracks.FindAsync(id);
            if (t == null) return null;
            return new TrackDto
            {
                Id = t.Id,
                Title = t.Title,
                Duration = t.Duration,
                IsHidden = t.IsHidden
            };
        }

        public async Task<TrackDto> CreateAsync(CreateTrackDto dto, int userId)
        {
            var (actorId, actorRole) = GetActor();
            var album = await _db.Albums.FindAsync(dto.AlbumId)
            ?? throw new KeyNotFoundException($"Альбом {dto.AlbumId} не знайдено");

            if (actorRole != UserRole.Admin && album.OwnerId != actorId)
                throw new UnauthorizedAccessException("Ви не є власником цього альбому");

            var entity = new TrackEntity
            {
                Title = dto.Title,
                Url = dto.Url,
                Duration = dto.Duration,
                AlbumId = dto.AlbumId,
                IsHidden = false
            };
            _db.Tracks.Add(entity);
            await _db.SaveChangesAsync();

            return new TrackDto
            {
                Id = entity.Id,
                Title = entity.Title,
                Duration = entity.Duration,
                IsHidden = entity.IsHidden
            };
        }

        public async Task UpdateAsync(int id, UpdateTrackDto dto)
        {
            var (actorId, actorRole) = GetActor();
            //var t = await _db.Tracks.FindAsync(id)
            //        ?? throw new KeyNotFoundException($"Track {id} не знайдено");
            var t = await _db.Tracks
                .Include(x => x.Album)
                .FirstOrDefaultAsync(x => x.Id == id)
                ?? throw new KeyNotFoundException($"Track {id} не знайдено");

            if (actorRole != UserRole.Admin && t.Album.OwnerId != actorId)
                throw new UnauthorizedAccessException("Ви не є власником цього альбому");


            t.Title = dto.Title;
            t.Url = dto.Url;
            t.Duration = dto.Duration;
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var (actorId, actorRole) = GetActor();
            //var t = await _db.Tracks.FindAsync(id)
            //        ?? throw new KeyNotFoundException($"Track {id} не знайдено");

            var t = await _db.Tracks
            .Include(x => x.Album)
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new KeyNotFoundException($"Track {id} не знайдено");

            if (actorRole != UserRole.Admin && t.Album.OwnerId != actorId)
                throw new UnauthorizedAccessException("Ви не є власником цього альбому");

            _db.Tracks.Remove(t);
            await _db.SaveChangesAsync();
        }

        public async Task HideAsync(int id)
        {
            var (_, actorRole) = GetActor();
            if (actorRole != UserRole.Admin && actorRole != UserRole.Moderator)
                throw new UnauthorizedAccessException("Moderator/Admin only");

            var t = await _db.Tracks.FindAsync(id)
                    ?? throw new KeyNotFoundException($"Track {id} не знайдено");
            t.IsHidden = true;
            await _db.SaveChangesAsync();
        }

        public async Task UnhideAsync(int id)
        {
            var (_, actorRole) = GetActor();
            if (actorRole != UserRole.Admin && actorRole != UserRole.Moderator)
                throw new UnauthorizedAccessException("Moderator/Admin only");

            var t = await _db.Tracks.FindAsync(id)
                    ?? throw new KeyNotFoundException($"Track {id} не знайдено");
            t.IsHidden = false;
            await _db.SaveChangesAsync();
        }
    }
}
