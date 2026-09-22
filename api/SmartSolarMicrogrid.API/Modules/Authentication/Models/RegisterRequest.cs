using System.ComponentModel.DataAnnotations;

/*
 * File: RegisterRequest.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
namespace SmartSolarMicrogrid.API.Modules.Authentication.Models
{
// Registration request model for prosumers
    public class RegisterRequest
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

        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }

        public double? SolarCapacityKw { get; set; }
    }
}
