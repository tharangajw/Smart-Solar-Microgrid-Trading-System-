namespace SmartSolarMicrogrid.API.Modules.Reservations.DTOs
{
    public class CreateREservationDto
    {
        public string ProsumerNic { get; set; }
        public string SlotId { get; set; }
        public string NodeId { get; set; }
        public string ReservationDate { get; set; }
    }
}
