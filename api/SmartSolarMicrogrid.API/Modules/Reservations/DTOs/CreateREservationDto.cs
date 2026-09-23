namespace SmartSolarMicrogrid.API.Modules.Reservations.DTOs
{
/*
 * File: CreateREservationDto.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
    public class CreateREservationDto
    {
        public string ProsumerNic { get; set; }
        public string SlotId { get; set; }
        public string NodeId { get; set; }
        public DateTime ReservationDate { get; set; }
    }
}
