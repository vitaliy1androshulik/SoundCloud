using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using SoundCloudWebApi.Models.Album;
using SoundCloudWebApi.Services.Interfaces;
using System.Security.Claims;

namespace SoundCloudWebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AlbumController : ControllerBase
    {
        private readonly IAlbumService _albumService;

        public AlbumController(IAlbumService albumService)
        {
            _albumService = albumService;
        }

        [HttpGet]
        [SwaggerOperation(
            OperationId = "GetAlbums",
            Summary = "Отримати всі альбоми поточного користувача")]
        public async Task<IActionResult> GetAll()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var albums = await _albumService.GetAllAsync(userId);
            return Ok(albums);
        }

        [HttpGet("{id:int}")]
        [SwaggerOperation(
            OperationId = "GetAlbumById",
            Summary = "Отримати альбом за ID")]
        public async Task<IActionResult> GetById(int id)
        {
            var album = await _albumService.GetByIdAsync(id);
            if (album == null)
                return NotFound();
            return Ok(album);
        }

        [HttpPost]
        [SwaggerOperation(
            OperationId = "CreateAlbum",
            Summary = "Створити новий альбом")]
        public async Task<IActionResult> Create([FromBody] CreateAlbumDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var created = await _albumService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        [SwaggerOperation(
            OperationId = "UpdateAlbum",
            Summary = "Оновити альбом за ID")]
        public async Task<IActionResult> Update(int id, [FromBody] AlbumDto dto)
        {
            await _albumService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [SwaggerOperation(
            OperationId = "DeleteAlbum",
            Summary = "Видалити альбом за ID")]
        public async Task<IActionResult> Delete(int id)
        {
            await _albumService.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost("{id:int}/cover")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(Summary = "Завантажити обкладинку альбому")]
        public async Task<IActionResult> UploadCover(int id, IFormFile file, [FromServices] IImageStorage storage)
        {
            if (file is null || file.Length == 0) return BadRequest("No file");
            var url = await storage.SaveAsync(file, "albums");
            await _albumService.SetCoverAsync(id, url);
            return Ok(new { coverUrl = url });
        }

    }
}
