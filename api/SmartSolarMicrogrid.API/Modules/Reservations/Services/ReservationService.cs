using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartSolarMicrogrid.API.Modules.Reservations.DTOs;
using SmartSolarMicrogrid.API.Modules.Reservations.Exceptions;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;
using SmartSolarMicrogrid.API.Modules.Reservations.Repositories;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Services;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _repository;

    public ReservationService(IReservationRepository repository)
    {
        _repository = repository;
    }

    private ReservationResponseDto MapToDto(Reservation reservation)
    {
        return new ReservationResponseDto
        {
            Id = reservation.Id ?? string.Empty,
            ProsumerNic = reservation.ProsumerNic,
            SlotId = reservation.SlotId,
            NodeId = reservation.NodeId,
            ReservationDate = reservation.ReservationDate,
            Status = reservation.Status,
            CreatedAt = reservation.CreatedAt,
            UpdatedAt = reservation.UpdatedAt,
            CancelledReason = reservation.CancelledReason
        };
    }

    public async Task<ReservationResponseDto> CreateReservationAsync(CreateReservationDto dto)
    {
        var now = DateTime.UtcNow;
        if (dto.ReservationDate < now)
        {
            throw new InvalidReservationDateException("Cannot book a past date");
        }

        if (dto.ReservationDate > now.AddDays(7))
        {
            throw new InvalidReservationDateException("Must be within 7 days");
        }

        var reservation = new Reservation
        {
            ProsumerNic = dto.ProsumerNic,
            SlotId = dto.SlotId,
            NodeId = dto.NodeId,
            ReservationDate = dto.ReservationDate,
            Status = "Pending",
            CreatedAt = now,
            UpdatedAt = now
        };

        var created = await _repository.CreateAsync(reservation);
        return MapToDto(created);
    }

    public async Task<ReservationResponseDto?> GetByIdAsync(string id)
    {
        var reservation = await _repository.GetByIdAsync(id);
        if (reservation == null)
            return null;
        
        return MapToDto(reservation);
    }

    public async Task<bool> UpdateReservationAsync(string id, UpdateReservationDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
        {
            throw new ReservationNotFoundException("Reservation not found");
        }

        if (existing.Status == "Cancelled" || existing.Status == "Completed")
        {
            throw new InvalidReservationStatusException("Cannot update this reservation");
        }

        var now = DateTime.UtcNow;
        if ((existing.ReservationDate - now).TotalHours < 12)
        {
            throw new NoticePeriodViolationException("Must update at least 12 hours before");
        }

        if (dto.SlotId != null)
        {
            existing.SlotId = dto.SlotId;
        }

        if (dto.ReservationDate.HasValue)
        {
            if (dto.ReservationDate.Value < now)
            {
                throw new InvalidReservationDateException("Cannot book a past date");
            }
            if (dto.ReservationDate.Value > now.AddDays(7))
            {
                throw new InvalidReservationDateException("Must be within 7 days");
            }

            existing.ReservationDate = dto.ReservationDate.Value;
        }

        existing.UpdatedAt = now;
        return await _repository.UpdateAsync(existing);
    }

    public async Task<bool> CancelReservationAsync(string id, CancelReservationDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null)
        {
            throw new ReservationNotFoundException("Reservation not found");
        }

        if (existing.Status == "Cancelled" || existing.Status == "Completed")
        {
            throw new InvalidReservationStatusException("Cannot cancel this reservation");
        }

        var now = DateTime.UtcNow;
        if ((existing.ReservationDate - now).TotalHours < 12)
        {
            throw new NoticePeriodViolationException("Must cancel at least 12 hours before");
        }

        return await _repository.UpdateStatusAsync(id, "Cancelled", dto.CancelledReason ?? "No reason provided");
    }

    public async Task<List<ReservationResponseDto>> GetPendingAsync(string? nic = null)
    {
        List<Reservation> reservations;
        if (string.IsNullOrEmpty(nic))
        {
            reservations = await _repository.GetByStatusAsync("Pending");
        }
        else
        {
            reservations = await _repository.GetByProsumerNicAsync(nic);
            reservations = reservations.Where(r => r.Status == "Pending").ToList();
        }

        return reservations.Select(MapToDto).ToList();
    }

    public async Task<List<ReservationResponseDto>> GetHistoryAsync(string? nic = null)
    {
        List<Reservation> reservations;
        if (string.IsNullOrEmpty(nic))
        {
            reservations = await _repository.GetAllAsync();
        }
        else
        {
            reservations = await _repository.GetByProsumerNicAsync(nic);
        }

        return reservations
            .Where(r => r.Status == "Completed" || r.Status == "Cancelled")
            .Select(MapToDto).ToList();
    }

    public async Task<List<ReservationResponseDto>> SearchAsync(string? nic = null, string? status = null, DateTime? dateFrom = null, DateTime? dateTo = null)
    {
        var reservations = await _repository.GetAllAsync();
        var query = reservations.AsQueryable();

        if (!string.IsNullOrEmpty(nic))
        {
            query = query.Where(r => r.ProsumerNic == nic);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(r => r.Status == status);
        }

        if (dateFrom.HasValue)
        {
            query = query.Where(r => r.ReservationDate >= dateFrom.Value);
        }

        if (dateTo.HasValue)
        {
            query = query.Where(r => r.ReservationDate <= dateTo.Value);
        }

        return query.Select(MapToDto).ToList();
    }

    public async Task<int> GetApprovedFutureCountAsync(string? nic = null)
    {
        var reservations = await _repository.GetAllAsync();
        var query = reservations.AsQueryable();

        if (!string.IsNullOrEmpty(nic))
        {
            query = query.Where(r => r.ProsumerNic == nic);
        }

        var now = DateTime.UtcNow;
        return query.Count(r => r.Status == "Approved" && r.ReservationDate > now);
    }
}
