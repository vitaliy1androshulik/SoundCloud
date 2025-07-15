using Microsoft.AspNetCore.Mvc;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Services.Interfaces;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace SoundCloudWebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IAuthService _authService;

    public UserController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto model)
    {
        var response = await _authService.RegisterAsync(model);
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto model)
    {
        var response = await _authService.LoginAsync(model);
        return Ok(response);
    }

    // Далі можем додати [Authorize]-захищені методи для профілю…

}