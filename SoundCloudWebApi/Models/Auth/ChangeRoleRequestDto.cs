using SoundCloudWebApi.Data.Entities;
using System.ComponentModel.DataAnnotations;

namespace SoundCloudWebApi.Models.Auth
{
    public class ChangeRoleRequestDto
    {
        [Required]
        [EnumDataType(typeof(UserRole))]
        public UserRole Role { get; set; }
    }

}
