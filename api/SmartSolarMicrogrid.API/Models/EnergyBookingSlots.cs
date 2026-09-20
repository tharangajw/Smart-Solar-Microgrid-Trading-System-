// ============================================================================
// Module: Smart Solar Microgrid Trading System - C# Web API
// File: EnergyBookingSlots.cs
// Description: Data Model representing an Energy Storage Slot allocated for power
//              drop-off or charging at a Solar Microgrid Station Node.
// ============================================================================

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartSolarMicrogrid.API.Models
{
    /// <summary>
    /// Energy Storage Slot entity stored in MongoDB EnergyBookingSlots collection
    /// </summary>
    public class EnergyBookingSlots
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("nodeId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string NodeId { get; set; } = string.Empty;

        [BsonElement("slotNumber")]
        public int SlotNumber { get; set; }

        [BsonElement("startTime")]
        public DateTime StartTime { get; set; }

        [BsonElement("endTime")]
        public DateTime EndTime { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "AVAILABLE";

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
