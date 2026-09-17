using System.Collections.Generic;
using System.Threading.Tasks;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Repositories;

public interface IReservationRepository
{
    Task<Reservation> CreateAsync(Reservation reservation);
    Task<Reservation?> GetByIdAsync(string id);
    Task<List<Reservation>> GetAllAsync();
    Task<List<Reservation>> GetByProsumerNicAsync(string prosumerNic);
    Task<List<Reservation>> GetByStatusAsync(string status);
    Task<bool> UpdateAsync(Reservation reservation);
    Task<bool> UpdateStatusAsync(string id, string status, string? cancelledReason = null);
}
