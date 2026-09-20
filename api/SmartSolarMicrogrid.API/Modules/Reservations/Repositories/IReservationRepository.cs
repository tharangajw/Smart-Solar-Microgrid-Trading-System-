using SmartSolarMicrogrid.API.Modules.Reservations.Models;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Repositories
{
    public interface IReservationRepository
    {
        Task<Reservation> CreateReservationAsync(Reservation reservation);
        Task<Reservation?> GetReservationByIdAsync(String id);
        Task<List<Reservation>> GetAllReservationsAsync();
        Task<List<Reservation>> GetReservationsByProsumerNicAsync(String nic);
        Task<List<Reservation>> GetReservationByStatusAsync(String status);
        Task<bool> UpdateReservationAsync(String id, Reservation reservation);
        Task<bool> UpdateReservationStatusAsync(string id, string status,string? reason);
    }
}
