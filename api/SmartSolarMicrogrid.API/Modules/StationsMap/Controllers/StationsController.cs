/*
 * StationsController.cs
 * REST API Controller for solar microgrid station/node endpoints.
 * Provides nearby stations for Google Maps integration,
 * station detail view, and slot availability updates for Grid Operators.
 * Author: Member 4 - Operator Product
 */

using Microsoft.AspNetCore.Mvc;
using SmartSolarMicrogrid.API.Modules.StationsMap.Services;

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

        /// <summary>
        /// PUT /api/stations/{id}/slots
        /// Updates the available battery slot count for a station.
        /// Called by Grid Operators from the web app Slot Availability page.
        /// Body: { "availableSlots": 4 }
        /// </summary>
        [HttpPut("{id}/slots")]
        public async Task<IActionResult> UpdateSlots(string id, [FromBody] UpdateSlotsRequest request)
        {
            try
            {
                // Delegate slot update logic to service layer (FAT service pattern)
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
    }

    // Request body model for slot update
    public class UpdateSlotsRequest
    {
        public int AvailableSlots { get; set; }
    }
}
