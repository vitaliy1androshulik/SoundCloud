using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Album;
using SoundCloudWebApi.Models.Track;
using SoundCloudWebApi.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

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

        // ===== CRUD для альбомів =====

        public async Task<IEnumerable<AlbumDto>> GetAllByUserAsync(int userId)
        {
            return await _db.Albums
                .Include(a => a.Owner)
                .Where(a => a.OwnerId == userId || a.IsPublic)
                .Select(a => new AlbumDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    CreatedAt = a.CreatedAt,
                    OwnerId = a.OwnerId,
                    OwnerName = a.Owner.Username,
                    CoverUrl = a.CoverUrl,
                    IsPublic = a.IsPublic
                })
                .ToListAsync();
        }

        public async Task<AlbumDto?> GetByIdAsync(int albumId)
        {
            var album = await _db.Albums
                .Include(a => a.Owner)
                .Include(a => a.AlbumTracks)
                    .ThenInclude(at => at.Track)
                .FirstOrDefaultAsync(a => a.Id == albumId && (a.IsPublic || a.OwnerId == GetActor().ActorId));

            if (album == null) return null;

            return new AlbumDto
            {
                Id = album.Id,
                Title = album.Title,
                Description = album.Description,
                CreatedAt = album.CreatedAt,
                OwnerId = album.OwnerId,
                OwnerName = album.Owner.Username,
                CoverUrl = album.CoverUrl,
                IsPublic = album.IsPublic
            };
        }

        public async Task<AlbumDto> CreateAsync(CreateAlbumDto dto)
        {
            var (actorId, _) = GetActor();

            var owner = await _db.Users.FindAsync(actorId)
                ?? throw new KeyNotFoundException($"User {actorId} not found");

            var entity = new AlbumEntity
            {
                Title = dto.Title,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                OwnerId = actorId,
                Owner = owner,
                IsPublic = dto.IsPublic
            };

            _db.Albums.Add(entity);
            await _db.SaveChangesAsync();

            return new AlbumDto
            {
                Id = entity.Id,
                Title = entity.Title,
                Description = entity.Description,
                CreatedAt = entity.CreatedAt,
                OwnerId = entity.OwnerId,
                OwnerName = owner.Username,
                CoverUrl = entity.CoverUrl,
                IsPublic = entity.IsPublic
            };
        }

        public async Task UpdateAsync(int albumId, CreateAlbumDto dto)
        {
            var (actorId, actorRole) = GetActor();
            var album = await _db.Albums.FindAsync(albumId)
                ?? throw new KeyNotFoundException($"Album {albumId} not found");

            if (actorRole != UserRole.Admin && album.OwnerId != actorId)
                throw new UnauthorizedAccessException("You are not owner of this album");

            album.Title = dto.Title;
            album.Description = dto.Description;
            album.IsPublic = dto.IsPublic;
            album.UpdatedAt = DateTime.UtcNow;
            album.UpdatedById = actorId;

            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(int albumId)
        {
            var (actorId, actorRole) = GetActor();
            var album = await _db.Albums.FindAsync(albumId)
                ?? throw new KeyNotFoundException($"Album {albumId} not found");

            if (actorRole != UserRole.Admin && album.OwnerId != actorId)
                throw new UnauthorizedAccessException("You are not owner of this album");

            _db.Albums.Remove(album);
            await _db.SaveChangesAsync();
        }

        public async Task SetCoverAsync(int albumId, string url)
        {
            var (actorId, actorRole) = GetActor();
            var album = await _db.Albums.FindAsync(albumId)
                ?? throw new KeyNotFoundException($"Album {albumId} not found");

            if (actorRole != UserRole.Admin && album.OwnerId != actorId)
                throw new UnauthorizedAccessException("You are not owner of this album");

            album.CoverUrl = url;
            album.UpdatedAt = DateTime.UtcNow;
            album.UpdatedById = actorId;

            await _db.SaveChangesAsync();
        }

        // ===== Для адміна =====
        public async Task<IEnumerable<AlbumDto>> GetAllAlbumsForAdminAsync()
        {
            return await _db.Albums
                .Include(a => a.Owner)
                .Include(a => a.AlbumTracks)
                    .ThenInclude(at => at.Track)
                .Select(a => new AlbumDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    CreatedAt = a.CreatedAt,
                    OwnerId = a.OwnerId,
                    OwnerName = a.Owner.Username,
                    CoverUrl = a.CoverUrl,
                    IsPublic = a.IsPublic
                })
                .ToListAsync();
        }

        // ===== Методи для треків =====

        public async Task<IEnumerable<TrackDto>> GetTracksByAlbumAsync(int albumId)
        {
            var album = await _db.Albums
                .Include(a => a.AlbumTracks)
                    .ThenInclude(at => at.Track)
                        .ThenInclude(t => t.Author)
                .Include(a => a.AlbumTracks)
                    .ThenInclude(at => at.Track)
                        .ThenInclude(t => t.Genre)
                .FirstOrDefaultAsync(a => a.Id == albumId && (a.IsPublic || a.OwnerId == GetActor().ActorId));

            if (album == null) return new List<TrackDto>();

            return album.AlbumTracks
                .Select(at => new TrackDto
                {
                    Id = at.Track.Id,
                    Title = at.Track.Title,
                    Author = at.Track.Author.Username,
                    Duration = at.Track.Duration,
                    Genre = at.Track.Genre?.Name,
                    PlayCount = at.Track.PlayCount,
                    ImageUrl = at.Track.ImageUrl
                })
                .ToList();
        }

        public async Task AddTrackToAlbumAsync(int albumId, int trackId)
        {
            var exists = await _db.AlbumTracks
                .AnyAsync(at => at.AlbumId == albumId && at.TrackId == trackId);

            if (!exists)
            {
                _db.AlbumTracks.Add(new AlbumTrackEntity
                {
                    AlbumId = albumId,
                    TrackId = trackId
                });
                await _db.SaveChangesAsync();
            }
        }

        public async Task RemoveTrackFromAlbumAsync(int albumId, int trackId)
        {
            var entity = await _db.AlbumTracks
                .FirstOrDefaultAsync(at => at.AlbumId == albumId && at.TrackId == trackId);

            if (entity != null)
            {
                _db.AlbumTracks.Remove(entity);
                await _db.SaveChangesAsync();
            }
        }
    }
}
