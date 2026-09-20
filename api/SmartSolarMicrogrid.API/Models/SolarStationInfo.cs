// ============================================================================
// Module: Smart Solar Microgrid Trading System - C# Web API
// File: SolarStationInfo.cs
// Description: Data Model representing a Solar Microgrid Hub/Node including GPS
//              location, total capacity kW, battery slot specs, and operating schedule.
// ============================================================================

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartSolarMicrogrid.API.Models
{
    // GPS Coordinates Value Object
    public class GpsCoordinates
    {
        [BsonElement("lat")]
        public double Lat { get; set; }

        [BsonElement("lng")]
        public double Lng { get; set; }
    }

    // Battery Specs Value Object
    public class BatteryInfo
    {
        [BsonElement("totalSlots")]
        public int TotalSlots { get; set; }

        [BsonElement("slotCapacityKWh")]
        public double SlotCapacityKWh { get; set; }
    }

    // Operational Schedule Item
    public class ScheduleItem
    {
        [BsonElement("day")]
        public string Day { get; set; } = string.Empty;

        [BsonElement("openTime")]
        public string OpenTime { get; set; } = string.Empty;

        [BsonElement("closeTime")]
        public string CloseTime { get; set; } = string.Empty;
    }

    /// <summary>
    /// Solar Microgrid Station entity stored in MongoDB SolarStationInfo collection
    /// </summary>
    public class SolarStationInfo
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;

        [BsonElement("code")]
        public string Code { get; set; } = string.Empty;

        [BsonElement("gps")]
        public GpsCoordinates Gps { get; set; } = new GpsCoordinates();

        [BsonElement("capacityKW")]
        public double CapacityKW { get; set; }

        [BsonElement("battery")]
        public BatteryInfo Battery { get; set; } = new BatteryInfo();

        [BsonElement("operationalSchedule")]
        public List<ScheduleItem> OperationalSchedule { get; set; } = new List<ScheduleItem>();

        [BsonElement("status")]
        public string Status { get; set; } = "ACTIVE";

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
