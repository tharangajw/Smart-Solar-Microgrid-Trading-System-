namespace SmartSolarMicrogrid.API.Modules.Authentication.Models
{
/*
 * File: LoginResponse.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
// Login response model with JWT token
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Nic { get; set; } = string.Empty;
    }
}
