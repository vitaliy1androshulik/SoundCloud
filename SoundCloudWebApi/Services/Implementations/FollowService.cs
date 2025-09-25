using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Migrations;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Services.Interfaces;

namespace SoundCloudWebApi.Services.Implementations
{
    public class FollowService : IFollowService
    {
        private readonly SoundCloudDbContext _context;

        public FollowService(SoundCloudDbContext context)
        {
            _context = context;
        }
        //падисатись на когось
        public async Task<bool> FollowAsync(int followerId, int followingId)
        {
            if (followerId == followingId) return false;

            var exists = await _context.Follows
                .AnyAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);

            if (exists) return false;

            _context.Follows.Add(new FollowEntity
            {
                FollowerId = followerId,
                FollowingId = followingId
            });

            await _context.SaveChangesAsync();
            return true;
        }
        //відписатись від когось
        public async Task<bool> UnfollowAsync(int followerId, int followingId)
        {
            var follow = await _context.Follows
                .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);

            if (follow == null) return false;

            _context.Follows.Remove(follow);
            await _context.SaveChangesAsync();
            return true;
        }
        //отримати список своїх підписників
        public async Task<List<UserEntity>> GetFollowersAsync(int userId)
        {
            return await _context.Follows
                .Where(f => f.FollowingId == userId)
                .Select(f => f.Follower)
                .ToListAsync();
        }
        //отримати список на кого ми підписані
        public async Task<List<UserEntity>> GetFollowingAsync(int userId)
        {
            return await _context.Follows
                .Where(f => f.FollowerId == userId)
                .Select(f => f.Following)
                .ToListAsync();
        }
        //отримати число підписників
        public async Task<int> GetFollowersCountAsync(int userId)
        {
            return await _context.Follows.CountAsync(f => f.FollowingId == userId);
        }
        //отримати число підписок
        public async Task<int> GetFollowingCountAsync(int userId)
        {
            return await _context.Follows.CountAsync(f => f.FollowerId == userId);
        }
        // нове
        public async Task<bool> IsFollowingAsync(int followerId, int followingId)
        {
            return await _context.Follows
                .AnyAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);
        }

        public async Task<UserFollowDto> GetUserFollowStatusAsync(int currentUserId, int targetUserId)
        {
            var user = await _context.Users.FindAsync(targetUserId);
            if (user == null) return null;

            var isFollowing = await IsFollowingAsync(currentUserId, targetUserId);

            return new UserFollowDto
            {
                Id = user.Id,
                Username = user.Username,
                IsFollowing = isFollowing
            };
        }


    }

}
