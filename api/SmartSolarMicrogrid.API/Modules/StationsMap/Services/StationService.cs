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
using Microsoft.AspNetCore.SignalR;
using SmartSolarMicrogrid.API.Modules.StationsMap.Hubs;

namespace SmartSolarMicrogrid.API.Modules.StationsMap.Services
{
    public class StationService
    {
        private readonly IMongoCollection<SolarStation> _stations;
        private readonly IHubContext<StationHub> _hubContext;

        // Constructor - inject MongoDB context and get the SolarStations collection
        public StationService(MongoDbContext context, IHubContext<StationHub> hubContext)
        {
            _stations = context.Database.GetCollection<SolarStation>("SolarStations");
            _hubContext = hubContext;
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
            var updatedStation = await _stations.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (updatedStation != null)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveStationUpdate", updatedStation);
            }
            return updatedStation;
        }

        /// <summary>Atomically reserves one currently available station slot.</summary>
        public async Task<bool> ReserveSlotAsync(string stationId)
        {
            var filter = Builders<SolarStation>.Filter.Eq(s => s.Id, stationId) &
                         Builders<SolarStation>.Filter.Gt(s => s.AvailableSlots, 0) &
                         Builders<SolarStation>.Filter.Ne(s => s.Status, "inactive");
            var result = await _stations.UpdateOneAsync(filter, Builders<SolarStation>.Update.Inc(s => s.AvailableSlots, -1));
            if (result.ModifiedCount == 0) return false;

            var station = await GetStationByIdAsync(stationId);
            if (station?.AvailableSlots == 0)
                await _stations.UpdateOneAsync(s => s.Id == stationId, Builders<SolarStation>.Update.Set(s => s.Status, "full"));
                
            var finalStation = await GetStationByIdAsync(stationId);
            if (finalStation != null)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveStationUpdate", finalStation);
            }
            
            return true;
        }

        /// <summary>Returns a slot when a non-final reservation is cancelled.</summary>
        public async Task ReleaseSlotAsync(string stationId)
        {
            var station = await GetStationByIdAsync(stationId);
            if (station == null || station.Status == "inactive" || station.AvailableSlots >= station.TotalSlots) return;
            await _stations.UpdateOneAsync(s => s.Id == stationId,
                Builders<SolarStation>.Update.Inc(s => s.AvailableSlots, 1).Set(s => s.Status, "active"));
                
            var finalStation = await GetStationByIdAsync(stationId);
            if (finalStation != null)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveStationUpdate", finalStation);
            }
        }

        /// <summary>Creates a new station.</summary>
        public async Task<SolarStation> CreateStationAsync(SolarStation station)
        {
            if (string.IsNullOrEmpty(station.Location))
                station.Location = "Not Specified";
                
            station.TotalSlots = station.AvailableSlots;
            station.Status = station.IsActive ? "active" : "inactive";
            
            await _stations.InsertOneAsync(station);
            return station;
        }

        /// <summary>Updates an existing station.</summary>
        public async Task<SolarStation?> UpdateStationAsync(string id, SolarStation updatedStation)
        {
            var update = Builders<SolarStation>.Update
                .Set(s => s.Name, updatedStation.Name)
                .Set(s => s.Latitude, updatedStation.Latitude)
                .Set(s => s.Longitude, updatedStation.Longitude)
                .Set(s => s.CapacityKw, updatedStation.CapacityKw)
                .Set(s => s.AvailableSlots, updatedStation.AvailableSlots)
                .Set(s => s.Schedule, updatedStation.Schedule)
                .Set(s => s.IsActive, updatedStation.IsActive)
                .Set(s => s.Status, updatedStation.IsActive ? "active" : "inactive");

            await _stations.UpdateOneAsync(s => s.Id == id, update);
            
            var station = await GetStationByIdAsync(id);
            if (station != null)
            {
                await _hubContext.Clients.All.SendAsync("ReceiveStationUpdate", station);
            }
            return station;
        }

        /// <summary>Toggles the active state of a station. Blocks deactivation if active reservations exist.</summary>
        public async Task<SolarStation?> ToggleStationAsync(string id, bool isActive)
        {
            var station = await GetStationByIdAsync(id);
            if (station == null) return null;

            var update = Builders<SolarStation>.Update
                .Set(s => s.IsActive, isActive)
                .Set(s => s.Status, isActive ? "active" : "inactive");

            await _stations.UpdateOneAsync(s => s.Id == id, update);

            var updated = await GetStationByIdAsync(id);
            if (updated != null)
                await _hubContext.Clients.All.SendAsync("ReceiveStationUpdate", updated);

            return updated;
        }

        /// <summary>Deletes a station.</summary>
        public async Task<bool> DeleteStationAsync(string id)
        {
            var result = await _stations.DeleteOneAsync(s => s.Id == id);
            return result.DeletedCount > 0;
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
