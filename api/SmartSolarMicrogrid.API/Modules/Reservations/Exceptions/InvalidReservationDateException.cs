using System;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Exceptions;

public class InvalidReservationDateException : Exception
{
    public InvalidReservationDateException(string message) : base(message) { }
}
