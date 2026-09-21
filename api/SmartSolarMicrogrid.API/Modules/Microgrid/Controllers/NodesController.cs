// ============================================================================
// Module: Smart Solar Microgrid Trading System - C# Web API
// File: NodesController.cs
// Description: Handles Microgrid Solar Station Nodes management including CRUD,
//              Haversine GPS distance filtering, and active reservation deactivation checks.
// ============================================================================

using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SmartSolarMicrogrid.API.Data;
using SmartSolarMicrogrid.API.Models;

namespace SmartSolarMicrogrid.API.Modules.Microgrid.Controllers
{
    [ApiController]
    [Route("api/nodes")]
    public class NodesController : ControllerBase
    {
        private readonly MongoDbContext _context;

        // Constructor initializing database context
        public NodesController(MongoDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// POST /api/nodes - Create a new solar microgrid station node
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateNode([FromBody] SolarStationInfo node)
        {
            // Validate payload
            if (node == null)
            {
                return BadRequest(new { message = "Invalid node payload" });
            }

            // Assign default metadata and generate ObjectId
            node.Id = null;
            node.Status = string.IsNullOrWhiteSpace(node.Status) ? "ACTIVE" : node.Status;
            node.CreatedAt = DateTime.UtcNow;
            node.UpdatedAt = DateTime.UtcNow;

            // Insert into MongoDB collection
            await _context.SolarStations.InsertOneAsync(node);

            return CreatedAtAction(nameof(GetNodeById), new { id = node.Id }, node);
        }

        /// <summary>
        /// GET /api/nodes - List all nodes with status and near-me GPS radius filtering options
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNodes(
            [FromQuery] string? status,
            [FromQuery] bool? nearMe,
            [FromQuery] double? lat,
            [FromQuery] double? lng,
            [FromQuery] double? radiusKm)
        {
            // Build query filter
            var filterBuilder = Builders<SolarStationInfo>.Filter;
            var filter = filterBuilder.Empty;

            if (!string.IsNullOrWhiteSpace(status))
            {
                filter &= filterBuilder.Eq(x => x.Status, status.ToUpper());
            }

            // Fetch nodes from MongoDB
            var nodes = await _context.SolarStations.Find(filter).ToListAsync();

            // Perform Haversine distance filtering if nearMe requested
            if (nearMe == true && lat.HasValue && lng.HasValue)
            {
                double maxRadius = radiusKm ?? 50.0;
                var nodesWithDistance = nodes
                    .Select(n => new
                    {
                        Node = n,
                        DistanceKm = CalculateDistanceKm(lat.Value, lng.Value, n.Gps.Lat, n.Gps.Lng)
                    })
                    .Where(x => x.DistanceKm <= maxRadius)
                    .OrderBy(x => x.DistanceKm)
                    .Select(x => x.Node)
                    .ToList();

                return Ok(nodesWithDistance);
            }

            return Ok(nodes);
        }

        /// <summary>
        /// GET /api/nodes/{id} - Retrieve single station node details
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNodeById(string id)
        {
            var node = await _context.SolarStations.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (node == null)
            {
                return NotFound(new { message = "Node not found" });
            }

            return Ok(node);
        }

        /// <summary>
        /// PUT /api/nodes/{id} - Edit existing node configuration and operational schedule
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNode(string id, [FromBody] SolarStationInfo nodeUpdate)
        {
            var existingNode = await _context.SolarStations.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (existingNode == null)
            {
                return NotFound(new { message = "Node not found" });
            }

            // Apply updates
            existingNode.Name = string.IsNullOrWhiteSpace(nodeUpdate.Name) ? existingNode.Name : nodeUpdate.Name;
            existingNode.Code = string.IsNullOrWhiteSpace(nodeUpdate.Code) ? existingNode.Code : nodeUpdate.Code;
            if (nodeUpdate.Gps != null) existingNode.Gps = nodeUpdate.Gps;
            if (nodeUpdate.CapacityKW > 0) existingNode.CapacityKW = nodeUpdate.CapacityKW;
            if (nodeUpdate.Battery != null) existingNode.Battery = nodeUpdate.Battery;
            if (nodeUpdate.OperationalSchedule != null && nodeUpdate.OperationalSchedule.Count > 0)
            {
                existingNode.OperationalSchedule = nodeUpdate.OperationalSchedule;
            }
            existingNode.UpdatedAt = DateTime.UtcNow;

            await _context.SolarStations.ReplaceOneAsync(x => x.Id == id, existingNode);

            return Ok(existingNode);
        }

        /// <summary>
        /// DELETE /api/nodes/{id} - Deactivate node enforcing active reservation business rules
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeactivateNode(string id)
        {
            var node = await _context.SolarStations.Find(x => x.Id == id).FirstOrDefaultAsync();
            if (node == null)
            {
                return NotFound(new { message = "Node not found" });
            }

            // Check if active energy slot reservations exist
            var now = DateTime.UtcNow;
            var filterBuilder = Builders<EnergyBookingSlots>.Filter;
            var activeReservationsFilter = filterBuilder.Eq(x => x.NodeId, id) &
                                            filterBuilder.In(x => x.Status, new[] { "RESERVED", "BOOKED" }) &
                                            filterBuilder.Gt(x => x.EndTime, now);

            long activeCount = await _context.EnergyBookingSlots.CountDocumentsAsync(activeReservationsFilter);

            // Block deactivation if active reservations present
            if (activeCount > 0)
            {
                return Conflict(new
                {
                    error = "Cannot deactivate node: active reservations exist",
                    activeReservationCount = activeCount
                });
            }

            // Perform soft deactivation
            var update = Builders<SolarStationInfo>.Update
                .Set(x => x.Status, "INACTIVE")
                .Set(x => x.UpdatedAt, DateTime.UtcNow);

            await _context.SolarStations.UpdateOneAsync(x => x.Id == id, update);

            node.Status = "INACTIVE";
            node.UpdatedAt = DateTime.UtcNow;

            return Ok(node);
        }

        // Helper method calculating distance between coordinates using Haversine formula
        private static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
        {
            const double r = 6371.0;
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return r * c;
        }

        // Convert degrees to radians
        private static double ToRadians(double deg) => deg * (Math.PI / 180.0);
    }
}
