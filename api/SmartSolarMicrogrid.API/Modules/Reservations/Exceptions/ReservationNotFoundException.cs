namespace SmartSolarMicrogrid.API.Modules.Reservations.Exceptions
{
    public class ReservationNotFoundException:Exception
    {
        public ReservationNotFoundException(string message):base(message)
        {
        }
    }
}
