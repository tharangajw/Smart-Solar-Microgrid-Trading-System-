namespace SmartSolarMicrogrid.API.Modules.Authentication.Models
{
// Login request model
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
