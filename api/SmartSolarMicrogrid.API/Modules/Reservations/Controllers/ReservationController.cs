// ============================================================================
// Module: Smart Solar Microgrid Trading System - C# Web API
/*
 * File: ReservationController.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
// File: ReservationController.cs
// Description: Manages energy slot reservations for Solar Prosumers, enforcing
//              the 7-day schedule window and 12-hour modification/cancellation notice rules.
// ============================================================================

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SmartSolarMicrogrid.API.Modules.Reservations.DTOs;
using SmartSolarMicrogrid.API.Modules.Reservations.Exceptions;
using SmartSolarMicrogrid.API.Modules.Reservations.Services;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Controllers
{
    [Route("api/reservations")]
    [ApiController]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        // Constructor injecting reservation service
        public ReservationController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        /// <summary>
        /// POST /api/reservations - Create a new power trading reservation for a prosumer
        /// Enforces the 7-day maximum advance scheduling window
        /// </summary>
        [HttpPost]
// Handles the CreateReservation operation.
        public async Task<IActionResult> CreateReservation([FromBody] CreateREservationDto createReservationDto)
        {
            try
            {
                var result = await _reservationService.CreateReservationAsync(createReservationDto);
                return CreatedAtAction(nameof(GetReservationById), new { id = result.Id }, result);
            }
            catch (InvalidReservationDateException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (StationUnavailableException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/reservations/{id} - Retrieve details for a specific reservation
        /// </summary>
        [HttpGet("{id}")]
// Handles the GetReservationById operation.
        public async Task<IActionResult> GetReservationById(string id)
        {
            try
            {
                var result = await _reservationService.GetReservationByIdAsync(id);
                return Ok(result);
            }
            catch (ReservationNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// PUT /api/reservations/{id} - Update an existing reservation
        /// Enforces 12-hour minimum notice requirement
        /// </summary>
        [HttpPut("{id}")]
// Handles the UpdateReservation operation.
        public async Task<IActionResult> UpdateReservation(string id, [FromBody] UpdateReservationDto dto)
        {
            try
            {
                var result = await _reservationService.UpdateReservationAsync(id, dto);
                return Ok(result);
            }
            catch (ReservationNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidReservationStatusException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (NoticePeriodViolationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// PUT /api/reservations/{id}/cancel - Cancel a reservation
        /// Enforces 12-hour minimum notice requirement
        /// </summary>
        [HttpPut("{id}/cancel")]
// Handles the CancelReservation operation.
        public async Task<IActionResult> CancelReservation(string id, [FromBody] CancelReservationDto dto)
        {
            try
            {
                var result = await _reservationService.CancelReservationAsync(id, dto);
                return Ok(result);
            }
            catch (ReservationNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidReservationStatusException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (NoticePeriodViolationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/reservations/pending - Fetch pending reservations for a prosumer or system wide
        /// </summary>
        [HttpGet("pending")]
// Handles the GetPending operation.
        public async Task<IActionResult> GetPending([FromQuery] string? nic)
        {
            var result = await _reservationService.GetPendingReservationsByProsumerNicAsync(nic);
            return Ok(result);
        }

        /// <summary>
        /// GET /api/reservations/history - Fetch completed reservation history for a prosumer
        /// </summary>
        [HttpGet("history")]
// Handles the GetHistory operation.
        public async Task<IActionResult> GetHistory([FromQuery] string? nic)
        {
            var result = await _reservationService.GetHistoryByProsumerNicAsync(nic);
            return Ok(result);
        }

        /// <summary>
        /// GET /api/reservations/search - Search reservations by NIC, status, and date range
        /// </summary>
        [HttpGet("search")]
// Handles the Search operation.
        public async Task<IActionResult> Search([FromQuery] string? nic, [FromQuery] string? status, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var result = await _reservationService.SearchReservationsAsync(nic, status, from, to);
            return Ok(result);
        }

        /// <summary>
        /// GET /api/reservations/summary - Get approved future reservation count for mobile dashboard
        /// </summary>
        [HttpGet("summary")]
// Handles the GetSummary operation.
        public async Task<IActionResult> GetSummary([FromQuery] string? nic)
        {
            var count = await _reservationService.GetApprovedFutureCountAsync(nic);
            return Ok(new { approvedFutureCount = count });
        }
    }
}
