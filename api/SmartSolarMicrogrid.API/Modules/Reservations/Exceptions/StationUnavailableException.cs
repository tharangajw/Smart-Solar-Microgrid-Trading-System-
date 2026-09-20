namespace SmartSolarMicrogrid.API.Modules.Reservations.Exceptions
{
    public class StationUnavailableException : Exception
    {
        public StationUnavailableException(string message) : base(message) { }
    }
}
