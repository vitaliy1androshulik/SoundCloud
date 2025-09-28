using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Models.Playlist;
using SoundCloudWebApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using SoundCloudWebApi.Models.Track;

public class PlaylistService : IPlaylistService
{
    private readonly SoundCloudDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IWebHostEnvironment _env;

    public PlaylistService(SoundCloudDbContext db, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment env)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
        _env = env;
    }

    private (int ActorId, UserRole ActorRole) GetActor()
    {
        var principal = _httpContextAccessor.HttpContext?.User
            ?? throw new UnauthorizedAccessException("No user in context");

        var idStr = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("No NameIdentifier claim");

        var roleStr = principal.FindFirst(ClaimTypes.Role)?.Value ?? nameof(UserRole.User);
        var role = Enum.TryParse<UserRole>(roleStr, out var r) ? r : UserRole.User;

        return (int.Parse(idStr), role);
    }

    // =================== CRUD ===================
    public async Task<IEnumerable<PlaylistDto>> GetAllAsync(int userId)
    {
        return await _db.Playlists
            .Where(p => p.OwnerId == userId)
            .Select(p => new PlaylistDto
            {
                Id = p.Id,
                Name = p.Name,
                CoverUrl = p.CoverUrl
            })
            .ToListAsync();
    }

    public async Task<PlaylistDto?> GetByIdAsync(int id)
    {
        var p = await _db.Playlists.FindAsync(id);
        if (p == null) return null;

        return new PlaylistDto
        {
            Id = p.Id,
            Name = p.Name,
            CoverUrl = p.CoverUrl
        };
    }

    public async Task<PlaylistDto> CreateAsync(CreatePlaylistDto dto)
    {
        var (actorId, _) = GetActor();

        string? coverUrl = null;
        if (dto.Cover != null)
        {
            var fileName = $"{Guid.NewGuid()}_{dto.Cover.FileName}";
            var path = Path.Combine(_env.WebRootPath, "uploads/playlists", fileName);
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);

            using var stream = new FileStream(path, FileMode.Create);
            await dto.Cover.CopyToAsync(stream);

            coverUrl = $"/uploads/playlists/{fileName}";
        }

        var entity = new PlaylistEntity
        {
            Name = dto.Name,
            OwnerId = actorId,
            CoverUrl = coverUrl,
            Owner = await _db.Users.FindAsync(actorId)
                ?? throw new KeyNotFoundException($"User {actorId} не знайдено")
        };

        _db.Playlists.Add(entity);
        await _db.SaveChangesAsync();

        return new PlaylistDto
        {
            Id = entity.Id,
            Name = entity.Name,
            CoverUrl = entity.CoverUrl
        };
    }

    public async Task UpdateAsync(int id, CreatePlaylistDto dto)
    {
        var (actorId, actorRole) = GetActor();
        var p = await _db.Playlists.FindAsync(id)
            ?? throw new KeyNotFoundException($"Playlist {id} не знайдено");

        if (actorRole != UserRole.Admin && p.OwnerId != actorId)
            throw new UnauthorizedAccessException("You are not owner of this playlist");

        p.Name = dto.Name;

        if (dto.Cover != null)
        {
            var fileName = $"{Guid.NewGuid()}_{dto.Cover.FileName}";
            var path = Path.Combine(_env.WebRootPath, "uploads/playlists", fileName);
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);

            using var stream = new FileStream(path, FileMode.Create);
            await dto.Cover.CopyToAsync(stream);

            p.CoverUrl = $"/uploads/playlists/{fileName}";
        }

        p.UpdatedAt = DateTime.UtcNow;
        p.UpdatedById = actorId;

        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var (actorId, actorRole) = GetActor();
        var p = await _db.Playlists.FindAsync(id)
            ?? throw new KeyNotFoundException($"Playlist {id} не знайдено");

        if (actorRole != UserRole.Admin && p.OwnerId != actorId)
            throw new UnauthorizedAccessException("You are not owner of this playlist");

        _db.Playlists.Remove(p);
        await _db.SaveChangesAsync();
    }

    // =================== Cover ===================
    public async Task SetCoverAsync(int playlistId, IFormFile cover)
    {
        var (actorId, actorRole) = GetActor();
        var p = await _db.Playlists.FindAsync(playlistId)
            ?? throw new KeyNotFoundException($"Playlist {playlistId} не знайдено");

        if (actorRole != UserRole.Admin && p.OwnerId != actorId)
            throw new UnauthorizedAccessException("You are not owner of this playlist");

        var fileName = $"{Guid.NewGuid()}_{cover.FileName}";
        var path = Path.Combine(_env.WebRootPath, "uploads/playlists", fileName);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);

        using var stream = new FileStream(path, FileMode.Create);
        await cover.CopyToAsync(stream);

        p.CoverUrl = $"/uploads/playlists/{fileName}";
        p.UpdatedAt = DateTime.UtcNow;
        p.UpdatedById = actorId;

        await _db.SaveChangesAsync();
    }

    // =================== Tracks ===================
    public async Task AddTrackAsync(int playlistId, int trackId)
    {
        var (actorId, actorRole) = GetActor();
        var playlist = await _db.Playlists
            .Include(p => p.Tracks)
            .FirstOrDefaultAsync(p => p.Id == playlistId)
            ?? throw new KeyNotFoundException($"Playlist {playlistId} не знайдено");

        if (actorRole != UserRole.Admin && playlist.OwnerId != actorId)
            throw new UnauthorizedAccessException("Ви не є власником цього плейліста");

        var track = await _db.Tracks.FindAsync(trackId)
            ?? throw new KeyNotFoundException($"Track {trackId} не знайдено");

        if (!playlist.Tracks.Any(t => t.Id == trackId))
        {
            playlist.Tracks.Add(track);
            await _db.SaveChangesAsync();
        }
    }

    public async Task RemoveTrackAsync(int playlistId, int trackId)
    {
        var (actorId, actorRole) = GetActor();
        var playlist = await _db.Playlists
            .Include(p => p.Tracks)
            .FirstOrDefaultAsync(p => p.Id == playlistId)
            ?? throw new KeyNotFoundException($"Playlist {playlistId} не знайдено");

        if (actorRole != UserRole.Admin && playlist.OwnerId != actorId)
            throw new UnauthorizedAccessException("Ви не є власником цього плейліста");

        var track = playlist.Tracks.FirstOrDefault(t => t.Id == trackId)
            ?? throw new KeyNotFoundException($"Track {trackId} не знайдено у плейлісті");

        playlist.Tracks.Remove(track);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<TrackDto>> GetTracksByPlaylistAsync(int playlistId)
    {
        var playlist = await _db.Playlists
            .Include(p => p.Tracks)
                .ThenInclude(t => t.Genre)
            .Include(p => p.Tracks)
                .ThenInclude(t => t.Author)
            .FirstOrDefaultAsync(p => p.Id == playlistId);

        if (playlist == null)
            throw new KeyNotFoundException($"Playlist {playlistId} not found");

        return playlist.Tracks.Select(t => new TrackDto
        {
            Id = t.Id,
            Title = t.Title,
            AuthorId = t.AuthorId,
            Author = t.Author.Username,
            GenreId = t.GenreId ?? 0,
            Genre = t.Genre.Name,
            Duration = t.Duration,
            ImageUrl = t.ImageUrl,
            Url = t.Url,
            PlayCount = t.PlayCount
        }).ToList();
    }

    public async Task<IEnumerable<PlaylistDto>> GetAllByUserIdAsync(int userId)
    {
        return await _db.Playlists
            .Where(p => p.OwnerId == userId)
            .Select(p => new PlaylistDto
            {
                Id = p.Id,
                Name = p.Name,
                CoverUrl = p.CoverUrl
            })
            .ToListAsync();
    }


}
