using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundCloudWebApi.Services.Interfaces;
using System.Security.Claims;

namespace SoundCloudWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FollowController : ControllerBase
    {
        private readonly IFollowService _followService;

        public FollowController(IFollowService followService)
        {
            _followService = followService;
        }

        /// <summary>
        /// Підписатися на користувача
        /// </summary>
        /// <param name="id">ID користувача, на якого хочемо підписатися</param>
        [HttpPost("{id}/follow")]
        [Authorize]
        public async Task<IActionResult> Follow(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var success = await _followService.FollowAsync(userId, id);
            return success ? Ok("Subscribed successfully") : BadRequest("Already following or invalid request");
        }

        /// <summary>
        /// Відписатися від користувача
        /// </summary>
        /// <param name="id">ID користувача, від якого хочемо відписатися</param>
        [HttpDelete("{id}/unfollow")]
        [Authorize]
        public async Task<IActionResult> Unfollow(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var success = await _followService.UnfollowAsync(userId, id);
            return success ? Ok("Unsubscribed successfully") : NotFound("You are not following this user");
        }

        /// <summary>
        /// Отримати список підписників (followers) для конкретного користувача
        /// </summary>
        /// <param name="id">ID користувача</param>
        [HttpGet("{id}/followers")]
        public async Task<IActionResult> GetFollowers(int id)
        {
            var followers = await _followService.GetFollowersAsync(id);
            return Ok(followers);
        }

        /// <summary>
        /// Отримати список користувачів, на яких підписаний конкретний користувач (following)
        /// </summary>
        /// <param name="id">ID користувача</param>
        [HttpGet("{id}/following")]
        public async Task<IActionResult> GetFollowing(int id)
        {
            var following = await _followService.GetFollowingAsync(id);
            return Ok(following);
        }

        /// <summary>
        /// Отримати кількість підписників користувача
        /// </summary>
        /// <param name="id">ID користувача</param>
        [HttpGet("{id}/followers/count")]
        public async Task<IActionResult> GetFollowersCount(int id)
        {
            var count = await _followService.GetFollowersCountAsync(id);
            return Ok(count);
        }

        /// <summary>
        /// Отримати кількість підписок користувача
        /// </summary>
        /// <param name="id">ID користувача</param>
        [HttpGet("{id}/following/count")]
        public async Task<IActionResult> GetFollowingCount(int id)
        {
            var count = await _followService.GetFollowingCountAsync(id);
            return Ok(count);
        }
    }
}
