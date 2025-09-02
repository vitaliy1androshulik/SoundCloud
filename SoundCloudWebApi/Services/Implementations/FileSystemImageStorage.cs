using Microsoft.AspNetCore.Hosting;
using SoundCloudWebApi.Services.Interfaces;

namespace SoundCloudWebApi.Services.Implementations
{
    public class FileSystemImageStorage : IImageStorage
    {
        private readonly IWebHostEnvironment _env;
        public FileSystemImageStorage(IWebHostEnvironment env) => _env = env;

        public async Task<string> SaveAsync(IFormFile file, string subfolder)
        {
            var uploadsRoot = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads", subfolder);
            Directory.CreateDirectory(uploadsRoot);

            var name = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var full = Path.Combine(uploadsRoot, name);

            using (var fs = new FileStream(full, FileMode.Create))
                await file.CopyToAsync(fs);

            // URL для клієнта
            return $"/uploads/{subfolder}/{name}";
        }
    }
}
