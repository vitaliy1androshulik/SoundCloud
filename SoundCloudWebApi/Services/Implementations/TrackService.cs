using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Album;
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



        public async Task AddListenAsync(int trackId)
        {
            var track = await _db.Tracks.FindAsync(trackId);
            if (track == null)
                throw new KeyNotFoundException("Track not found");

            // Збільшуємо лічильник
            track.PlayCount += 1;

            await _db.SaveChangesAsync();
        }




        public async Task<IEnumerable<TrackDto>> GetAllAsync()
        {
            return await _db.Tracks
                .AsNoTracking()
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                        .ThenInclude(a => a.Owner)
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    AuthorId = t.AuthorId,
                    Author = t.Author.Username,
                    Duration = t.Duration,
                    Url = t.Url,
                    ImageUrl = t.ImageUrl,
                    IsHidden = t.IsHidden,
                    PlayCount = t.PlayCount,
                    GenreId = t.GenreId.HasValue ? (int)t.GenreId.Value : 0,
                    Genre = t.Genre != null ? t.Genre.Name : null,
                    Albums = t.AlbumTracks
                        .Select(at => new AlbumDto
                        {
                            Id = at.Album.Id,
                            Title = at.Album.Title,
                            OwnerId = at.Album.OwnerId,
                            OwnerName = at.Album.Owner.Username,
                            CoverUrl = at.Album.CoverUrl,
                            CreatedAt = at.Album.CreatedAt,
                            IsPublic = at.Album.IsPublic
                        })
                        .ToList()
                })
                .ToListAsync();
        }


        public async Task<IEnumerable<TrackDto>> GetAllTracksAsync()
        {
            return await _db.Tracks
                .AsNoTracking()
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                        .ThenInclude(a => a.Owner)
                .Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    AuthorId = t.AuthorId,
                    Author = t.Author.Username,
                    Duration = t.Duration,
                    Url = t.Url,
                    ImageUrl = t.ImageUrl,
                    IsHidden = t.IsHidden,
                    PlayCount = t.PlayCount,
                    GenreId = t.GenreId.HasValue ? (int)t.GenreId.Value : 0,
                    Genre = t.Genre != null ? t.Genre.Name : null,

                    // Тут можемо повертати список альбомів для треку
                    Albums = t.AlbumTracks.Select(at => new AlbumDto
                    {
                        Id = at.Album.Id,
                        Title = at.Album.Title,
                        OwnerId = at.Album.OwnerId,
                        OwnerName = at.Album.Owner.Username,
                        CoverUrl = at.Album.CoverUrl,
                        CreatedAt = at.Album.CreatedAt,
                        IsPublic = at.Album.IsPublic
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<TrackDto?> GetByIdAsync(int id)
        {
            var (actorId, actorRole) = GetActor();

            var track = await _db.Tracks
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .Include(t => t.AlbumTracks)               // many-to-many зв'язки
                    .ThenInclude(at => at.Album)          // самі альбоми
                .ThenInclude(a => a.Owner)                // власник альбому
                .FirstOrDefaultAsync(t => t.Id == id);

            if (track == null) return null;

            // Перевірка доступу: якщо не адмін, трек повинен належати публічному альбому або твоєму альбому
            var allowed = actorRole == UserRole.Admin ||
                          track.AlbumTracks.Any(at => at.Album.IsPublic || at.Album.OwnerId == actorId);

            if (!allowed)
                throw new UnauthorizedAccessException("You are not allowed to view this track.");

            return new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                AuthorId = track.AuthorId,
                Author = track.Author.Username,
                Duration = track.Duration,
                Url = track.Url,
                ImageUrl = track.ImageUrl,
                IsHidden = track.IsHidden,
                PlayCount = track.PlayCount,
                GenreId = track.GenreId ?? 0,
                Genre = track.Genre?.Name,
                Albums = track.AlbumTracks.Select(at => new AlbumDto
                {
                    Id = at.Album.Id,
                    Title = at.Album.Title,
                    OwnerName = at.Album.Owner.Username,
                    CoverUrl = at.Album.CoverUrl,
                    IsPublic = at.Album.IsPublic
                }).ToList()
            };
        }


        public async Task<TrackDto> CreateAsync(CreateTrackDto dto)
        {
            var (actorId, actorRole) = GetActor();

            // Перевіряємо, чи існує альбом і його власника
            var album = await _db.Albums.Include(a => a.Owner)
                .FirstOrDefaultAsync(a => a.Id == dto.AlbumId)
                ?? throw new KeyNotFoundException($"Album {dto.AlbumId} not found");

            if (actorRole != UserRole.Admin && album.OwnerId != actorId)
                throw new UnauthorizedAccessException("You are not owner of this album");

            // Перевіряємо користувача-автора
            var author = await _db.Users.FindAsync(actorId)
                ?? throw new KeyNotFoundException($"Author {actorId} not found");

            // Створюємо трек
            var track = new TrackEntity
            {
                Title = dto.Title.Trim(),
                AuthorId = actorId,
                Duration = dto.Duration,
                GenreId = dto.GenreId,
                IsHidden = false,
                ImageUrl = null,
                CreatedAt = DateTime.UtcNow
            };

            _db.Tracks.Add(track);
            await _db.SaveChangesAsync();

            // Додаємо зв'язок трек → альбом
            _db.AlbumTracks.Add(new AlbumTrackEntity
            {
                AlbumId = dto.AlbumId,
                TrackId = track.Id
            });
            await _db.SaveChangesAsync();

            return new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                AuthorId = track.AuthorId,
                Author = author.Username,
                Duration = track.Duration,
                Url = track.Url,
                ImageUrl = track.ImageUrl,
                IsHidden = track.IsHidden,
                PlayCount = 0,
                GenreId = (int)track.GenreId,
                Genre = track.Genre != null ? track.Genre.Name : null,
                // Альбоми, до яких належить трек
                Albums = new List<AlbumDto>
        {
            new AlbumDto
            {
                Id = album.Id,
                Title = album.Title,
                Description = album.Description,
                OwnerId = album.OwnerId,
                OwnerName = album.Owner.Username,
                CoverUrl = album.CoverUrl,
                CreatedAt = album.CreatedAt
            }
        }
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

            // ===== Обробка обкладинки =====
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

            // ===== Створення треку =====
            var track = new TrackEntity
            {
                Title = dto.Title.Trim(),
                Url = url,
                Duration = dto.Duration,
                AuthorId = actorId,
                GenreId = dto.GenreId,
                IsHidden = false,
                ImageUrl = imageUrl,
                CreatedAt = DateTime.UtcNow
            };

            _db.Tracks.Add(track);
            await _db.SaveChangesAsync(); // зберігаємо трек, щоб отримати Id

            // ===== Прив'язка альбомів (many-to-many) =====
            List<AlbumEntity> albums = new List<AlbumEntity>();
            if (dto.AlbumIds != null && dto.AlbumIds.Any())
            {
                albums = await _db.Albums
                    .Include(a => a.Owner)
                    .Where(a => dto.AlbumIds.Contains(a.Id))
                    .ToListAsync();

                foreach (var album in albums)
                {
                    _db.AlbumTracks.Add(new AlbumTrackEntity
                    {
                        TrackId = track.Id,
                        AlbumId = album.Id
                    });
                }

                await _db.SaveChangesAsync();
            }

            // ===== Отримання назви жанру =====
            string? genreName = null;
            if (track.GenreId.HasValue)
            {
                var genre = await _db.Genres.FindAsync(track.GenreId.Value);
                genreName = genre?.Name;
            }

            // ===== Мапимо альбоми у AlbumDto =====
            var albumDtos = albums.Select(a => new AlbumDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                OwnerId = a.OwnerId,
                OwnerName = a.Owner.Username,
                CoverUrl = a.CoverUrl,
                IsPublic = a.IsPublic
            }).ToList();

            // ===== Повертаємо TrackDto =====
            return new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                Url = track.Url,
                Duration = track.Duration,
                AuthorId = track.AuthorId,
                Author = (await _db.Users.FindAsync(track.AuthorId))!.Username,
                ImageUrl = track.ImageUrl,
                IsHidden = track.IsHidden,
                GenreId = (int)track.GenreId,
                Genre = genreName,
                Albums = albumDtos
            };
        }



        public async Task<TrackDto> UpdateAsync(int id, UpdateTrackDto dto)
        {
            var track = await _db.Tracks
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                        .ThenInclude(a => a.Owner)
                .FirstOrDefaultAsync(t => t.Id == id)
                ?? throw new KeyNotFoundException($"Track {id} not found");

            var (actorId, actorRole) = GetActor();

            // Перевіряємо, чи є хоча б один альбом треку, власником якого є поточний користувач
            if (actorRole != UserRole.Admin && !track.AlbumTracks.Any(at => at.Album.OwnerId == actorId))
                throw new UnauthorizedAccessException("You are not allowed to update this track.");

            track.Title = dto.Title.Trim();
            track.AuthorId = dto.AuthorId;
            track.Duration = dto.Duration;
            track.GenreId = dto.GenreId;

            // Оновлюємо альбоми треку
            if (dto.AlbumIds != null)
            {
                // Видаляємо старі зв’язки
                var oldAlbumTracks = track.AlbumTracks.ToList();
                _db.AlbumTracks.RemoveRange(oldAlbumTracks);

                // Додаємо нові зв’язки
                foreach (var albumId in dto.AlbumIds)
                {
                    _db.AlbumTracks.Add(new AlbumTrackEntity
                    {
                        TrackId = track.Id,
                        AlbumId = albumId
                    });
                }
            }

            await _db.SaveChangesAsync();

            return new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                AuthorId = track.AuthorId,
                Author = track.Author.Username,
                Duration = track.Duration,
                Url = track.Url,
                ImageUrl = track.ImageUrl,
                IsHidden = track.IsHidden,
                PlayCount = track.PlayCount,
                GenreId = (int)track.GenreId,
                Genre = track.Genre?.Name,
                Albums = track.AlbumTracks.Select(at => new AlbumDto
                {
                    Id = at.Album.Id,
                    Title = at.Album.Title,
                    OwnerId = at.Album.OwnerId,
                    OwnerName = at.Album.Owner.Username,
                    CoverUrl = at.Album.CoverUrl,
                    IsPublic = at.Album.IsPublic
                }).ToList()
            };
        }

        public async Task DeleteAsync(int id)
        {
            var (actorId, actorRole) = GetActor();

            var track = await _db.Tracks
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                .FirstOrDefaultAsync(t => t.Id == id)
                ?? throw new KeyNotFoundException($"Track {id} not found");

            // Перевірка прав: трек можна видаляти, якщо користувач Admin або власник хоча б одного альбому
            if (actorRole != UserRole.Admin && !track.AlbumTracks.Any(at => at.Album.OwnerId == actorId))
                throw new UnauthorizedAccessException("You are not allowed to delete this track.");

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

            var track = await _db.Tracks
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                .FirstOrDefaultAsync(t => t.Id == trackId)
                ?? throw new KeyNotFoundException($"Track {trackId} not found");

            // Перевірка прав: користувач Admin або власник хоча б одного альбому
            if (actorRole != UserRole.Admin && !track.AlbumTracks.Any(at => at.Album.OwnerId == actorId))
                throw new UnauthorizedAccessException("You are not allowed to set image for this track.");

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
            var track = await _db.Tracks
                .Include(t => t.PlayCount)
                .FirstOrDefaultAsync(t => t.Id == trackId);

            if (track == null) throw new KeyNotFoundException($"Track {trackId} not found");

            return new TrackStatsDto
            {
                TrackId = trackId,
                PlayCount = track.PlayCount
            };
        }

        public async Task<AuthorStatsDto> GetAuthorStatsAsync(int authorId)
        {
            var tracks = await _db.Tracks
                .Include(t => t.PlayCount)
                .Where(t => t.AuthorId == authorId)
                .ToListAsync();

            return new AuthorStatsDto
            {
                AuthorId = authorId,
                Listens = tracks.Sum(t => t.PlayCount),
            };
        }
    }
}
