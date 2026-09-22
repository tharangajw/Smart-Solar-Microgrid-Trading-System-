/*
 * StationsController.cs
 * REST API Controller for solar microgrid station/node endpoints.
 * Provides nearby stations for Google Maps integration,
 * station detail view, and slot availability updates for Grid Operators.
 * Author: Member 4 - Operator Product
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SmartSolarMicrogrid.API.Modules.StationsMap.Services;
using SmartSolarMicrogrid.API.Modules.StationsMap.Models;

namespace SmartSolarMicrogrid.API.Modules.StationsMap.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StationsController : ControllerBase
    {
        private readonly StationService _stationService;

        // Constructor - inject StationService
        public StationsController(StationService stationService)
        {
            _stationService = stationService;
        }

        /// <summary>
        /// GET /api/stations/nearby?lat=6.9271&lng=79.8612&radius=50
        /// Returns solar stations within the given radius (km) from the user's GPS location.
        /// Used by mobile app Google Maps to show nearby nodes as markers.
        /// </summary>
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearbyStations(
            [FromQuery] double lat,
            [FromQuery] double lng,
            [FromQuery] double radius = 50)
        {
            // Validate coordinates
            if (lat == 0 && lng == 0)
                return BadRequest(new { message = "Valid latitude and longitude are required." });

            var stations = await _stationService.GetNearbyStationsAsync(lat, lng, radius);
            return Ok(stations);
        }

        /// <summary>
        /// GET /api/stations
        /// Returns all stations. Used for operator web dashboard map overview.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllStations()
        {
            // Return full list of stations
            var stations = await _stationService.GetAllStationsAsync();
            return Ok(stations);
        }

        /// <summary>
        /// GET /api/stations/{id}
        /// Returns detailed info for a single station by ID.
        /// Used when a user taps a map marker to see station details.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStationById(string id)
        {
            // Fetch station by MongoDB ObjectId
            var station = await _stationService.GetStationByIdAsync(id);
            if (station == null)
                return NotFound(new { message = "Station not found." });

            return Ok(station);
        }

        [HttpPut("{id}/slots")]
        [Authorize(Roles = "GridOperator,Backoffice")]
        public async Task<IActionResult> UpdateSlots(string id, [FromBody] UpdateSlotsRequest request)
        {
            try
            {
                var updated = await _stationService.UpdateSlotAvailabilityAsync(id, request.AvailableSlots);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // --- Backoffice Management Endpoints ---

        [HttpPost]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> CreateStation([FromBody] SolarStation station)
        {
            var created = await _stationService.CreateStationAsync(station);
            return Ok(created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> UpdateStation(string id, [FromBody] SolarStation station)
        {
            var updated = await _stationService.UpdateStationAsync(id, station);
            if (updated == null)
                return NotFound(new { message = "Station not found." });
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> DeleteStation(string id)
        {
            var success = await _stationService.DeleteStationAsync(id);
            if (!success)
                return NotFound(new { message = "Station not found." });
            return Ok(new { message = "Station deleted successfully" });
        }

        /// <summary>
        /// PATCH /api/stations/{id}/toggle
        /// Toggles the IsActive status of a station (activate/deactivate).
        /// Blocked by the service layer if active reservations exist.
        /// </summary>
        [HttpPatch("{id}/toggle")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> ToggleStation(string id, [FromBody] ToggleStationRequest request)
        {
            try
            {
                var updated = await _stationService.ToggleStationAsync(id, request.IsActive);
                if (updated == null)
                    return NotFound(new { message = "Station not found." });
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // Request body model for slot update
    public class UpdateSlotsRequest
    {
        public int AvailableSlots { get; set; }
    }

    public class ToggleStationRequest
    {
        public bool IsActive { get; set; }
    }
}
