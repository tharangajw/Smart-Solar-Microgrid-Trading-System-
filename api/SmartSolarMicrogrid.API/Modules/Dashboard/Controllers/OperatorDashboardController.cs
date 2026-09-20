/*
 * OperatorDashboardController.cs
 * REST API Controller providing dashboard summary statistics for the Grid Operator.
 * Returns pending reservation count and approved future reservation count
 * as required by the assignment marking scheme (Booking Views - 10 marks).
 * Author: Member 4 - Operator Product
 */

using Microsoft.AspNetCore.Mvc;
using SmartSolarMicrogrid.API.Modules.Dashboard.Services;

namespace SmartSolarMicrogrid.API.Modules.Dashboard.Controllers
{
    [ApiController]
    [Route("api/operator-dashboard")]
    public class OperatorDashboardController : ControllerBase
    {
        private readonly OperatorDashboardService _dashboardService;

        // Constructor - inject OperatorDashboardService
        public OperatorDashboardController(OperatorDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// GET /api/operator/dashboard
        /// Returns dashboard summary statistics for the Grid Operator web app.
        /// Includes: total bookings, pending count, approved count, available slots, active nodes.
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            // Fetch all dashboard stats from service layer
            var stats = await _dashboardService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        /// <summary>
        /// GET /api/operator/bookings?status=pending&search=Node A
        /// Returns all reservations with optional filtering by status and search term.
        /// Used by the Booking Monitoring page in the web app.
        /// </summary>
        [HttpGet("bookings")]
        public async Task<IActionResult> GetAllBookings(
            [FromQuery] string? status = null,
            [FromQuery] string? search = null)
        {
            // Fetch filtered bookings from service layer
            var bookings = await _dashboardService.GetAllBookingsAsync(status, search);
            return Ok(bookings);
        }
    }
}
