namespace SmartSolarMicrogrid.API.Modules.Reservations.DTOs
{
    public class ReservationResponseDto
    {
        public string Id { get; set; }
        public string ProsumerNic { get; set; }
        public string SlotId { get; set; }
        public string NodeId { get; set; }
        public DateTime ReservationDate { get; set; }
        public string Status { get; set; } = "Pending";
        public string? QrCodeId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string? CancelledReason { get; set; }
    }
}
