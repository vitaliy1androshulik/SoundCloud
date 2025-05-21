using Microsoft.AspNetCore.Mvc;
using SoundCloudWebApi.Models.Category;

namespace SoundCloudWebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromForm]CategoryCreateModel model)
    {
        return Ok();
    }
}
