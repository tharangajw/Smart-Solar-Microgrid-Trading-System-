using System;
using System.ComponentModel.DataAnnotations;

namespace SmartSolarMicrogrid.API.Modules.Reservations.DTOs;

public class CreateReservationDto
{
    [Required]
    public string ProsumerNic { get; set; } = string.Empty;

    [Required]
    public string SlotId { get; set; } = string.Empty;

    [Required]
    public string NodeId { get; set; } = string.Empty;

    [Required]
    public DateTime ReservationDate { get; set; }
}
