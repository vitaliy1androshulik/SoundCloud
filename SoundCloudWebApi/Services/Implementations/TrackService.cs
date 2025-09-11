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

            return (int.Parse(idStr), role);       }

        public async Task<IEnumerable<TrackDto>> GetAllAsync()
        {
            var (actorId, _) = GetActor();

            var list = await _db.Tracks
                .AsNoTracking()
                .Where(t => t.Album.OwnerId == actorId && !t.IsHidden) //  фільтр по власнику
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Url = t.Url,
                    Duration = t.Duration,
                    AlbumId = t.AlbumId,
                    ImageUrl = t.ImageUrl,
                    IsHidden = t.IsHidden
                })
                .ToListAsync();

            return list;
        }
        public async Task<IEnumerable<TrackDto>> GetAllTracksAsync()
        {

            var list = await _db.Tracks
                .AsNoTracking()
                //.Where(t => t.Album.OwnerId == actorId && !t.IsHidden) //  фільтр по власнику
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Url = t.Url,
                    Duration = t.Duration,
                    AlbumId = t.AlbumId,
                    ImageUrl = t.ImageUrl,
                    IsHidden = t.IsHidden
                })
                .ToListAsync();

            return list;
        }
        public async Task<TrackDto?> GetByIdAsync(int id)
        {
            var (actorId, actorRole) = GetActor();

            //var t = await _db.Tracks.FindAsync(id);
            var t = await _db.Tracks
                .Include(x => x.Album)
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
            if (t == null) return null;
            // якщо це не адмін — дозволяємо бачити лише СВОЇ треки (або не приховані, на наш вибір)
            if (actorRole != UserRole.Admin && t.Album.OwnerId != actorId)
                throw new UnauthorizedAccessException("You are not allowed to view this track.");
            return new TrackDto
            {
                Id = t.Id,
                Title = t.Title,
                Url = t.Url,
                Duration = t.Duration,
                AlbumId = t.AlbumId,
                ImageUrl = t.ImageUrl,
                IsHidden = t.IsHidden
            };
        }

        public async Task<TrackDto> CreateAsync(CreateTrackDto dto)
        {
            var (actorId, actorRole) = GetActor();

            //var album = await _db.Albums.FindAsync(dto.AlbumId)
            var albumOwner = await _db.Albums
                .Where(a => a.Id == dto.AlbumId)
                .Select(a => new { a.OwnerId })
                .SingleOrDefaultAsync();

            if (albumOwner is null)
                throw new KeyNotFoundException($"Album {dto.AlbumId} не знайдено");

            if (actorRole != UserRole.Admin && albumOwner.OwnerId != actorId)
                throw new UnauthorizedAccessException("Ви не є власником цього альбому");

            var entity = new TrackEntity
            {
                Title = dto.Title.Trim(),
                Url = dto.Url,
                Duration = dto.Duration,
                AlbumId = dto.AlbumId,
                IsHidden = false,
                ImageUrl = null,
                CreatedAt = DateTime.UtcNow
            };
            _db.Tracks.Add(entity);
            await _db.SaveChangesAsync();

            return new TrackDto
            {
                Id = entity.Id,
                Title = entity.Title,
                Url = entity.Url,
                Duration = entity.Duration,
                AlbumId = entity.AlbumId,
                ImageUrl = entity.ImageUrl,
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

        public async Task SetImageAsync(int trackId, string url)
        {
            var (actorId, actorRole) = GetActor();
            var t = await _db.Tracks.Include(x => x.Album)
                     .FirstOrDefaultAsync(x => x.Id == trackId)
                     ?? throw new KeyNotFoundException($"Track {trackId} не знайдено");

            if (actorRole != UserRole.Admin && t.Album.OwnerId != actorId)
                throw new UnauthorizedAccessException("Ви не є власником цього альбому");

            t.ImageUrl = url;
            await _db.SaveChangesAsync();
        }

        public async Task AddListenAsync(int trackId, int userId)
        {
            var exists = await _db.Tracks.AnyAsync(t => t.Id == trackId);
            if (!exists) throw new KeyNotFoundException("Track not found");

            _db.TrackListens.Add(new TrackListenEntity
            {
                TrackId = trackId,
                UserId = userId
            });

            await _db.SaveChangesAsync();
        }

        //public async Task AddLikeAsync(int trackId, int userId)
        //{
        //    var alreadyLiked = await _db.TrackLikes
        //        .AnyAsync(l => l.TrackId == trackId && l.UserId == userId);

        //    if (alreadyLiked)
        //        throw new InvalidOperationException("Already liked");

        //    _db.TrackLikes.Add(new TrackLikeEntity
        //    {
        //        TrackId = trackId,
        //        UserId = userId
        //    });

        //    await _db.SaveChangesAsync();
        //}

        public async Task LikeAsync(int trackId, int userId)
        {
            var exists = await _db.Tracks.AnyAsync(t => t.Id == trackId);
            if (!exists) throw new KeyNotFoundException($"Track {trackId} not found");

            var already = await _db.TrackLikes
                .AnyAsync(l => l.TrackId == trackId && l.UserId == userId);
            if (already)
                throw new InvalidOperationException("Already liked");

            _db.TrackLikes.Add(new TrackLikeEntity
            {
                TrackId = trackId,
                UserId = userId
            });

            await _db.SaveChangesAsync();
        }

        public async Task UnlikeAsync(int trackId, int userId)
        {
            var like = await _db.TrackLikes
                .FirstOrDefaultAsync(l => l.TrackId == trackId && l.UserId == userId);

            if (like == null)
                throw new KeyNotFoundException("Like not found");

            _db.TrackLikes.Remove(like);
            await _db.SaveChangesAsync();
        }

        public async Task<TrackStatsDto> GetTrackStatsAsync(int trackId)
        {
            var exists = await _db.Tracks.AnyAsync(t => t.Id == trackId);
            if (!exists) throw new KeyNotFoundException($"Track {trackId} not found");

            var listens = await _db.TrackListens.CountAsync(l => l.TrackId == trackId);
            var likes = await _db.TrackLikes.CountAsync(l => l.TrackId == trackId);

            return new TrackStatsDto
            {
                TrackId = trackId,
                Listens = listens,
                Likes = likes
            };
        }

        public async Task<AuthorStatsDto> GetAuthorStatsAsync(int authorId)
        {
            // кількість треків у автора
            var tracksCount = await _db.Tracks.CountAsync(t => t.Album.OwnerId == authorId);

            // сумарні прослуховування по всіх треках автора
            var listens = await _db.TrackListens
                .CountAsync(l => l.Track.Album.OwnerId == authorId);

            // сумарні лайки по всіх треках автора
            var likes = await _db.TrackLikes
                .CountAsync(l => l.Track.Album.OwnerId == authorId);

            return new AuthorStatsDto
            {
                AuthorId = authorId,
                Tracks = tracksCount,
                Listens = listens,
                Likes = likes
            };
        }

    }
}
