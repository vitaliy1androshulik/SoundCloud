using SoundCloudWebApi.Models.Album;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Models.Playlist;
using SoundCloudWebApi.Models.Track;

namespace SoundCloudWebApi.Models
{
    public class SearchResponseDto
    {
        public PagedResult<TrackSummaryDto> Tracks { get; set; } = new();
        public PagedResult<AlbumSummaryDto> Albums { get; set; } = new();
        public PagedResult<PlaylistSummaryDto> Playlists { get; set; } = new();
        public PagedResult<UserSummaryDto> Users { get; set; } = new();
    }
}
