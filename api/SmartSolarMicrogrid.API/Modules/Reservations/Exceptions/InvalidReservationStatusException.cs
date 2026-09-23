namespace SmartSolarMicrogrid.API.Modules.Reservations.Exceptions
{
/*
 * File: InvalidReservationStatusException.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
    public class InvalidReservationStatusException:Exception
    {
// Initializes the InvalidReservationStatusException instance.
        public InvalidReservationStatusException(string message):base(message)
        {
        }
    }
}
