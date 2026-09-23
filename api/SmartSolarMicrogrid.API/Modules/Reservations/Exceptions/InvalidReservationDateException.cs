namespace SmartSolarMicrogrid.API.Modules.Reservations.Exceptions
{
/*
 * File: InvalidReservationDateException.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
    public class InvalidReservationDateException:Exception
    {
// Initializes the InvalidReservationDateException instance.
        public InvalidReservationDateException(string message):base(message)
        {
        }
    }
}
