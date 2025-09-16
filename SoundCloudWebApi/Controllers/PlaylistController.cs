using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using SoundCloudWebApi.Models.Playlist;
using SoundCloudWebApi.Services.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace SoundCloudWebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PlaylistController : ControllerBase
    {
        private readonly IPlaylistService _playlistService;

        public PlaylistController(IPlaylistService playlistService)
        {
            _playlistService = playlistService;
        }

        [HttpGet]
        [SwaggerOperation(
            OperationId = "GetPlaylists",
            Summary = "Отримати всі плейлисти поточного користувача")]
        public async Task<IActionResult> GetAll()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var lists = await _playlistService.GetAllAsync(userId);
            return Ok(lists);
        }

        [HttpGet("{id:int}")]
        [SwaggerOperation(
            OperationId = "GetPlaylistById",
            Summary = "Отримати плейлист за ID")]
        public async Task<IActionResult> GetById(int id)
        {
            var playlist = await _playlistService.GetByIdAsync(id);
            if (playlist == null)
                return NotFound();
            return Ok(playlist);
        }

        [HttpPost]
        [SwaggerOperation(
        OperationId = "CreatePlaylist",
        Summary = "Створити новий плейлист")]
        public async Task<IActionResult> Create([FromBody] CreatePlaylistDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var created = await _playlistService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        [SwaggerOperation(
            OperationId = "UpdatePlaylist",
            Summary = "Оновити плейлист за ID")]
        public async Task<IActionResult> Update(int id, [FromBody] CreatePlaylistDto dto)
        {
            await _playlistService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [SwaggerOperation(
            OperationId = "DeletePlaylist",
            Summary = "Видалити плейлист за ID")]
        public async Task<IActionResult> Delete(int id)
        {
            await _playlistService.DeleteAsync(id);
            return NoContent();
        }

        [Authorize]
        [HttpPost("{id:int}/cover")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(
        OperationId = "UploadPlaylistCover",
        Summary = "Завантажити/оновити обкладинку плейлиста (власник або Admin)")]
        public async Task<IActionResult> UploadCover(
        int id,
        IFormFile file,
        [FromServices] IImageStorage storage)
        {
            if (file is null || file.Length == 0)
                return BadRequest("Файл не надано.");

            // Збережемо файл і отримаємо абсолютний або відносний URL
            var url = await storage.SaveAsync(file, "playlists"); // збережеться у /wwwroot/uploads/playlists/...

            // Оновити в БД обкладинку цього плейлиста (перевірка власника всередині сервісу)
            await _playlistService.SetCoverAsync(id, url);

            return Ok(new { coverUrl = url });
        }



    }
}
