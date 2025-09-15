namespace SoundCloudWebApi.Models.Category;

public class CategoryCreateModel
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public int PlayCount { get; set; } = 0;
    public IFormFile? ImageFile { get; set; } = null;
}
