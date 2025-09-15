using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Models.Playlist;
using SoundCloudWebApi.Services.Interfaces;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

public class PlaylistService : IPlaylistService
{
    private readonly SoundCloudDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public PlaylistService(SoundCloudDbContext db, IHttpContextAccessor httpContextAccessor)
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

    public async Task<IEnumerable<PlaylistDto>> GetAllAsync(int userId)
    {
        return await _db.Playlists
            .Where(p => p.OwnerId == userId)
            .Select(p => new PlaylistDto
            {
                Id = p.Id,
                Name = p.Name
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
            Name = p.Name
        };
    }

    public async Task<PlaylistDto> CreateAsync(CreatePlaylistDto dto)
    {
        var (actorId, _) = GetActor();

        var entity = new PlaylistEntity
        {
            Name = dto.Name,
            OwnerId = actorId,
            Owner = await _db.Users.FindAsync(actorId)
                ?? throw new KeyNotFoundException($"User {actorId} не знайдено")
        };

        _db.Playlists.Add(entity);
        await _db.SaveChangesAsync();

        return new PlaylistDto
        {
            Id = entity.Id,
            Name = entity.Name
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

    public async Task SetCoverAsync(int playlistId, string url)
    {
        var (actorId, actorRole) = GetActor();
        var p = await _db.Playlists.FindAsync(playlistId)
                ?? throw new KeyNotFoundException($"Playlist {playlistId} не знайдено");

        if (actorRole != UserRole.Admin && p.OwnerId != actorId)
            throw new UnauthorizedAccessException("You are not owner of this playlist");

        p.CoverUrl = url;
        p.UpdatedAt = DateTime.UtcNow;
        p.UpdatedById = actorId;

        await _db.SaveChangesAsync();
    }
}