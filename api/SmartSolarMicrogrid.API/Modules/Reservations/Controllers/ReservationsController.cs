using Microsoft.AspNetCore.Mvc;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;
using SmartSolarMicrogrid.API.Modules.Reservations.Services;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly ReservationService _reservationService;

        public ReservationsController(ReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] EnergyReservation reservation)
        {
            try
            {
                var created = await _reservationService.CreateReservationAsync(reservation);
                return CreatedAtAction(nameof(GetProsumerReservations), new { prosumerId = created.ProsumerId }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReservation(string id, [FromBody] UpdateReservationRequest request)
        {
            try
            {
                var updated = await _reservationService.UpdateReservationAsync(id, request.ScheduledTime, request.CapacityKWh);
                if (updated == null)
                {
                    return NotFound(new { message = "Reservation not found." });
                }
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelReservation(string id)
        {
            try
            {
                var result = await _reservationService.CancelReservationAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Reservation not found." });
                }
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("prosumer/{prosumerId}")]
        public async Task<IActionResult> GetProsumerReservations(string prosumerId)
        {
            var reservations = await _reservationService.GetProsumerReservationsAsync(prosumerId);
            return Ok(reservations);
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingReservations()
        {
            var reservations = await _reservationService.GetPendingReservationsAsync();
            return Ok(reservations);
        }
    }

    public class UpdateReservationRequest
    {
        public DateTime ScheduledTime { get; set; }
        public double CapacityKWh { get; set; }
    }
}
