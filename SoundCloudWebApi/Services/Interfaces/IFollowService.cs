using SoundCloudWebApi.Data.Entities;

namespace SoundCloudWebApi.Services.Interfaces
{
    public interface IFollowService
    {
        Task<bool> FollowAsync(int followerId, int followingId);
        Task<bool> UnfollowAsync(int followerId, int followingId);
        Task<List<UserEntity>> GetFollowersAsync(int userId);
        Task<List<UserEntity>> GetFollowingAsync(int userId);
        Task<int> GetFollowersCountAsync(int userId);
        Task<int> GetFollowingCountAsync(int userId);
    }
}
