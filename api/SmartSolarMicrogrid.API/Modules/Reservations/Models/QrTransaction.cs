using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Models
{
    public class QrTransaction
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string ProsumerId { get; set; } = null!;

        public string NodeId { get; set; } = null!;

        public double CapacityKWh { get; set; }

        public DateTime ScheduledTime { get; set; }

        public string Status { get; set; } = "Pending"; // Pending, Approved, Done, Cancelled

        public string QrCodeId { get; set; } = null!;

        // Links this QR transaction to the source booking that was approved.
        public string SourceReservationId { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
