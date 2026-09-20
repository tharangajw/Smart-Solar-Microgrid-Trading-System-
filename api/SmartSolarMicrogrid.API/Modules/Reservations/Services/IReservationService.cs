using SmartSolarMicrogrid.API.Modules.Reservations.DTOs;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Services
{
    public interface IReservationService
    {
        Task<ReservationResponseDto> CreateReservationAsync(CreateREservationDto createReservationDto);
        Task<ReservationResponseDto> GetReservationByIdAsync(string id);
        Task<ReservationResponseDto> UpdateReservationAsync(string id, UpdateReservationDto updateReservationDto);
        Task<ReservationResponseDto> CancelReservationAsync(string id, CancelReservationDto cancelReservationDto);
        Task<List<ReservationResponseDto>> GetPendingReservationsByProsumerNicAsync(string? nic);
        Task<List<ReservationResponseDto>> GetHistoryByProsumerNicAsync(string? nic);
        Task<List<ReservationResponseDto>> SearchReservationsAsync(string? nic, string? status, DateTime? from, DateTime? to);
        Task<int> GetApprovedFutureCountAsync(string? nic);
    }
}
