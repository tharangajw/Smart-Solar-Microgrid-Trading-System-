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

        public ReservationController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] CreateREservationDto createReservationDto)
        {
            try
            {
                var result = await _reservationService.CreateReservationAsync(createReservationDto);
                return CreatedAtAction(nameof(GetReservationById), new { id = result.Id }, result);
            }
            catch(InvalidReservationDateException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (StationUnavailableException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
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

        [HttpPut("{id}")]
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

        [HttpPut("{id}/cancel")]
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

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending([FromQuery] string? nic)
        {
            var result = await _reservationService.GetPendingReservationsByProsumerNicAsync(nic);
            return Ok(result);
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] string? nic)
        {
            var result = await _reservationService.GetHistoryByProsumerNicAsync(nic);
            return Ok(result);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? nic, [FromQuery] string? status, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var result = await _reservationService.SearchReservationsAsync(nic, status, from, to);
            return Ok(result);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] string? nic)
        {
            var count = await _reservationService.GetApprovedFutureCountAsync(nic);
            return Ok(new { approvedFutureCount = count });
        }
    }
}
