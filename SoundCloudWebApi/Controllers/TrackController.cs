using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundCloudWebApi.Models.Track;
using SoundCloudWebApi.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    public class TrackController : ControllerBase
    {
        private readonly ITrackService _trackService;

        public TrackController(ITrackService trackService)
        {
            _trackService = trackService;
        }
        [AllowAnonymous]
        [HttpGet("krot")]
        [SwaggerOperation(
            OperationId = "GetAllTracksForAll",
            Summary = "Отримати всі видимі треки")]
        public async Task<IActionResult> GetAllTracks()
        {
            var tracks = await _trackService.GetAllTracksAsync();
            return Ok(tracks);
        }

        [HttpPost("create")]
        [SwaggerOperation(
            OperationId = "Create Track By local file",
            Summary = "Створити трек по локальному файлу wwwroot/uploads/tracks")]
        public async Task<IActionResult> CreateTrackFile(CreateTrackDto dto)
        {
            var track = await _trackService.CreateAsyncFile(dto);
            return Ok(track);
        }

        [HttpGet]
        [SwaggerOperation(
            OperationId = "GetTracks",
            Summary = "Отримати всі видимі треки поточного користувача")]
        public async Task<IActionResult> GetAll()
        {
            //var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            //var tracks = await _trackService.GetAllAsync(userId);
            var tracks = await _trackService.GetAllAsync();
            return Ok(tracks);
        }

        [HttpGet("{id:int}")]
        [SwaggerOperation(
            OperationId = "GetTrackById",
            Summary = "Отримати трек за ID")]
        public async Task<IActionResult> GetById(int id)
        {
            var track = await _trackService.GetByIdAsync(id);
            if (track == null) return NotFound();
            return Ok(track);
        }

        [HttpPost]
        [SwaggerOperation(
            OperationId = "CreateTrack",
            Summary = "Створити новий трек")]
        public async Task<IActionResult> Create([FromBody] CreateTrackDto dto)
        {
            //var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            //var created = await _trackService.CreateAsync(dto, userId);
            var created = await _trackService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        [SwaggerOperation(
            OperationId = "UpdateTrack",
            Summary = "Оновити трек за ID")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTrackDto dto)
        {
            await _trackService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [SwaggerOperation(
            OperationId = "DeleteTrack",
            Summary = "Видалити трек за ID")]
        public async Task<IActionResult> Delete(int id)
        {
            await _trackService.DeleteAsync(id);
            return NoContent();
        }

        [Authorize(Roles = "Moderator,Admin")]
        [HttpPatch("{id:int}/hide")]
        [SwaggerOperation(
            OperationId = "HideTrack",
            Summary = "Приховати трек [Moderator, Admin]")]
        public async Task<IActionResult> Hide(int id)
        {
            await _trackService.HideAsync(id);
            return NoContent();
        }

        [Authorize(Roles = "Moderator,Admin")]
        [HttpPatch("{id:int}/unhide")]
        [SwaggerOperation(
            OperationId = "UnhideTrack",
            Summary = "Відновити видимість треку [Moderator, Admin]")]
        public async Task<IActionResult> Unhide(int id)
        {
            await _trackService.UnhideAsync(id);
            return NoContent();
        }

        [HttpPost("{id:int}/image")]
        [Consumes("multipart/form-data")]
        [SwaggerOperation(Summary = "Завантажити обкладинку треку")]
        public async Task<IActionResult> UploadImage(int id, IFormFile file, [FromServices] IImageStorage storage)
        {
            if (file is null || file.Length == 0) return BadRequest("No file");

            var track = await _trackService.GetByIdAsync(id);
            if (track == null) return NotFound();

            //  апдейт у сервісі:
            var url = await storage.SaveAsync(file, "tracks");
            await _trackService.SetImageAsync(id, url);
            return Ok(new { imageUrl = url });
        }

        [HttpPost("{id:int}/listen")]
        [SwaggerOperation(
            OperationId = "ListenTrack",
            Summary = "Зареєструвати прослуховування треку поточним користувачем")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Listen(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _trackService.AddListenAsync(id, userId);
            return Ok(new { trackId = id, status = "listen-registered" });
        }

        [HttpPost("{id:int}/like")]
        [SwaggerOperation(
            OperationId = "LikeTrack",
            Summary = "Поставити лайк треку поточним користувачем")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Like(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            try
            {
                await _trackService.LikeAsync(id, userId);
                return Ok(new { trackId = id, status = "liked" });
            }
            catch (InvalidOperationException)
            {
                // Already liked
                return Conflict(new { trackId = id, error = "already-liked" });
            }
        }

        [HttpDelete("{id:int}/like")]
        [SwaggerOperation(
            OperationId = "UnlikeTrack",
            Summary = "Зняти лайк з треку поточним користувачем")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Unlike(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _trackService.UnlikeAsync(id, userId);
            return Ok(new { trackId = id, status = "unliked" });
        }

        [HttpGet("{id:int}/stats")]
        [SwaggerOperation(
            OperationId = "GetTrackStats",
            Summary = "Отримати статистику по треку (прослуховування, лайки)")]
        [ProducesResponseType(typeof(TrackStatsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTrackStats(int id)
        {
            var stats = await _trackService.GetTrackStatsAsync(id);
            return Ok(stats);
        }

        [HttpGet("author/{authorId:int}/stats")]
        [SwaggerOperation(
            OperationId = "GetAuthorStats",
            Summary = "Отримати агреговану статистику по автору (кількість треків, сумарні прослуховування/лайки)")]
        [ProducesResponseType(typeof(AuthorStatsDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAuthorStats(int authorId)
        {
            var stats = await _trackService.GetAuthorStatsAsync(authorId);
            return Ok(stats);
        }


    }
}
