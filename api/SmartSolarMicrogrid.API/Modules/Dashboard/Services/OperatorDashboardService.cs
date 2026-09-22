/*
 * OperatorDashboardService.cs
 * Service layer for Grid Operator dashboard and booking monitoring business logic.
 * Queries MongoDB to compute reservation counts and filtered booking lists.
 * FAT service pattern - all logic here, controller only routes.
 * Author: Member 4 - Operator Product
 */

using MongoDB.Driver;
using SmartSolarMicrogrid.API.Data;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;
using SmartSolarMicrogrid.API.Modules.StationsMap.Models;

namespace SmartSolarMicrogrid.API.Modules.Dashboard.Services
{
    public class OperatorDashboardService
    {
        private readonly IMongoCollection<QrTransaction> _reservations;
        private readonly IMongoCollection<SolarStation> _stations;

        // Constructor - inject MongoDB context and get required collections
        public OperatorDashboardService(MongoDbContext context)
        {
            _reservations = context.Database.GetCollection<QrTransaction>("QrTransactions");
            _stations = context.Database.GetCollection<SolarStation>("SolarStations");
        }

        /// <summary>
        /// Calculates all dashboard summary statistics for the Grid Operator.
        /// Returns counts needed for the dashboard stat cards.
        /// </summary>
        public async Task<object> GetDashboardStatsAsync()
        {
            var now = DateTime.UtcNow;

            // Count total reservations in the system
            var totalBookings = await _reservations.CountDocumentsAsync(_ => true);

            // Count pending reservations (awaiting approval)
            var pendingBookings = await _reservations.CountDocumentsAsync(
                r => r.Status == "Pending");

            // Count approved reservations scheduled in the future
            var approvedFutureBookings = await _reservations.CountDocumentsAsync(
                r => r.Status == "Approved" && r.ScheduledTime > now);

            // Count completed (Done) reservations
            var completedBookings = await _reservations.CountDocumentsAsync(
                r => r.Status == "Done");

            // Count available slots across all active stations
            var activeStations = await _stations.Find(s => s.Status == "active").ToListAsync();
            var totalAvailableSlots = activeStations.Sum(s => s.AvailableSlots);
            var activeNodeCount = activeStations.Count;

            // Return dashboard summary object
            return new
            {
                totalBookings,
                pendingBookings,
                approvedBookings = approvedFutureBookings,
                completedBookings,
                availableSlots = totalAvailableSlots,
                activeNodes = activeNodeCount
            };
        }

        /// <summary>
        /// Returns all reservations with optional filtering by status and search term.
        /// Search matches on prosumer ID or node ID (case-insensitive).
        /// </summary>
        public async Task<List<QrTransaction>> GetAllBookingsAsync(string? status, string? search)
        {
            // Start with a filter that matches everything
            var filter = Builders<QrTransaction>.Filter.Empty;

            // Apply status filter if provided and not "all"
            if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
            {
                filter = filter & Builders<QrTransaction>.Filter.Eq(r => r.Status, status);
            }

            // Apply text search filter if provided (searches ProsumerId and NodeId)
            if (!string.IsNullOrEmpty(search))
            {
                var searchFilter = Builders<QrTransaction>.Filter.Or(
                    Builders<QrTransaction>.Filter.Regex(r => r.ProsumerId,
                        new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<QrTransaction>.Filter.Regex(r => r.NodeId,
                        new MongoDB.Bson.BsonRegularExpression(search, "i"))
                );
                filter = filter & searchFilter;
            }

            // Return filtered results sorted newest first
            return await _reservations
                .Find(filter)
                .SortByDescending(r => r.CreatedAt)
                .ToListAsync();
        }
    }
}
