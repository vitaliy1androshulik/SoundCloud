using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SoundCloudWebApi.Models.Category;
using SoundCloudWebApi.Services.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace SoundCloudWebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _service;
    public CategoriesController(ICategoryService service) => _service = service;

    [HttpGet]
    [SwaggerOperation(Summary = "Список категорій")]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    [SwaggerOperation(Summary = "Категорія за ID")]
    public async Task<IActionResult> GetById(int id)
    {
        var res = await _service.GetByIdAsync(id);
        return res == null ? NotFound() : Ok(res);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    [SwaggerOperation(Summary = "Створити категорію [Admin]")]
    public async Task<IActionResult> Create([FromForm] CategoryCreateModel model)
    {
        var id = await _service.CreateAsync(model);
        return CreatedAtAction(nameof(GetById), new { id }, null);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    [SwaggerOperation(Summary = "Оновити категорію [Admin]")]
    public async Task<IActionResult> Update(int id, [FromForm] CategoryUpdateModel model)
    {
        await _service.UpdateAsync(id, model);
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    [SwaggerOperation(Summary = "Видалити категорію [Admin]")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
