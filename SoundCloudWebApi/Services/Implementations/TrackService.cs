using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Migrations;
using SoundCloudWebApi.Models.Album;
using SoundCloudWebApi.Models.Track;
using SoundCloudWebApi.Services.Interfaces;
using System.Security.Claims;
using TagLib;

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

        public async Task<IEnumerable<TrackDto>> GetAllByUserAsync(int userId)
        {
            var tracks = await _db.Tracks
                .AsNoTracking()
                .Where(t => t.AuthorId == userId) // фільтруємо тільки треки користувача
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                        .ThenInclude(a => a.Owner)
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .ToListAsync();

            return tracks.Select(t => new TrackDto
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
                GenreId = t.GenreId ?? 0,
                Genre = t.Genre != null ? t.Genre.Name : null,
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
            });
        }


        public async Task<IEnumerable<TrackDto>> GetAllAsync()
        {
            var (actorId, _) = GetActor(); // id поточного користувача

            return await _db.Tracks
                .AsNoTracking()
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                        .ThenInclude(a => a.Owner)
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .Include(t => t.TrackLikes) // підвантажуємо лайки
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
                        .ToList(),

                    // ===== нові поля лайків =====
                    LikesCount = t.TrackLikes.Count(),
                    IsLikedByCurrentUser = t.TrackLikes.Any(l => l.UserId == actorId)
                })
                .ToListAsync();
        }



        public async Task<IEnumerable<TrackDto>> GetAllTracksAsync()
        {
            var (actorId, _) = GetActor(); // id поточного користувача

            return await _db.Tracks
                .AsNoTracking()
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                        .ThenInclude(a => a.Owner)
                .Include(t => t.TrackLikes) // підвантажуємо лайки
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

                    Albums = t.AlbumTracks.Select(at => new AlbumDto
                    {
                        Id = at.Album.Id,
                        Title = at.Album.Title,
                        OwnerId = at.Album.OwnerId,
                        OwnerName = at.Album.Owner.Username,
                        CoverUrl = at.Album.CoverUrl,
                        CreatedAt = at.Album.CreatedAt,
                        IsPublic = at.Album.IsPublic
                    }).ToList(),

                    LikesCount = t.TrackLikes.Count(),
                    IsLikedByCurrentUser = t.TrackLikes.Any(l => l.UserId == actorId)
                })
                .ToListAsync();
        }

        public async Task<TrackDto?> GetByIdAsync(int id)
        {
            return await GetByIdInternalAsync(id, includeUserLikes: true);
        }

        public async Task<TrackDto> GetByIdInternalAsync(int id, bool includeUserLikes)
        {
            var (actorId, _) = GetActor();

            var track = await _db.Tracks
                .Include(t => t.Author)
                .Include(t => t.Genre)
                .Include(t => t.AlbumTracks)
                    .ThenInclude(at => at.Album)
                .Include(t => t.TrackLikes)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (track == null)
                throw new Exception("Track not found");

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
                    OwnerId = at.Album.OwnerId,
                    OwnerName = at.Album.Owner.Username,
                    CoverUrl = at.Album.CoverUrl,
                    CreatedAt = at.Album.CreatedAt,
                    IsPublic = at.Album.IsPublic
                }).ToList(),
                LikesCount = track.TrackLikes.Count,
                IsLikedByCurrentUser = includeUserLikes && track.TrackLikes.Any(l => l.UserId == actorId)
            };
        }



        public async Task<TrackDto> CreateAsync(CreateTrackDto dto)
        {
            var (actorId, actorRole) = GetActor();

            //// Перевіряємо, чи існує альбом і його власника
            //var album = await _db.Albums.Include(a => a.Owner)
            //    .FirstOrDefaultAsync(a => a.Id == dto.AlbumId)
            //    ?? throw new KeyNotFoundException($"Album {dto.AlbumId} not found");

            //if (actorRole != UserRole.Admin && album.OwnerId != actorId)
            //    throw new UnauthorizedAccessException("You are not owner of this album");

            // Перевіряємо користувача-автора
            var author = await _db.Users.FindAsync(actorId)
                ?? throw new KeyNotFoundException($"Author {actorId} not found");
            TrackEntity tr = new TrackEntity();
            TimeSpan duration;
            using (var tagFile = TagLib.File.Create(tr.Url))
            {
                duration = tagFile.Properties.Duration;
            }
            // Створюємо трек
            var track = new TrackEntity
            {
                Title = dto.Title.Trim(),
                AuthorId = actorId,
                Duration = duration,
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
                //поки коментуємо (помилка 'CreateTrackDto' does not contain a definition for 'AlbumId' and no accessible
                //extension method 'AlbumId' accepting a first argument
                //of type 'CreateTrackDto' could be found (are you missing a using directive or an assembly reference?))

                //AlbumId = dto.AlbumId,
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
                    //поки коментуємо (помилка 'CreateTrackDto' does not contain a definition for 'AlbumId' and no accessible
                    //extension method 'AlbumId' accepting a first argument
                    //of type 'CreateTrackDto' could be found (are you missing a using directive or an assembly reference?))
            //new AlbumDto
            //{
            //    Id = album.Id,
            //    Title = album.Title,
            //    Description = album.Description,
            //    OwnerId = album.OwnerId,
            //    OwnerName = album.Owner.Username,
            //    CoverUrl = album.CoverUrl,
            //    CreatedAt = album.CreatedAt
            //}
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

            TimeSpan duration;
            using (var tagFile = TagLib.File.Create(filePath))
            {
                duration = tagFile.Properties.Duration;
            }



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
                Duration = duration,
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



        public async Task<TrackDto> UpdateAsyncFile(int trackId, UpdateTrackDto dto)
        {
            // Знаходимо трек
            var track = await _db.Tracks.FindAsync(trackId);
            if (track == null) throw new ArgumentException("Track not found");

            var (actorId, actorRole) = GetActor();
            if (track.AuthorId != actorId) throw new UnauthorizedAccessException("You are not the author");

            // ===== Оновлення файлу =====
            if (dto.File != null && dto.File.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "tracks");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.File.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                track.Url = $"/uploads/tracks/{fileName}";

                // Оновлюємо тривалість
                using (var tagFile = TagLib.File.Create(filePath))
                {
                    track.Duration = tagFile.Properties.Duration;
                }
            }

            // ===== Оновлення обкладинки =====
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

                track.ImageUrl = $"/uploads/tracks/cover/{coverFileName}";
            }

                track.Title = dto.Title;

            if (dto.GenreId.HasValue)
                track.GenreId = dto.GenreId.Value;

            // ===== Оновлення альбомів (many-to-many) =====
            if (dto.AlbumIds != null)
            {
                // Видаляємо старі зв'язки
                var existingLinks = _db.AlbumTracks.Where(at => at.TrackId == track.Id);
                _db.AlbumTracks.RemoveRange(existingLinks);

                // Додаємо нові
                var albums = await _db.Albums.Where(a => dto.AlbumIds.Contains(a.Id)).ToListAsync();
                foreach (var album in albums)
                {
                    _db.AlbumTracks.Add(new AlbumTrackEntity
                    {
                        TrackId = track.Id,
                        AlbumId = album.Id
                    });
                }
            }

            await _db.SaveChangesAsync();

            // ===== Підготовка DTO для відповіді =====
            var albumDtos = (await _db.Albums
                .Include(a => a.Owner)
                .Where(a => _db.AlbumTracks.Any(at => at.TrackId == track.Id && at.AlbumId == a.Id))
                .ToListAsync())
                .Select(a => new AlbumDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Description = a.Description,
                    OwnerId = a.OwnerId,
                    OwnerName = a.Owner.Username,
                    CoverUrl = a.CoverUrl,
                    IsPublic = a.IsPublic
                }).ToList();

            string? genreName = null;
            if (track.GenreId.HasValue)
            {
                var genre = await _db.Genres.FindAsync(track.GenreId.Value);
                genreName = genre?.Name;
            }

            return new TrackDto
            {
                Id = track.Id,
                Title = track.Title,
                Url = track.Url,
                Duration = track.Duration,
                AuthorId = actorId,
                Author = (await _db.Users.FindAsync(actorId))!.Username,
                ImageUrl = track.ImageUrl,
                IsHidden = track.IsHidden,
                GenreId = track.GenreId,
                Genre = genreName,
                Albums = albumDtos
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


        public async Task LikeAsync(int trackId)
        {
            var (userId, _) = GetActor(); // беремо поточного користувача з токена

            var track = await _db.Tracks
                .Include(t => t.TrackLikes)
                .FirstOrDefaultAsync(t => t.Id == trackId);

            if (track == null)
                throw new KeyNotFoundException("Track not found");

            // Якщо користувач ще не лайкнув цей трек
            if (!track.TrackLikes.Any(l => l.UserId == userId))
            {
                track.TrackLikes.Add(new TrackLikeEntity
                {
                    TrackId = trackId,
                    UserId = userId
                });

                await _db.SaveChangesAsync();
            }
        }

        public async Task UnlikeAsync(int trackId)
        {
            var (userId, _) = GetActor(); // беремо поточного користувача

            var like = await _db.TrackLikes
                .FirstOrDefaultAsync(l => l.TrackId == trackId && l.UserId == userId);

            if (like != null)
            {
                _db.TrackLikes.Remove(like);
                await _db.SaveChangesAsync();
            }
            // Якщо лайка немає — нічого не робимо
        }

        //Отримати лайкнуті треки поточного користувача
        public async Task<List<TrackDto>> GetLikedByUserAsync(int userId)
        {
            var likedTracks = await _db.TrackLikes
                .Where(tl => tl.UserId == userId)
                .Select(tl => tl.Track)
                .Select(track => new TrackDto
                {
                    Id = track.Id,
                    Title = track.Title,
                    AuthorId = track.AuthorId,
                    Author = track.Author.Username, // або Name, залежно від твоєї моделі User
                    GenreId = track.GenreId ?? 0,
                    Genre = track.Genre != null ? track.Genre.Name : "",
                    Duration = track.Duration,
                    Url = track.Url,
                    ImageUrl = track.ImageUrl,
                    PlayCount = track.PlayCount,
                    LikesCount = track.TrackLikes.Count,
                    IsLikedByCurrentUser = true // бо це лайкнуті треки поточного користувача
                })
                .ToListAsync();

            return likedTracks;
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
