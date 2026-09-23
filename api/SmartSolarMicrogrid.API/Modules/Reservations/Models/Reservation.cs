using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
/*
 * File: Reservation.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */

namespace SmartSolarMicrogrid.API.Modules.Reservations.Models
{
    public class Reservation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } 
        [BsonElement("prosumerNic")]
        public string ProsumerNic { get; set; }
        public string SlotId { get; set; }
        public string NodeId { get; set; }
        public DateTime ReservationDate { get; set; }
        public string Status { get; set; } = "Pending";
        /// <summary>
        /// The transaction QR identifier created when this reservation is approved.
        /// Keeping it on the source reservation lets booking-history clients render
        /// the same code that the operator validates.
        /// </summary>
        public string? QrCodeId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string? CancelledReason { get; set; }
    }
}
