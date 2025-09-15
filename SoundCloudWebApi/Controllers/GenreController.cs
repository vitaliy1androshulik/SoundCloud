using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundCloudWebApi.Models.Genre;
using SoundCloudWebApi.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;
using System.Threading.Tasks;

namespace SoundCloudWebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GenreController : ControllerBase
    {
        private readonly IGenreService _genreService;

        public GenreController(IGenreService genreService)
        {
            _genreService = genreService;
        }

        [HttpGet]
        [SwaggerOperation(Summary = "Отримати всі жанри")]
        public async Task<IActionResult> GetAll()
        {
            var genres = await _genreService.GetAllAsync();
            return Ok(genres);
        }

        [HttpGet("{id:int}")]
        [SwaggerOperation(Summary = "Отримати жанр за ID")]
        public async Task<IActionResult> GetById(int id)
        {
            var genre = await _genreService.GetByIdAsync(id);
            if (genre == null) return NotFound();
            return Ok(genre);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [SwaggerOperation(Summary = "Створити новий жанр")]
        public async Task<IActionResult> Create([FromBody] GenreCreateDto dto)
        {
            var genre = await _genreService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = genre.Id }, genre);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [SwaggerOperation(Summary = "Оновити жанр за ID")]
        public async Task<IActionResult> Update(int id, [FromBody] GenreUpdateDto dto)
        {
            await _genreService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        [SwaggerOperation(Summary = "Видалити жанр за ID")]
        public async Task<IActionResult> Delete(int id)
        {
            await _genreService.DeleteAsync(id);
            return NoContent();
        }
    }
}
