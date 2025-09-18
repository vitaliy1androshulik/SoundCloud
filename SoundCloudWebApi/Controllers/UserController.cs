using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Services;
using SoundCloudWebApi.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;

    public UserController(IAuthService authService, IUserService userService)

    {
        _authService = authService;
        _userService = userService;
    }
    public class SetPasswordRequest
    {
        [Required, MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }

    [HttpPost("register")]
    [SwaggerOperation(
    OperationId = "Register",
    Summary = "Створити користувача")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto model)
    {
        var response = await _authService.RegisterAsync(model);
        return Ok(response);
    }

    [SwaggerOperation(
    OperationId = "Login",
    Summary = "Вхід користувача")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto model)
    {
        var response = await _authService.LoginAsync(model);
        return Ok(response);
    }

    // Далі  [Authorize]-захищені методи для профілю…
    [Authorize]
    [SwaggerOperation(
    OperationId = "Profile",
    Summary = "Отримати дані поточного користувача [Authorize]")]
    [HttpGet("profile")]
    public async Task<IActionResult> Profile()
    {
        // Отримання userId з JWT-токена
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            return Unauthorized("User ID not found in token.");
        }
        var profile = await _authService.GetUserProfileAsync(userId);
        //if (profile == null)
        //{
        //    return NotFound("User profile not found.");
        //}
        return Ok(profile); // винятки перехолювати має  GlobalErrorHandler
    }


    //// Нові CRUD-ендпоінти:
    //[Authorize]
    //[SwaggerOperation(
    //OperationId = "GetAllUsers",
    //Summary = "Отримати дані всіх користувачів [Authorize]")]
    //[HttpGet(Name = "GetAllUsers")]
    //public async Task<IActionResult> GetAll()
    //    => Ok(await _userService.GetAllAsync());

    //[Authorize]
    //[SwaggerOperation(
    //OperationId = "GetUserById",
    //Summary = "Отримати користувача за ID [Authorize]")]
    //[HttpGet("{id:int}")]
    //public async Task<IActionResult> GetById(int id)
    //    => Ok(await _userService.GetByIdAsync(id));

    //[Authorize]
    //[SwaggerOperation(
    //OperationId = "UpdateUser",
    //Summary = "Оновити користувача за ID [Authorize]")]
    //[HttpPut("{id:int}")]
    //public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequestDto dto)
    //    => Ok(await _userService.UpdateAsync(id, dto));

    //[Authorize(Roles = "Admin")]
    //[SwaggerOperation(
    //OperationId = "DeleteUser",
    //Summary = "Видалити користувача за ID [Authorize]")]
    //[HttpDelete("{id:int}")]
    //public async Task<IActionResult> Delete(int id)
    //{
    //    await _userService.DeleteAsync(id);
    //    return NoContent();
    //}

    [Authorize]
    [HttpPut("profile")]
    [SwaggerOperation(
    OperationId = "UpdateOwnProfile",
    Summary = "Оновити власний профіль [Authorize]")]
    public async Task<IActionResult> UpdateOwnProfile([FromBody] UpdateUserRequestDto dto)
    {
        // Дістаємо userId з токена
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim);
        var updated = await _userService.UpdateAsync(userId, dto);
        return Ok(updated);
    }

    [HttpGet("top")]
    public async Task<IActionResult> GetTopUsers(int take)
    {
        var result = await _userService.GetTopUsersAsync(take);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("profile/avatar")]
    [Consumes("multipart/form-data")]
    [SwaggerOperation(Summary = "Оновити свій аватар")]
    public async Task<IActionResult> UploadAvatar(IFormFile file, [FromServices] IImageStorage storage)
    {
        if (file is null || file.Length == 0) return BadRequest("No file");
        var uid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var url = await storage.SaveAsync(file, "avatars");
        await _userService.SetAvatarAsync(uid, url);
        return Ok(new { avatarUrl = url });
    }

    [Authorize]
    [HttpGet("whoami")]
    public IActionResult WhoAmI()
    {
        return Ok(new
        {
            Authenticated = User.Identity?.IsAuthenticated ?? false,
            NameId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            Name = User.FindFirst(ClaimTypes.Name)?.Value,
            Email = User.FindFirst(ClaimTypes.Email)?.Value,
            Role = User.FindFirst(ClaimTypes.Role)?.Value,
            HeadersAuth = Request.Headers["Authorization"].ToString()
        });
    }

    [Authorize]
    [HttpPost("password/set")]
    [SwaggerOperation(
    OperationId = "SetOwnPassword",
    Summary = "Встановити пароль користувача")]
    public async Task<IActionResult> SetPassword([FromBody] SetPasswordRequest req, [FromServices] IAuthService auth)
    {
        if (string.IsNullOrWhiteSpace(req?.NewPassword) || req.NewPassword.Length < 6)
            return BadRequest(new { error = "Пароль має містити щонайменше 6 символів" });

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized(new { error = "No user in context" });

        await auth.SetLocalPasswordAsync(int.Parse(userIdStr), req.NewPassword);
        return Ok(new { ok = true });
    }




}

