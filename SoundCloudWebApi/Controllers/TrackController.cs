using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundCloudWebApi.Models.Track;
using SoundCloudWebApi.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TrackController : ControllerBase
    {
        private readonly ITrackService _trackService;

        public TrackController(ITrackService trackService)
        {
            _trackService = trackService;
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

    }
}
