using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSolarMicrogrid.API.Modules.Transactions.Services;

namespace SmartSolarMicrogrid.API.Modules.Transactions.Controllers
{
    [ApiController]
    [Route("api/backoffice/reservations")]
    [Authorize(Roles = "Backoffice")]
    public class BackofficeReservationController : ControllerBase
    {
        private readonly OperatorTransactionService _operatorService;

        public BackofficeReservationController(OperatorTransactionService operatorService)
        {
            _operatorService = operatorService;
        }

        [HttpPost("{reservationId}/approve")]
        public async Task<IActionResult> ApproveReservation(string reservationId)
        {
            try
            {
                var qrCodeId = await _operatorService.ApproveReservationAsync(reservationId);
                return Ok(new { message = "Reservation approved successfully.", qrCodeId });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
