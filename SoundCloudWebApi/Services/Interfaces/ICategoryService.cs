using System.Collections.Generic;
using System.Threading.Tasks;
using SoundCloudWebApi.Models.Category;

namespace SoundCloudWebApi.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<int> CreateAsync(CategoryCreateModel model);
        Task<IEnumerable<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(int id);
        Task UpdateAsync(int id, CategoryUpdateModel model);
        Task DeleteAsync(int id);
    }
}
