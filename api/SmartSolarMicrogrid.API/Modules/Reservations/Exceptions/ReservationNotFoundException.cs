namespace SmartSolarMicrogrid.API.Modules.Reservations.Exceptions
{
/*
 * File: ReservationNotFoundException.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
    public class ReservationNotFoundException:Exception
    {
// Initializes the ReservationNotFoundException instance.
        public ReservationNotFoundException(string message):base(message)
        {
        }
    }
}
