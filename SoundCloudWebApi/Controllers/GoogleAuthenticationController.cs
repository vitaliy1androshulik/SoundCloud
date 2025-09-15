using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Services.Abstractions;
using SoundCloudWebApi.Services.Interfaces;
using System;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Controllers
{
    [ApiController]
    [Route("auth")]
    public class GoogleAuthenticationController : ControllerBase
    {
        private readonly SoundCloudDbContext _db;

        public GoogleAuthenticationController(SoundCloudDbContext db)
        {
            _db = db;
        }

        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] TokenRequest request)
        {
            if (string.IsNullOrEmpty(request.Token))
                return BadRequest(new { error = "Token is required" });

            try
            {
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", request.Token);

                var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
                if (!response.IsSuccessStatusCode)
                    return Unauthorized(new { error = "Invalid Google access token" });

                var json = await response.Content.ReadAsStringAsync();
                var googleUser = JsonSerializer.Deserialize<GoogleAccountModel>(json);

                var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == googleUser.Email);

                if (user == null)
                {
                    user = new UserEntity
                    {
                        Username = googleUser.FirstName ?? googleUser.Email.Split('@')[0],
                        Email = googleUser.Email,
                        AvatarUrl = googleUser.Picture,
                        PasswordHash = Array.Empty<byte>(),
                        PasswordSalt = Array.Empty<byte>(),
                        Role = UserRole.User,
                        CreatedAt = DateTime.UtcNow
                    };
                    _db.Users.Add(user);
                    await _db.SaveChangesAsync();
                }
                else
                {
                    user.Username = googleUser.FirstName ?? user.Username;
                    user.AvatarUrl = googleUser.Picture ?? user.AvatarUrl;
                    user.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                }

                return Ok(new
                {
                    user.Id,
                    user.Username,
                    user.Email,
                    user.AvatarUrl
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }

    public class TokenRequest
    {
        public string Token { get; set; }
    }
}

//namespace SoundCloudWebApi.Controllers
//{
//    [ApiController]
//    [Route("auth")]
//    public class GoogleAuthenticationController : ControllerBase
//    {
//        private readonly IGoogleTokenValidator _google;
//        private readonly IUserService _users;
//        private readonly IAuthService _auth;

//        public GoogleAuthenticationController(
//            IGoogleTokenValidator google,
//            IUserService users,
//            IAuthService auth)
//        {
//            _google = google;
//            _users = users;
//            _auth = auth;
//        }

//        public class TokenRequest { public string Token { get; set; } }

//        [AllowAnonymous]
//        [HttpPost("google")]
//        public async Task<IActionResult> GoogleLogin([FromBody] TokenRequest req)
//        {
//            if (string.IsNullOrWhiteSpace(req?.Token))
//                return BadRequest(new { error = "Token is required" });

//            using var httpClient = new HttpClient();

//            httpClient.DefaultRequestHeaders.Authorization =
//                new AuthenticationHeaderValue("Bearer", req.Token);

//            //configuration
//            string userInfo = "https://www.googleapis.com/oauth2/v2/userinfo";
//            var response = await httpClient.GetAsync(userInfo);

//            if (!response.IsSuccessStatusCode)
//                return null;

//            var json = await response.Content.ReadAsStringAsync();

//            var googleUser = JsonSerializer.Deserialize<GoogleAccountModel>(json);

//            var payload = await _google.ValidateAsync(req.Token);
//            var user = await _users.FindOrCreateFromGoogleAsync(payload);

//            var jwt = _auth.IssueJwtForUser(user);

//            return Ok(new AuthResponseDto
//            {
//                Token = jwt,
//                ExpiresAt = System.DateTime.UtcNow.AddHours(1),
//                Username = user.Username
//            });
//        }
//    }
//}
