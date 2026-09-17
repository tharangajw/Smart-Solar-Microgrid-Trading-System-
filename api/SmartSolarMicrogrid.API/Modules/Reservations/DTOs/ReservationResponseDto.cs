using System;

namespace SmartSolarMicrogrid.API.Modules.Reservations.DTOs;

public class ReservationResponseDto
{
    public string Id { get; set; } = string.Empty;
    public string ProsumerNic { get; set; } = string.Empty;
    public string SlotId { get; set; } = string.Empty;
    public string NodeId { get; set; } = string.Empty;
    public DateTime ReservationDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? CancelledReason { get; set; }
}
