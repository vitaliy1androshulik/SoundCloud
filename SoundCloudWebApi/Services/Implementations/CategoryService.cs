using Microsoft.EntityFrameworkCore;
using SoundCloudWebApi.Data;
using SoundCloudWebApi.Data.Entities;
using SoundCloudWebApi.Models.Category;
using SoundCloudWebApi.Services.Interfaces;

namespace SoundCloudWebApi.Services.Implementations
{
    public class CategoryService : ICategoryService
    {
        private readonly SoundCloudDbContext _db;
        private readonly IImageStorage _storage;

        public CategoryService(SoundCloudDbContext db, IImageStorage storage)
        {
            _db = db;
            _storage = storage;
        }

        public async Task<int> CreateAsync(CategoryCreateModel model)
        {
            var entity = new CategoryEntity
            {
                Name = model.Name,
                Slug = model.Slug,
                ImageUrl = model.ImageFile != null
                    ? await _storage.SaveAsync(model.ImageFile, "categories")
                    : null
            };
            _db.Categories.Add(entity);
            await _db.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync() =>
            await _db.Categories
                .AsNoTracking()
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    ImageUrl = c.ImageUrl
                })
                .ToListAsync();

        public async Task<CategoryDto?> GetByIdAsync(int id) =>
            await _db.Categories
                .Where(c => c.Id == id)
                .Select(c => new CategoryDto
                { Id = c.Id, Name = c.Name, Slug = c.Slug, ImageUrl = c.ImageUrl })
                .FirstOrDefaultAsync();

        public async Task UpdateAsync(int id, CategoryUpdateModel model)
        {
            var c = await _db.Categories.FindAsync(id)
                ?? throw new KeyNotFoundException($"Category {id} not found");

            c.Name = model.Name;
            c.Slug = model.Slug;

            if (model.ImageFile != null)
                c.ImageUrl = await _storage.SaveAsync(model.ImageFile, "categories");

            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var c = await _db.Categories.FindAsync(id)
                ?? throw new KeyNotFoundException($"Category {id} not found");
            _db.Categories.Remove(c);
            await _db.SaveChangesAsync();
        }
    }
}
