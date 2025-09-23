using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundCloudWebApi.Models.Track;
using SoundCloudWebApi.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using System.Security.Claims;

namespace SoundCloudWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TrackController : ControllerBase
    {
        private readonly ITrackService _trackService;

        public TrackController(ITrackService trackService)
        {
            _trackService = trackService;
        }

        // ===== Публічні треки =====
        [AllowAnonymous]
        [HttpGet("all")]
        [SwaggerOperation(OperationId = "GetAllTracksForAll", Summary = "Отримати всі видимі треки")]
        public async Task<IActionResult> GetAllTracks()
        {
            var tracks = await _trackService.GetAllTracksAsync();
            return Ok(tracks);
        }

        // ===== Треки поточного користувача =====
        [HttpGet]
        [SwaggerOperation(OperationId = "GetTracks", Summary = "Отримати всі треки поточного користувача")]
        public async Task<IActionResult> GetAll()
        {
            var tracks = await _trackService.GetAllAsync();
            return Ok(tracks);
        }

        // ===== Треки поточного користувача =====
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyTracks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token.");
            }

            var userId = int.Parse(userIdClaim.Value);

            var tracks = await _trackService.GetAllByUserAsync(userId);
            return Ok(tracks);
        }

        [HttpGet("{id:int}")]
        [SwaggerOperation(OperationId = "GetTrackById", Summary = "Отримати трек за ID")]
        public async Task<IActionResult> GetById(int id)
        {
            var track = await _trackService.GetByIdAsync(id);
            if (track == null) return NotFound();
            return Ok(track);
        }

        // ===== Створення треку =====
        [HttpPost]
        [SwaggerOperation(OperationId = "CreateTrack", Summary = "Створити новий трек")]
        public async Task<IActionResult> Create([FromBody] CreateTrackDto dto)
        {
            var created = await _trackService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPost("create-file")]
        [SwaggerOperation(OperationId = "CreateTrackFromFile", Summary = "Створити трек по локальному файлу")]
        public async Task<IActionResult> CreateTrackFile([FromForm] CreateTrackDto dto)
        {
            var track = await _trackService.CreateAsyncFile(dto);
            return Ok(track);
        }

        // ===== Оновлення треку =====
        [HttpPut("{id:int}")]
        [SwaggerOperation(OperationId = "UpdateTrack", Summary = "Оновити трек за ID")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateTrackDto dto)
        {
            await _trackService.UpdateAsync(id, dto);
            return NoContent();
        }

        // ===== Видалення треку =====
        [HttpDelete("{id:int}")]
        [SwaggerOperation(OperationId = "DeleteTrack", Summary = "Видалити трек за ID")]
        public async Task<IActionResult> Delete(int id)
        {
            await _trackService.DeleteAsync(id);
            return NoContent();
        }

        // ===== Приховування/відновлення треку =====
        [Authorize(Roles = "Moderator,Admin")]
        [HttpPatch("{id:int}/hide")]
        [SwaggerOperation(OperationId = "HideTrack", Summary = "Приховати трек [Moderator, Admin]")]
        public async Task<IActionResult> Hide(int id)
        {
            await _trackService.HideAsync(id);
            return NoContent();
        }

        [Authorize(Roles = "Moderator,Admin")]
        [HttpPatch("{id:int}/unhide")]
        [SwaggerOperation(OperationId = "UnhideTrack", Summary = "Відновити видимість треку [Moderator, Admin]")]
        public async Task<IActionResult> Unhide(int id)
        {
            await _trackService.UnhideAsync(id);
            return NoContent();
        }

        // ===== Завантаження обкладинки =====
        [HttpPost("{id:int}/image")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(Summary = "Завантажити обкладинку треку")]
        public async Task<IActionResult> UploadImage(int id, IFormFile file, [FromServices] IImageStorage storage)
        {
            if (file == null || file.Length == 0) return BadRequest("No file");

            var track = await _trackService.GetByIdAsync(id);
            if (track == null) return NotFound();

            var url = await storage.SaveAsync(file, "tracks");
            await _trackService.SetImageAsync(id, url);

            return Ok(new { imageUrl = url });
        }


        [HttpPost("{id:int}/like")]
        public async Task<IActionResult> Like(int id)
        {
            await _trackService.LikeAsync(id); // додаємо лайк
            var track = await _trackService.GetByIdAsync(id); // отримуємо актуальний трек
            return Ok(track);
        }

        [HttpDelete("{id:int}/like")]
        public async Task<IActionResult> Unlike(int id)
        {
            await _trackService.UnlikeAsync(id); // видаляємо лайк
            var track = await _trackService.GetByIdAsync(id); // отримуємо актуальний трек
            return Ok(track);
        }

        // Отримати улюблені треки авторизованого користувача
        [HttpGet("liked")]
        [Authorize]
        public async Task<IActionResult> GetLikedTracks()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            int userId = int.Parse(userIdClaim.Value);

            List<TrackDto> tracks = await _trackService.GetLikedByUserAsync(userId);
            return Ok(tracks);
        }


        [HttpPost("{trackId}/play")]
        public async Task<IActionResult> PlayTrack(int trackId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value); // витягуєш з JWT
            await _trackService.AddPlayAsync(trackId);
            return Ok();
        }

        // ===== Статистика =====
        [HttpGet("{id:int}/stats")]
        [SwaggerOperation(OperationId = "GetTrackStats", Summary = "Отримати статистику по треку")]
        public async Task<IActionResult> GetTrackStats(int id)
        {
            var stats = await _trackService.GetTrackStatsAsync(id);
            return Ok(stats);
        }

        [HttpGet("author/{authorId:int}/stats")]
        [SwaggerOperation(OperationId = "GetAuthorStats", Summary = "Отримати статистику по автору")]
        public async Task<IActionResult> GetAuthorStats(int authorId)
        {
            var stats = await _trackService.GetAuthorStatsAsync(authorId);
            return Ok(stats);
        }
    }
}
