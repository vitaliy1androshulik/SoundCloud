using SoundCloudWebApi.Models.Album;
using SoundCloudWebApi.Models.Playlist;
using SoundCloudWebApi.Models.Track;
using SoundCloudWebApi.Models;
using System;
using SoundCloudWebApi.Data;
using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Models.Auth;

public class SearchService : ISearchService
{
    private readonly SoundCloudDbContext _db;
    public SearchService(SoundCloudDbContext db) => _db = db;

    public async Task<SearchResponseDto> SearchAsync(
    string q,
    int trackPage = 1, int trackPageSize = 8,
    int albumPage = 1, int albumPageSize = 6,
    int playlistPage = 1, int playlistPageSize = 6,
    int userPage = 1, int userPageSize = 6, // додано
    string[]? types = null)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return new SearchResponseDto();

        var qLower = q.Trim().ToLower();

        bool wantTracks = types == null || types.Contains("tracks", StringComparer.OrdinalIgnoreCase);
        bool wantAlbums = types == null || types.Contains("albums", StringComparer.OrdinalIgnoreCase);
        bool wantPlaylists = types == null || types.Contains("playlists", StringComparer.OrdinalIgnoreCase);
        bool wantUsers = types == null || types.Contains("users", StringComparer.OrdinalIgnoreCase);

        var result = new SearchResponseDto();

        if (wantTracks)
        {
            var tracksQuery = _db.Tracks
                            .Where(t =>
                                (!string.IsNullOrEmpty(t.Title) && t.Title.ToLower().Contains(qLower)) ||
                                (t.Author != null && !string.IsNullOrEmpty(t.Author.Username) && t.Author.Username.ToLower().Contains(qLower)) ||
                                (t.Genre != null && !string.IsNullOrEmpty(t.Genre.Name) && t.Genre.Name.ToLower().Contains(qLower))
                            );

            var totalTracks = await tracksQuery.CountAsync();

            var tracks = await tracksQuery
                .OrderByDescending(t => t.PlayCount)
                .Skip((trackPage - 1) * trackPageSize)
                .Take(trackPageSize)
                .Select(t => new TrackSummaryDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Author = t.Author.Username,
                    ImageUrl = t.ImageUrl,
                    Url = t.Url,
                    PlayCount = t.PlayCount
                })
                .ToListAsync();

            result.Tracks = new PagedResult<TrackSummaryDto>
            {
                Items = tracks,
                Page = trackPage,
                PageSize = trackPageSize,
                Total = totalTracks
            };
        }

        if (wantAlbums)
        {
            var albumsQuery = _db.Albums
                .Where(a =>
                    (!string.IsNullOrEmpty(a.Title) && a.Title.ToLower().Contains(qLower)) ||
                    (!string.IsNullOrEmpty(a.Description) && a.Description.ToLower().Contains(qLower))
                );

            var totalAlbums = await albumsQuery.CountAsync();

            var albums = await albumsQuery
                .OrderByDescending(a => a.Title)
                .Skip((albumPage - 1) * albumPageSize)
                .Take(albumPageSize)
                .Select(a => new AlbumSummaryDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    ImageUrl = a.CoverUrl,
                    ArtistId=a.OwnerId
                })
                .ToListAsync();

            result.Albums = new PagedResult<AlbumSummaryDto>
            {
                Items = albums,
                Page = albumPage,
                PageSize = albumPageSize,
                Total = totalAlbums
            };
        }

        if (wantPlaylists)
        {
            var playlistsQuery = _db.Playlists
                .Where(p =>
                    (!string.IsNullOrEmpty(p.Name) && p.Name.ToLower().Contains(qLower)) ||
                    (p.Owner != null && !string.IsNullOrEmpty(p.Owner.Username) && p.Owner.Username.ToLower().Contains(qLower))
                );

            var totalPlaylists = await playlistsQuery.CountAsync();

            var playlists = await playlistsQuery
                .OrderByDescending(p => p.CreatedAt)
                .Skip((playlistPage - 1) * playlistPageSize)
                .Take(playlistPageSize)
                .Select(p => new PlaylistSummaryDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Owner = p.Owner.Username,
                    CoverUrl = p.CoverUrl
                })
                .ToListAsync();

            result.Playlists = new PagedResult<PlaylistSummaryDto>
            {
                Items = playlists,
                Page = playlistPage,
                PageSize = playlistPageSize,
                Total = totalPlaylists
            };
        }

        if (wantUsers)
        {
            var usersQuery = _db.Users
                .Where(u => !string.IsNullOrEmpty(u.Username) && u.Username.ToLower().Contains(qLower));

            var totalUsers = await usersQuery.CountAsync();

            var users = await usersQuery
                .OrderBy(u => u.Username)
                .Skip((userPage - 1) * userPageSize)
                .Take(userPageSize)
                .Select(u => new UserSummaryDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    AvatarUrl = u.AvatarUrl,
                })
                .ToListAsync();

            result.Users = new PagedResult<UserSummaryDto>
            {
                Items = users,
                Page = userPage,
                PageSize = userPageSize,
                Total = totalUsers
            };
        }

        return result;
    }
}
