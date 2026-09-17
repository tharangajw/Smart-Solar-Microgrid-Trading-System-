using System;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Exceptions;

public class NoticePeriodViolationException : Exception
{
    public NoticePeriodViolationException(string message) : base(message) { }
}
