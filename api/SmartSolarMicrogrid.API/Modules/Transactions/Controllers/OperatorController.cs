using Microsoft.AspNetCore.Mvc;
using SmartSolarMicrogrid.API.Modules.Transactions.Services;

namespace SmartSolarMicrogrid.API.Modules.Transactions.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OperatorController : ControllerBase
    {
        private readonly OperatorTransactionService _operatorService;

        public OperatorController(OperatorTransactionService operatorService)
        {
            _operatorService = operatorService;
        }

        [HttpPost("scan-qr")]
        public async Task<IActionResult> ScanQrCode([FromBody] ScanQrRequest request)
        {
            try
            {
                var result = await _operatorService.VerifyAndFinalizeTransactionAsync(request.QrCodeId);
                if (result)
                {
                    return Ok(new { message = "Transaction finalized successfully." });
                }
                return BadRequest(new { message = "Failed to finalize transaction." });
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

    public class ScanQrRequest
    {
        public string QrCodeId { get; set; } = null!;
    }
}
