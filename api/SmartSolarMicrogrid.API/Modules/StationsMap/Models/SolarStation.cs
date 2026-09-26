/*
 * SolarStation.cs
 * Model representing a solar microgrid node/station stored in MongoDB.
 * Used for nearby station queries and station detail views via the Google Maps integration.
 * Author: Member 4 - Operator Product
 */

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartSolarMicrogrid.API.Modules.StationsMap.Models
{
    [BsonIgnoreExtraElements]
    public class SolarStation
    {
        // MongoDB primary key
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        // Human-readable station name (e.g., "Node A - Colombo")
        public string Name { get; set; } = null!;

        // Physical location description
        public string? Location { get; set; }

        // GPS latitude for Google Maps plotting
        public double Latitude { get; set; }

        // GPS longitude for Google Maps plotting
        public double Longitude { get; set; }

        // Total battery slots at this node
        public int TotalSlots { get; set; }

        // Currently available battery slots
        public int AvailableSlots { get; set; }

        // Maximum energy capacity in kW
        public double CapacityKw { get; set; }
        
        // Operational schedule (e.g., "06:00 - 18:00")
        public string? Schedule { get; set; }

        // Operational status: "active", "inactive", "full"
        public string? Status { get; set; } = "active";

        public bool IsActive { get; set; } = true;

        // Timestamp when the station was registered
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
