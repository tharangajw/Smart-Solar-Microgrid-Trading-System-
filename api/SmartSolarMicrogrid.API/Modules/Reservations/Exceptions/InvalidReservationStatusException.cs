namespace SmartSolarMicrogrid.API.Modules.Reservations.Exceptions
{
    public class InvalidReservationStatusException:Exception
    {
        public InvalidReservationStatusException(string message):base(message)
        {
        }
    }
}
