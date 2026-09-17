using System;

namespace SmartSolarMicrogrid.API.Modules.Reservations.DTOs;

public class UpdateReservationDto
{
    public string? SlotId { get; set; }

    public DateTime? ReservationDate { get; set; }
}
