using SmartSolarMicrogrid.API.Helpers;
using SmartSolarMicrogrid.API.Modules.Reservations.DTOs;
/*
 * File: ReservationService.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
using SmartSolarMicrogrid.API.Modules.Reservations.Exceptions;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;
using SmartSolarMicrogrid.API.Modules.Reservations.Repositories;
using SmartSolarMicrogrid.API.Modules.StationsMap.Services;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Services
{
    // Handles energy slot reservations, 7-day limits, and 12-hour cancellation rules
    public class ReservationService : IReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly StationService _stationService;
        private readonly ReservationModelToDTO _mapper;

        // Injects repository, station service, and DTO mapper
        public ReservationService(IReservationRepository reservationRepository, StationService stationService, ReservationModelToDTO mapper)
        {
            _reservationRepository = reservationRepository;
            _stationService = stationService;
            _mapper = mapper;
        }

        // Creates a new reservation if date is valid (max 7 days) and station slots are available
        public async Task<ReservationResponseDto> CreateReservationAsync(CreateREservationDto createReservationDto)
        {
            if (createReservationDto.ReservationDate < DateTime.UtcNow)
            {
                throw new InvalidReservationDateException("Reservation date cannot be in the past.");
            }

            if (createReservationDto.ReservationDate > DateTime.UtcNow.AddDays(7))
            {
                throw new InvalidReservationDateException("Reservation date cannot be more than 7 days in the future.");
            }

            if (!await _stationService.ReserveSlotAsync(createReservationDto.NodeId))
                throw new StationUnavailableException("This station has no available slots.");

            var reservation = new Reservation
            {
                ProsumerNic = createReservationDto.ProsumerNic,
                SlotId = createReservationDto.SlotId,
                NodeId = createReservationDto.NodeId,
                ReservationDate = createReservationDto.ReservationDate,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            try
            {
                var result = await _reservationRepository.CreateReservationAsync(reservation);
                return _mapper.MapToDto(result);
            }
            catch
            {
                await _stationService.ReleaseSlotAsync(createReservationDto.NodeId);
                throw;
            }
        }

        // Updates reservation date/slot if requested at least 12 hours before appointment
        public async Task<ReservationResponseDto> UpdateReservationAsync(string id, UpdateReservationDto updateReservationDto)
        {
            var existingReservation = await _reservationRepository.GetReservationByIdAsync(id);

            if (existingReservation == null)
            {
                throw new ReservationNotFoundException("Reservation with not found.");
            }

            if (existingReservation.Status == "Cancelled" || existingReservation.Status == "Completed")
            {
                throw new InvalidReservationStatusException($"Cannot update reservation with status {existingReservation.Status}.");
            }

            var timeUntilReservation = existingReservation.ReservationDate - DateTime.UtcNow;

            if (timeUntilReservation.TotalHours < 12)
            {
                throw new NoticePeriodViolationException("Updates require atleast 12 hours notice.");
            }

            if (updateReservationDto.ReservationDate < DateTime.UtcNow)
            {
                throw new InvalidReservationDateException("Updates require at least 12 hours notice.");
            }

            if (updateReservationDto.ReservationDate > (DateTime.UtcNow).AddDays(7))
            {
                throw new InvalidReservationDateException("Reservation must be scheduled within 7 days.");
            }

            existingReservation.SlotId = updateReservationDto.SlotId;
            existingReservation.ReservationDate = updateReservationDto.ReservationDate ?? existingReservation.ReservationDate;
            existingReservation.UpdatedAt = DateTime.UtcNow;

            await _reservationRepository.UpdateReservationAsync(id, existingReservation);
            return _mapper.MapToDto(existingReservation);
        }

        // Cancels reservation if at least 12 hours notice is given, and frees station slot
        public async Task<ReservationResponseDto> CancelReservationAsync(string id, CancelReservationDto cancelReservationDto)
        {
            var existingReservation = await _reservationRepository.GetReservationByIdAsync(id);

            if (existingReservation == null)
            {
                throw new ReservationNotFoundException($"Reservation with id {id} not found.");
            }

            if (existingReservation.Status == "Cancelled" || existingReservation.Status == "Completed")
            {
                throw new InvalidReservationStatusException($"Cannot cancel the reservation,It was already {existingReservation.Status}.");
            }

            var timeUntilReservation = existingReservation.ReservationDate - DateTime.UtcNow;

            if (timeUntilReservation.TotalHours < 12)
            {
                throw new NoticePeriodViolationException("Updates require atleast 12 hours notice.");
            }

            await _reservationRepository.UpdateReservationStatusAsync(id, "Cancelled", cancelReservationDto.CancelledReason);
            await _stationService.ReleaseSlotAsync(existingReservation.NodeId);

            var updatedReservation = await _reservationRepository.GetReservationByIdAsync(id);
            return _mapper.MapToDto(updatedReservation);
        }

        // Gets reservation details by ID
        public async Task<ReservationResponseDto> GetReservationByIdAsync(string id)
        {
            var reservation = await _reservationRepository.GetReservationByIdAsync(id);
            if (reservation == null)
            {
                throw new ReservationNotFoundException($"Reservation with id {id} not found.");
            }
            return _mapper.MapToDto(reservation);
        }

        // Returns pending reservations optionally filtered by prosumer NIC
        public async Task<List<ReservationResponseDto>> GetPendingReservationsByProsumerNicAsync(string? nic)
        {
            List<Reservation> reservations;

            if (!string.IsNullOrEmpty(nic))
            {
                reservations = await _reservationRepository.GetReservationsByProsumerNicAsync(nic);
                reservations = reservations.Where(r => r.Status == "Pending").ToList();
            }
            else
            {
                reservations = await _reservationRepository.GetReservationByStatusAsync("Pending");
            }

            return reservations.Select(r => _mapper.MapToDto(r)).ToList();
        }

        // Returns completed and cancelled reservation history records
        public async Task<List<ReservationResponseDto>> GetHistoryByProsumerNicAsync(string? nic)
        {
            List<Reservation> reservations;
            if (!string.IsNullOrEmpty(nic))
            {
                reservations = await _reservationRepository.GetReservationsByProsumerNicAsync(nic);
            }
            else
            {
                reservations = await _reservationRepository.GetAllReservationsAsync();
            }

            var history = reservations.Where(r => r.Status == "Completed" || r.Status == "Cancelled").ToList();
            return history.Select(r => _mapper.MapToDto(r)).ToList();
        }

        // Filters reservations by NIC, status, and date range
        public async Task<List<ReservationResponseDto>> SearchReservationsAsync(string? nic, string? status, DateTime? from, DateTime? to)
        {
            var reservations = await _reservationRepository.GetAllReservationsAsync();

            if (!string.IsNullOrEmpty(nic))
            {
                reservations = reservations.Where(r => r.ProsumerNic == nic).ToList();
            }
            if (!string.IsNullOrEmpty(status))
            {
                reservations = reservations.Where(r => r.Status == status).ToList();
            }
            if (from.HasValue)
            {
                reservations = reservations.Where(r => r.ReservationDate >= from.Value).ToList();
            }
            if (to.HasValue)
            {
                reservations = reservations.Where(r => r.ReservationDate <= to.Value).ToList();
            }
            return reservations.Select(r => _mapper.MapToDto(r)).ToList();
        }

        // Counts upcoming approved reservations
        public async Task<int> GetApprovedFutureCountAsync(string? nic)
        {
            List<Reservation> reservations;

            if (!string.IsNullOrEmpty(nic))
            {
                reservations = await _reservationRepository.GetReservationsByProsumerNicAsync(nic);
            }
            else
            {
                reservations = await _reservationRepository.GetAllReservationsAsync();
            }

            return reservations.Count(r => r.Status == "Approved" && r.ReservationDate > DateTime.UtcNow);
        }

    }
}
