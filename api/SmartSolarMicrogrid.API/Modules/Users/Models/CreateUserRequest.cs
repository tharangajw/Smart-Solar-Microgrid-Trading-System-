using System.ComponentModel.DataAnnotations;

namespace SmartSolarMicrogrid.API.Modules.Users.Models
{
// Create user request for Backoffice users
    public class CreateUserRequest
    {
        [Required]
        public string Nic { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }
    }
}
