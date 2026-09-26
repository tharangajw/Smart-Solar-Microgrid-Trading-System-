namespace SmartSolarMicrogrid.API.Modules.Reservations.DTOs
{
/*
 * File: UpdateReservationDto.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
    public class UpdateReservationDto
    {
        public string SlotId { get; set; }
        public DateTime? ReservationDate { get; set; }
    }
}
