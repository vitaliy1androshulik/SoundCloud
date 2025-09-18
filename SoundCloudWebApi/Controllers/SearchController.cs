using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly ISearchService _search;
    public SearchController(ISearchService search) => _search = search;

    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string q,
        [FromQuery] int trackPage = 1,
        [FromQuery] int trackPageSize = 8,
        [FromQuery] int albumPage = 1,
        [FromQuery] int albumPageSize = 6,
        [FromQuery] int playlistPage = 1,
        [FromQuery] int playlistPageSize = 6, 
        [FromQuery] int userPage = 1,
        [FromQuery] int userPageSize = 6,
        [FromQuery] string[]? types = null) // types=tracks,albums
    {
        string[]? typesArr = null;

        if (types != null && types.Length > 0)
        {
            typesArr = types
                .SelectMany(t => t.Split(',', StringSplitOptions.RemoveEmptyEntries))
                .Select(s => s.Trim())
                .ToArray();
        }
        var res = await _search.SearchAsync(q, trackPage, trackPageSize, albumPage, albumPageSize, playlistPage, playlistPageSize, userPage,userPageSize, typesArr);
        return Ok(res);
    }

    // optional: suggestions endpoint
    [HttpGet("suggest")]
    public async Task<IActionResult> Suggest([FromQuery] string q)
    {
        // implement small quick suggestions (top 5) — omitted for brevity
        return Ok();
    }
}