namespace SmartSolarMicrogrid.API.Modules.Authentication.Models
{
/*
 * File: LoginRequest.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
// Login request model — Email field also accepts NIC (mobile "NIC / Email" field)
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string? Nic { get; set; }
        public string Password { get; set; } = string.Empty;
    }
}
