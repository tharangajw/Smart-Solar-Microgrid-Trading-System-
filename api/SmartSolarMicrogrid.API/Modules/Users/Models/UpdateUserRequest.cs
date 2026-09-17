namespace SmartSolarMicrogrid.API.Modules.Users.Models
{
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
