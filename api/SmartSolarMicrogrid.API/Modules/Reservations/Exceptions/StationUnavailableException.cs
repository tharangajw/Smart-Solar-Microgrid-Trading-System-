namespace SmartSolarMicrogrid.API.Modules.Reservations.Exceptions
{
/*
 * File: StationUnavailableException.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
    public class StationUnavailableException : Exception
    {
// Initializes the StationUnavailableException instance.
        public StationUnavailableException(string message) : base(message) { }
    }
}
