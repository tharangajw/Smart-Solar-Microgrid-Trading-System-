using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartSolarMicrogrid.API.Modules.Users.Models
{
// User model representing all system users (Backoffice, Grid Operator, Prosumer)
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

// National Identity Card - Primary key for prosumers
        [BsonElement("nic")]
        public string Nic { get; set; } = string.Empty;

// User's full name
        [BsonElement("fullName")]
        public string FullName { get; set; } = string.Empty;

// User's email address
        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

// Hashed password
        [BsonElement("password")]
        public string Password { get; set; } = string.Empty;

// User role: Backoffice, GridOperator, or Prosumer
        [BsonElement("role")]
        public string Role { get; set; } = string.Empty;

// Phone number
        [BsonElement("phoneNumber")]
        public string? PhoneNumber { get; set; }

// Physical address
        [BsonElement("address")]
        public string? Address { get; set; }
// Account activation status
        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

// Account creation date
        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

// Last updated date
        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

// Solar panel capacity in kW (for prosumers)
        [BsonElement("solarCapacityKw")]
        public double? SolarCapacityKw { get; set; }
    }

// User role constants
    public static class UserRoles
    {
        public const string Backoffice = "Backoffice";
        public const string GridOperator = "GridOperator";
        public const string Prosumer = "Prosumer";
    }
}
