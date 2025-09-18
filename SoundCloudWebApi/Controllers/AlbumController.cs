using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using SoundCloudWebApi.Models.Album;
using SoundCloudWebApi.Services.Interfaces;
using SoundCloudWebApi.Models.Track;
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

        // ===== CRUD для поточного користувача =====

        [HttpGet]
        [SwaggerOperation(OperationId = "GetAlbums", Summary = "Отримати всі публічні альбоми або альбоми користувача")]
        public async Task<IActionResult> GetAll()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var albums = await _albumService.GetAllByUserAsync(userId); // новий метод враховує IsPublic
            return Ok(albums);
        }

        [HttpGet("{id:int}")]
        [SwaggerOperation(OperationId = "GetAlbumById", Summary = "Отримати альбом за ID")]
        public async Task<IActionResult> GetById(int id)
        {
            var album = await _albumService.GetByIdAsync(id);
            if (album == null) return NotFound();
            if (!album.IsPublic && album.OwnerId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Forbid();
            return Ok(album);
        }

        [HttpPost]
        [SwaggerOperation(OperationId = "CreateAlbum", Summary = "Створити новий альбом")]
        public async Task<IActionResult> Create([FromForm] CreateAlbumDto dto)
        {
            var created = await _albumService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        [SwaggerOperation(OperationId = "UpdateAlbum", Summary = "Оновити альбом за ID")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateAlbumDto dto)
        {
            await _albumService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [SwaggerOperation(OperationId = "DeleteAlbum", Summary = "Видалити альбом за ID")]
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

        // ===== Admin: всі альбоми =====
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        [SwaggerOperation(OperationId = "GetAllAlbumsForAdmin", Summary = "Отримати всі альбоми для адміна")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var albums = await _albumService.GetAllAlbumsForAdminAsync();
            return Ok(albums);
        }

        // ===== Нові методи для треків =====

        // Отримати всі треки альбому
        [HttpGet("{albumId:int}/tracks")]
        [SwaggerOperation(OperationId = "GetTracksByAlbum", Summary = "Отримати всі треки альбому")]
        public async Task<IActionResult> GetTracks(int albumId)
        {
            var album = await _albumService.GetByIdAsync(albumId);
            if (album == null) return NotFound();

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            if (!album.IsPublic && album.OwnerId != userId)
                return Forbid();

            var tracks = await _albumService.GetTracksByAlbumAsync(albumId);
            return Ok(tracks);
        }

        // Додати трек у альбом
        [HttpPost("{albumId:int}/tracks/{trackId:int}")]
        [SwaggerOperation(OperationId = "AddTrackToAlbum", Summary = "Додати трек у альбом")]
        public async Task<IActionResult> AddTrack(int albumId, int trackId)
        {
            var album = await _albumService.GetByIdAsync(albumId);
            if (album == null) return NotFound();

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            if (album.OwnerId != userId && !User.IsInRole("Admin"))
                return Forbid();

            await _albumService.AddTrackToAlbumAsync(albumId, trackId);
            return NoContent();
        }

        // Видалити трек з альбому
        [HttpDelete("{albumId:int}/tracks/{trackId:int}")]
        [SwaggerOperation(OperationId = "RemoveTrackFromAlbum", Summary = "Видалити трек з альбому")]
        public async Task<IActionResult> RemoveTrack(int albumId, int trackId)
        {
            var album = await _albumService.GetByIdAsync(albumId);
            if (album == null) return NotFound();

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            if (album.OwnerId != userId && !User.IsInRole("Admin"))
                return Forbid();

            await _albumService.RemoveTrackFromAlbumAsync(albumId, trackId);
            return NoContent();
        }
    }
}
