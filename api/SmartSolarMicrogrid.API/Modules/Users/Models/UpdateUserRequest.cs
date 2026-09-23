namespace SmartSolarMicrogrid.API.Modules.Users.Models
{
/*
 * File: UpdateUserRequest.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
// Update user request model
    public class UpdateUserRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public double? SolarCapacityKw { get; set; }
    }
}
