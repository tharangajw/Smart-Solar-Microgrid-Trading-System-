/*
 * StationService.cs
 * Service layer for all solar station / microgrid node business logic.
 * Handles nearby station queries using Haversine distance formula,
 * station detail retrieval, and slot availability updates.
 * Author: Member 4 - Operator Product
 */

using MongoDB.Driver;
using SmartSolarMicrogrid.API.Data;
using SmartSolarMicrogrid.API.Modules.StationsMap.Models;

namespace SmartSolarMicrogrid.API.Modules.StationsMap.Services
{
    public class StationService
    {
        private readonly IMongoCollection<SolarStation> _stations;

        // Constructor - inject MongoDB context and get the SolarStations collection
        public StationService(MongoDbContext context)
        {
            _stations = context.Database.GetCollection<SolarStation>("SolarStations");
        }

        /// <summary>
        /// Returns all active stations within a given radius (km) from a GPS coordinate.
        /// Uses the Haversine formula to calculate distance between two lat/lng points.
        /// </summary>
        public async Task<List<SolarStation>> GetNearbyStationsAsync(double latitude, double longitude, double radiusKm = 50)
        {
            // Fetch all active stations from MongoDB
            var allStations = await _stations
                .Find(s => s.Status != "inactive")
                .ToListAsync();

            // Filter stations by distance using Haversine formula
            var nearbyStations = allStations
                .Where(s => CalculateDistanceKm(latitude, longitude, s.Latitude, s.Longitude) <= radiusKm)
                .OrderBy(s => CalculateDistanceKm(latitude, longitude, s.Latitude, s.Longitude))
                .ToList();

            return nearbyStations;
        }

        /// <summary>
        /// Returns all stations (for admin/full map view).
        /// </summary>
        public async Task<List<SolarStation>> GetAllStationsAsync()
        {
            // Return all stations sorted by name
            return await _stations.Find(_ => true).SortBy(s => s.Name).ToListAsync();
        }

        /// <summary>
        /// Returns details of a single station by its MongoDB ID.
        /// </summary>
        public async Task<SolarStation?> GetStationByIdAsync(string id)
        {
            // Find station matching the given ID
            return await _stations.Find(s => s.Id == id).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Updates the available slot count for a specific station.
        /// Called by Grid Operators to update battery slot availability.
        /// </summary>
        public async Task<SolarStation?> UpdateSlotAvailabilityAsync(string id, int availableSlots)
        {
            // Validate slot count is within bounds
            var station = await _stations.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (station == null)
                throw new KeyNotFoundException("Station not found.");

            if (availableSlots < 0 || availableSlots > station.TotalSlots)
                throw new ArgumentException($"Available slots must be between 0 and {station.TotalSlots}.");

            // Determine new status based on availability
            var newStatus = availableSlots == 0 ? "full" : "active";

            // Build and apply update
            var update = Builders<SolarStation>.Update
                .Set(s => s.AvailableSlots, availableSlots)
                .Set(s => s.Status, newStatus);

            await _stations.UpdateOneAsync(s => s.Id == id, update);

            // Return updated station
            return await _stations.Find(s => s.Id == id).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Haversine formula to calculate distance in km between two GPS coordinates.
        /// Reference: https://en.wikipedia.org/wiki/Haversine_formula
        /// </summary>
        private static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
        {
            const double EarthRadiusKm = 6371.0;

            // Convert degrees to radians
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return EarthRadiusKm * c;
        }

        // Convert degrees to radians helper
        private static double ToRadians(double degrees) => degrees * (Math.PI / 180.0);
    }
}
