using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Swashbuckle.AspNetCore.Annotations;
using SoundCloudWebApi.Models.Auth;
using SoundCloudWebApi.Services.Interfaces;
using System.Threading.Tasks;
using SoundCloudWebApi.Data.Entities;  

namespace SoundCloudWebApi.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IUserService _userService;

        public AdminController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("users")]
        [SwaggerOperation(
            OperationId = "Admin_GetAllUsers",
            Summary = "Отримати всіх користувачів (Admin)")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("users/{id:int}")]
        [SwaggerOperation(
            OperationId = "Admin_GetUserById",
            Summary = "Отримати користувача за ID (Admin)")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            return Ok(user);
        }

        [HttpPut("users/{id:int}/role")]
        [SwaggerOperation(
            OperationId = "Admin_ChangeUserRole",
            Summary = "Змінити роль користувача (Admin)")]
        public async Task<IActionResult> ChangeRole(int id, [FromBody] ChangeRoleRequestDto dto)
        {
            await _userService.ChangeRoleAsync(id, dto.Role);
            return NoContent();
        }

        [HttpPatch("users/{id:int}/block")]
        [SwaggerOperation(
            OperationId = "Admin_BlockUser",
            Summary = "Заблокувати користувача (Admin)")]
        public async Task<IActionResult> Block(int id)
        {
            await _userService.BlockAsync(id);
            return NoContent();
        }

        [HttpPatch("users/{id:int}/unblock")]
        [SwaggerOperation(
            OperationId = "Admin_UnblockUser",
            Summary = "Розблокувати користувача (Admin)")]
        public async Task<IActionResult> Unblock(int id)
        {
            await _userService.UnblockAsync(id);
            return NoContent();
        }

        [HttpDelete("users/{id:int}")]
        [SwaggerOperation(
            OperationId = "Admin_DeleteUser",
            Summary = "Видалити користувача (Admin)")]
        public async Task<IActionResult> Delete(int id)
        {
            await _userService.DeleteAsync(id);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("users/{id:int}")]
        [SwaggerOperation(
        OperationId = "Admin_UpdateUser",
        Summary = "Оновити будь-якого користувача (Admin)")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequestDto dto)
        {
            var updated = await _userService.UpdateAsync(id, dto);
            return Ok(updated);
        }
    }
}
