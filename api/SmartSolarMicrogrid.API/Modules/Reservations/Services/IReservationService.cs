using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartSolarMicrogrid.API.Modules.Reservations.DTOs;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Services;

public interface IReservationService
{
    Task<ReservationResponseDto> CreateReservationAsync(CreateReservationDto dto);
    Task<ReservationResponseDto?> GetByIdAsync(string id);
    Task<bool> UpdateReservationAsync(string id, UpdateReservationDto dto);
    Task<bool> CancelReservationAsync(string id, CancelReservationDto dto);
    Task<List<ReservationResponseDto>> GetPendingAsync(string? nic = null);
    Task<List<ReservationResponseDto>> GetHistoryAsync(string? nic = null);
    Task<List<ReservationResponseDto>> SearchAsync(string? nic = null, string? status = null, DateTime? dateFrom = null, DateTime? dateTo = null);
    Task<int> GetApprovedFutureCountAsync(string? nic = null);
}
