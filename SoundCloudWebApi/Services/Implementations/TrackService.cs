using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Track;
using SoundCloudWebApi.Services.Interfaces;
using System.Security.Claims;

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



        public async Task AddPlayAsync(int trackId)
        {
            // Знаходимо трек у базі
            var track = await _db.Tracks
                .FirstOrDefaultAsync(t => t.Id == trackId);

            if (track == null)
                throw new Exception("Track not found");

            var ownerId = track.AuthorId; // id користувача, який створив трек

            // Додаємо одне прослуховування до самого треку
            track.PlayCount += 1;

            // Шукаємо існуючий запис TrackListen для власника
            var listen = await _db.TrackListens
                .FirstOrDefaultAsync(x => x.TrackId == trackId && x.UserId == ownerId);

            if (listen != null)
            {
                listen.PlayCount = track.PlayCount;
            }
            else
            {
                listen = new TrackListenEntity
                {
                    TrackId = trackId,
                    UserId = ownerId,
                    PlayCount = 1
                };
                await _db.TrackListens.AddAsync(listen);
            }

            await _db.SaveChangesAsync();
        }




        public async Task<IEnumerable<TrackDto>> GetAllAsync()
        {
            var (actorId, _) = GetActor();

            return await _db.Tracks
                .AsNoTracking()
                .Include(t => t.Album).ThenInclude(a => a.Owner)
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .Where(t => t.Album.OwnerId == actorId && !t.IsHidden)
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    AuthorId = t.AuthorId,
                    Author = t.Author.Username,
                    Duration = t.Duration,
                    AlbumId = t.AlbumId,
                    Url = t.Url,
                    ImageUrl = t.ImageUrl,
                    IsHidden = t.IsHidden,
                    PlayCount = t.PlayCount,
                    GenreId = (int)t.GenreId,
                    Genre = t.Genre.Name
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<TrackDto>> GetAllTracksAsync()
        {
            return await _db.Tracks
                .AsNoTracking()
                .Include(t => t.Album).ThenInclude(a => a.Owner)
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    AuthorId = t.AuthorId,
                    Author = t.Author.Username,
                    Duration = t.Duration,
                    AlbumId = t.AlbumId,
                    Url = t.Url,
                    ImageUrl = t.ImageUrl,
                    IsHidden = t.IsHidden,
                    PlayCount = t.PlayCount,
                    GenreId = (int)t.GenreId,
                    Genre = t.Genre != null ? t.Genre.Name : null
                })
                .ToListAsync();
        }

        public async Task<TrackDto?> GetByIdAsync(int id)
        {
            var (actorId, actorRole) = GetActor();

            var t = await _db.Tracks
                .Include(x => x.Album).ThenInclude(a => a.Owner)
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (t == null) return null;

            if (actorRole != UserRole.Admin && t.Album.OwnerId != actorId)
                throw new UnauthorizedAccessException("You are not allowed to view this track.");

            return new TrackDto
            {
                Id = t.Id,
                Title = t.Title,
                AuthorId = t.AuthorId,
                Author = t.Author.Username,
                Duration = t.Duration,
                AlbumId = t.AlbumId,
                Url = t.Url,
                ImageUrl = t.ImageUrl,
                IsHidden = t.IsHidden,
                PlayCount = t.PlayCount,
                GenreId = (int)t.GenreId,
                Genre = t.Genre != null ? t.Genre.Name : null
            };
        }

        public async Task<TrackDto> CreateAsync(CreateTrackDto dto)
        {
            var (actorId, actorRole) = GetActor();

            var album = await _db.Albums.Include(a => a.Owner)
                .FirstOrDefaultAsync(a => a.Id == dto.AlbumId)
                ?? throw new KeyNotFoundException($"Album {dto.AlbumId} not found");

            if (actorRole != UserRole.Admin && album.OwnerId != actorId)
                throw new UnauthorizedAccessException("You are not owner of this album");

            var author = await _db.Users.FindAsync(actorId)
                ?? throw new KeyNotFoundException($"Author {actorId} not found");

            var track = new TrackEntity
            {
                Title = dto.Title.Trim(),
                AuthorId = actorId,
                AlbumId = dto.AlbumId,
                Duration = dto.Duration,
                GenreId = dto.GenreId,
                IsHidden = false,
                ImageUrl = null,
                CreatedAt = DateTime.UtcNow
            };

            _db.Tracks.Add(track);
            await _db.SaveChangesAsync();

            return new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                AuthorId = track.AuthorId,
                Author = author.Username,
                Duration = track.Duration,
                AlbumId = track.AlbumId,
                Url = track.Url,
                ImageUrl = track.ImageUrl,
                IsHidden = track.IsHidden,
                PlayCount = 0,
                GenreId = (int)track.GenreId,
                Genre = track.Genre != null ? track.Genre.Name : null
            };
        }

        public async Task<TrackDto> CreateAsyncFile(CreateTrackDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                throw new ArgumentException("Файл не надано");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "tracks");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.File.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);
            var (actorId, actorRole) = GetActor();
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            var url = $"/uploads/tracks/{fileName}";

            string? imageUrl = null;
            if (dto.Cover != null && dto.Cover.Length > 0)
            {
                var coverFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "tracks", "cover");
                if (!Directory.Exists(coverFolder))
                    Directory.CreateDirectory(coverFolder);

                var coverFileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Cover.FileName);
                var coverFilePath = Path.Combine(coverFolder, coverFileName);

                using (var coverStream = new FileStream(coverFilePath, FileMode.Create))
                {
                    await dto.Cover.CopyToAsync(coverStream);
                }

                imageUrl = $"/uploads/tracks/cover/{coverFileName}";
            }
            var (getedactorId, getedactorRole) = GetActor();
            var track = new TrackEntity
            {
                Title = dto.Title.Trim(),
                Url = url,
                Duration = dto.Duration,
                AlbumId = dto.AlbumId,
                AuthorId = getedactorId,
                GenreId = dto.GenreId,  
                IsHidden = false,
                ImageUrl = imageUrl,
                CreatedAt = DateTime.UtcNow
            };

            _db.Tracks.Add(track);
            await _db.SaveChangesAsync();

            // ===== Отримання назви жанру =====
            string? genreName = null;
            if (track.GenreId.HasValue)
            {
                var genre = await _db.Genres.FindAsync(track.GenreId.Value);
                genreName = genre?.Name;
            }

            // TrackDto
            return new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                Url = track.Url,
                Duration = track.Duration,
                AlbumId = track.AlbumId,
                AuthorId = track.AuthorId,
                Author = (await _db.Users.FindAsync(track.AuthorId))!.Username,
                ImageUrl = track.ImageUrl,
                IsHidden = track.IsHidden,
                GenreId = (int)track.GenreId,  
                Genre = genreName
            };
        }

        public async Task<TrackDto> UpdateAsync(int id, UpdateTrackDto dto)
        {
            var track = await _db.Tracks.Include(t => t.Album).ThenInclude(a => a.Owner)
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .FirstOrDefaultAsync(t => t.Id == id)
                ?? throw new KeyNotFoundException($"Track {id} not found");

            var (actorId, actorRole) = GetActor();
            if (actorRole != UserRole.Admin && track.Album.OwnerId != actorId)
                throw new UnauthorizedAccessException("You are not owner of this album");

            track.Title = dto.Title.Trim();
            track.AuthorId = dto.AuthorId;
            track.Duration = dto.Duration;
            track.AlbumId = dto.AlbumId;
            track.GenreId = dto.GenreId; // нове поле для жанру

            await _db.SaveChangesAsync();

            return new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                AuthorId = track.AuthorId,
                Author = track.Author.Username,
                Duration = track.Duration,
                AlbumId = track.AlbumId,
                Url = track.Url,
                ImageUrl = track.ImageUrl,
                IsHidden = track.IsHidden,
                PlayCount = track.PlayCount,
                GenreId = (int)track.GenreId,
                Genre = track.Genre != null ? track.Genre.Name : null
            };
        }

        public async Task DeleteAsync(int id)
        {
            var (actorId, actorRole) = GetActor();
            var track = await _db.Tracks.Include(t => t.Album).ThenInclude(a => a.Owner)
                .FirstOrDefaultAsync(t => t.Id == id)
                ?? throw new KeyNotFoundException($"Track {id} not found");

            if (actorRole != UserRole.Admin && track.Album.OwnerId != actorId)
                throw new UnauthorizedAccessException("You are not owner of this album");

            _db.Tracks.Remove(track);
            await _db.SaveChangesAsync();
        }

        public async Task HideAsync(int id)
        {
            var (_, actorRole) = GetActor();
            if (actorRole != UserRole.Admin && actorRole != UserRole.Moderator)
                throw new UnauthorizedAccessException("Moderator/Admin only");

            var track = await _db.Tracks.FindAsync(id)
                ?? throw new KeyNotFoundException($"Track {id} not found");

            track.IsHidden = true;
            await _db.SaveChangesAsync();
        }

        public async Task UnhideAsync(int id)
        {
            var (_, actorRole) = GetActor();
            if (actorRole != UserRole.Admin && actorRole != UserRole.Moderator)
                throw new UnauthorizedAccessException("Moderator/Admin only");

            var track = await _db.Tracks.FindAsync(id)
                ?? throw new KeyNotFoundException($"Track {id} not found");

            track.IsHidden = false;
            await _db.SaveChangesAsync();
        }

        public async Task SetImageAsync(int trackId, string imageUrl)
        {
            var (actorId, actorRole) = GetActor();
            var track = await _db.Tracks.Include(t => t.Album).ThenInclude(a => a.Owner)
                .FirstOrDefaultAsync(t => t.Id == trackId)
                ?? throw new KeyNotFoundException($"Track {trackId} not found");

            if (actorRole != UserRole.Admin && track.Album.OwnerId != actorId)
                throw new UnauthorizedAccessException("You are not owner of this album");

            track.ImageUrl = imageUrl;
            await _db.SaveChangesAsync();
        }


        public async Task LikeAsync(int trackId, int userId)
        {
            var exists = await _db.Tracks.AnyAsync(t => t.Id == trackId);
            if (!exists) throw new KeyNotFoundException($"Track {trackId} not found");

            var already = await _db.TrackLikes.AnyAsync(l => l.TrackId == trackId && l.UserId == userId);
            if (already) throw new InvalidOperationException("Already liked");

            _db.TrackLikes.Add(new TrackLikeEntity { TrackId = trackId, UserId = userId });
            await _db.SaveChangesAsync();
        }

        public async Task UnlikeAsync(int trackId, int userId)
        {
            var like = await _db.TrackLikes.FirstOrDefaultAsync(l => l.TrackId == trackId && l.UserId == userId);
            if (like == null) throw new KeyNotFoundException("Like not found");

            _db.TrackLikes.Remove(like);
            await _db.SaveChangesAsync();
        }

        public async Task<TrackStatsDto> GetTrackStatsAsync(int trackId)
        {
            // Підвантажуємо трек разом з автором
            var track = await _db.Tracks
                .Include(t => t.Author) // навігаційна властивість
                .FirstOrDefaultAsync(t => t.Id == trackId);

            if (track == null)
                throw new KeyNotFoundException($"Track {trackId} not found");

            return new TrackStatsDto
            {
                TrackId = track.Id,
                Title = track.Title,
                AuthorId = track.AuthorId,
                AuthorName = track.Author?.Username,
                AuthorAvatarUrl = track.Author?.AvatarUrl,
                PlayCount = track.PlayCount
            };
        }

        public async Task<AuthorStatsDto> GetAuthorStatsAsync(int authorId)
        {
            var author = await _db.Users
                .FirstOrDefaultAsync(u => u.Id == authorId);

            if (author == null) throw new KeyNotFoundException($"Author {authorId} not found");

            var totalPlays = await _db.Tracks
                .Where(t => t.AuthorId == authorId)
                .SumAsync(t => t.PlayCount);

            return new AuthorStatsDto
            {
                UserId = author.Id,
                Username = author.Username,
                AvatarUrl = author.AvatarUrl,
                TotalPlays = totalPlays
            };
        }
    }
}
