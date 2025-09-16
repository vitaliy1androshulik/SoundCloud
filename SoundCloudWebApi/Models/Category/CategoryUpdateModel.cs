namespace SoundCloudWebApi.Models.Category
{
    public class CategoryUpdateModel
    {
        public string Name { get; set; } = "";
        public string Slug { get; set; } = "";
        public int PlayCount { get; set; } = 0;
        public IFormFile? ImageFile { get; set; }
    }
}
