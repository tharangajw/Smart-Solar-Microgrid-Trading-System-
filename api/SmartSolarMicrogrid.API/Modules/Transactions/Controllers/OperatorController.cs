/*
 * OperatorController.cs
 * REST API controller for all Grid Operator endpoints.
 * Provides dashboard statistics, reservation listing/approval,
 * and QR code scanning/verification for energy transfer finalisation.
 * Follows the FAT service pattern – controller is thin, all logic is in OperatorTransactionService.
 * Author: Member 4 – Operator Product
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SmartSolarMicrogrid.API.Modules.Transactions.Services;

namespace SmartSolarMicrogrid.API.Modules.Transactions.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "GridOperator")]
    public class OperatorController : ControllerBase
    {
        private readonly OperatorTransactionService _operatorService;

        // Constructor – inject the operator transaction service
        public OperatorController(OperatorTransactionService operatorService)
        {
            _operatorService = operatorService;
        }

        /// <summary>
        /// GET /api/operator/dashboard
        /// Returns aggregated statistics for the Operator Dashboard:
        /// total/pending/approved/completed reservation counts, active stations, future approved count.
        /// </summary>
        [HttpGet("dashboard")]
// Handles the GetDashboard operation.
        public async Task<IActionResult> GetDashboard()
        {
            // Delegate to service for statistics aggregation
            var stats = await _operatorService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        /// <summary>
        /// GET /api/operator/reservations?status=Pending
        /// Returns all reservations, optionally filtered by status.
        /// Used by the operator Booking Monitoring page for live data.
        /// </summary>
        [HttpGet("reservations")]
// Handles the GetReservations operation.
        public async Task<IActionResult> GetReservations([FromQuery] string? status, [FromQuery] string? nic, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            // Fetch live reservations from the service layer
            var reservations = await _operatorService.GetAllReservationsAsync(status, nic, from, to);
            return Ok(reservations);
        }

        /// <summary>
        /// POST /api/operator/approve/{reservationId}
        /// Approves a Pending reservation and generates a QR code (QrTransaction).
        /// Returns the unique QrCodeId to be displayed to the prosumer.
        /// Body: none required – reservationId is in the route.
        /// </summary>
        [HttpPost("approve/{reservationId}")]
// Handles the ApproveReservation operation.
        public async Task<IActionResult> ApproveReservation(string reservationId)
        {
            try
            {
                // Business logic: approve + create QR in service
                var qrCodeId = await _operatorService.ApproveReservationAsync(reservationId);
                return Ok(new
                {
                    message = "Reservation approved successfully.",
                    qrCodeId = qrCodeId
                });
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

        /// <summary>
        /// POST /api/operator/scan-qr
        /// Verifies a scanned QR code and finalises the energy transfer transaction.
        /// The operator scans the prosumer's QR code; this marks the QrTransaction as Done.
        /// Body: { "qrCodeId": "uuid-string" }
        /// </summary>
        [HttpPost("scan-qr")]
// Handles the ScanQrCode operation.
        public async Task<IActionResult> ScanQrCode([FromBody] ScanQrRequest request)
        {
            try
            {
                // Verify QR code and mark transaction complete in service
                var result = await _operatorService.VerifyAndFinalizeTransactionAsync(request.QrCodeId);
                if (result)
                    return Ok(new { message = "Energy transfer finalised successfully. Transaction marked as Done." });

                return BadRequest(new { message = "Failed to finalise transaction. Please try again." });
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

    // ── Request body model ────────────────────────────────────────────────────

    /// <summary>Request body for the scan-qr endpoint.</summary>
    public class ScanQrRequest
    {
        public string QrCodeId { get; set; } = null!;
    }
}
