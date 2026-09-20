// ============================================================================
// Module: Smart Solar Microgrid Trading System - C# Web API
// File: SlotsController.cs
// Description: Manages battery energy booking slots including creation, time overlap
//              prevention, node totalSlots validation, and status lifecycle state updates.
// ============================================================================

using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SmartSolarMicrogrid.API.Data;
using SmartSolarMicrogrid.API.Models;

namespace SmartSolarMicrogrid.API.Modules.EnergySlots.Controllers
{
    // DTO for status update payload
    public class SlotStatusUpdateDto
    {
        public string Status { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/slots")]
    public class SlotsController : ControllerBase
    {
        private readonly MongoDbContext _context;

        // Constructor injecting database context
        public SlotsController(MongoDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// POST /api/slots - Create a battery energy slot for a node
        /// Validates node status, totalSlots range, and time overlap collisions
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateSlot([FromBody] EnergyBookingSlots slot)
        {
            // Validate incoming payload
            if (slot == null || string.IsNullOrWhiteSpace(slot.NodeId))
            {
                return BadRequest(new { error = "Invalid slot payload: nodeId is required" });
            }

            if (slot.StartTime >= slot.EndTime)
            {
                return BadRequest(new { error = "startTime must be earlier than endTime" });
            }

            // 1. Verify Node exists and is ACTIVE
            var node = await _context.SolarStations.Find(x => x.Id == slot.NodeId).FirstOrDefaultAsync();
            if (node == null)
            {
                return NotFound(new { error = $"Node with ID '{slot.NodeId}' not found" });
            }

            if (string.Equals(node.Status, "INACTIVE", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { error = "Cannot create slot for an INACTIVE node" });
            }

            // 2. Validate slotNumber against node totalSlots capacity
            if (node.Battery != null && node.Battery.TotalSlots > 0)
            {
                if (slot.SlotNumber < 1 || slot.SlotNumber > node.Battery.TotalSlots)
                {
                    return BadRequest(new
                    {
                        error = $"slotNumber ({slot.SlotNumber}) exceeds node totalSlots range (1-{node.Battery.TotalSlots})"
                    });
                }
            }

            // 3. Prevent time overlap collision for the same node & battery slot
            var filterBuilder = Builders<EnergyBookingSlots>.Filter;
            var overlapFilter = filterBuilder.Eq(x => x.NodeId, slot.NodeId) &
                                filterBuilder.Eq(x => x.SlotNumber, slot.SlotNumber) &
                                filterBuilder.Ne(x => x.Status, "CANCELLED") &
                                filterBuilder.Lt(x => x.StartTime, slot.EndTime) &
                                filterBuilder.Gt(x => x.EndTime, slot.StartTime);

            var existingOverlap = await _context.EnergyBookingSlots.Find(overlapFilter).FirstOrDefaultAsync();
            if (existingOverlap != null)
            {
                return Conflict(new
                {
                    error = "Slot time overlaps with an existing booking slot",
                    conflictingSlotId = existingOverlap.Id
                });
            }

            // Save slot record to MongoDB
            slot.Id = null;
            slot.Status = string.IsNullOrWhiteSpace(slot.Status) ? "AVAILABLE" : slot.Status.ToUpper();
            slot.CreatedAt = DateTime.UtcNow;
            slot.UpdatedAt = DateTime.UtcNow;

            await _context.EnergyBookingSlots.InsertOneAsync(slot);

            return CreatedAtAction(nameof(GetSlotById), new { id = slot.Id }, slot);
        }

        /// <summary>
        /// GET /api/slots - Query energy slots with optional filters (nodeId, status, available)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetSlots(
            [FromQuery] string? nodeId,
            [FromQuery] string? status,
            [FromQuery] bool? available)
        {
            var filterBuilder = Builders<EnergyBookingSlots>.Filter;
            var filter = filterBuilder.Empty;

            if (!string.IsNullOrWhiteSpace(nodeId))
            {
                filter &= filterBuilder.Eq(x => x.NodeId, nodeId);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                filter &= filterBuilder.Eq(x => x.Status, status.ToUpper());
            }

            if (available == true)
            {
                var now = DateTime.UtcNow;
                filter &= filterBuilder.Eq(x => x.Status, "AVAILABLE") &
                          filterBuilder.Gte(x => x.StartTime, now);
            }

            var slots = await _context.EnergyBookingSlots.Find(filter).ToListAsync();
            return Ok(slots);
        }

        /// <summary>
        /// GET /api/slots/{id} - Get single battery slot details
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSlotById(string id)
        {
            var slot = await _context.EnergyBookingSlots.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (slot == null)
            {
                return NotFound(new { error = "Slot not found" });
            }

            return Ok(slot);
        }

        /// <summary>
        /// PUT /api/slots/{id} - Update energy slot lifecycle status
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSlotStatus(string id, [FromBody] SlotStatusUpdateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
            {
                return BadRequest(new { error = "Status is required" });
            }

            var slot = await _context.EnergyBookingSlots.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (slot == null)
            {
                return NotFound(new { error = "Slot not found" });
            }

            string newStatus = dto.Status.ToUpper();
            var update = Builders<EnergyBookingSlots>.Update
                .Set(x => x.Status, newStatus)
                .Set(x => x.UpdatedAt, DateTime.UtcNow);

            await _context.EnergyBookingSlots.UpdateOneAsync(x => x.Id == id, update);

            slot.Status = newStatus;
            slot.UpdatedAt = DateTime.UtcNow;

            return Ok(slot);
        }
    }
}
