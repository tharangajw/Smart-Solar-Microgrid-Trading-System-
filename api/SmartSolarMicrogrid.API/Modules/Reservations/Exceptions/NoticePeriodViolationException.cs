namespace SmartSolarMicrogrid.API.Modules.Reservations.Exceptions
{
/*
 * File: NoticePeriodViolationException.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
    public class NoticePeriodViolationException:Exception
    {
// Initializes the NoticePeriodViolationException instance.
        public NoticePeriodViolationException(string message):base(message)
        {
        }
    }
}
