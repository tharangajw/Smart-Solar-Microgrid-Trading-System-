/*
 * OperatorTransactionService.cs
 * Service layer for all Grid Operator business logic in the Smart Solar Microgrid system.
 * Implements the FAT service pattern – all business rules live here, not in the controller.
 * Responsibilities:
 *   – Dashboard statistics aggregation across Reservations and SolarStations collections
 *   – Listing reservations with optional status filter for operator monitoring
 *   – Approving a Reservation and generating a unique QR Code (EnergyReservation record)
 *   – Verifying a scanned QR code and finalising the energy transfer (marking as Done)
 * Author: Member 4 – Operator Product
 */

using MongoDB.Driver;
using SmartSolarMicrogrid.API.Data;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;

namespace SmartSolarMicrogrid.API.Modules.Transactions.Services
{
    public class OperatorTransactionService
    {
        private readonly IMongoCollection<Reservation> _reservations;
        private readonly IMongoCollection<EnergyReservation> _energyReservations;
        private readonly MongoDbContext _context;

        // Constructor – inject MongoDbContext and obtain typed collections
        public OperatorTransactionService(MongoDbContext context)
        {
            _context = context;
            _reservations = context.Reservations;
            _energyReservations = context.EnergyReservations;
        }

        /// <summary>
        /// Aggregates dashboard statistics for the Grid Operator dashboard.
        /// Queries both the Reservations and SolarStations collections to build summary counts.
        /// </summary>
        public async Task<OperatorDashboardStats> GetDashboardStatsAsync()
        {
            // Fetch all reservations for counting
            var allReservations = await _reservations.Find(_ => true).ToListAsync();

            // Count active stations (not inactive)
            var activeStations = await _context.SolarStations
                .CountDocumentsAsync(s => s.Status != "inactive");

            // Count approved reservations scheduled in the future
            var now = DateTime.UtcNow;
            var approvedFutureCount = allReservations
                .Count(r => r.Status == "Approved" && r.ReservationDate > now);

            return new OperatorDashboardStats
            {
                TotalReservations = allReservations.Count,
                PendingCount = allReservations.Count(r => r.Status == "Pending"),
                ApprovedCount = allReservations.Count(r => r.Status == "Approved"),
                CompletedCount = allReservations.Count(r => r.Status == "Completed" || r.Status == "Done"),
                CancelledCount = allReservations.Count(r => r.Status == "Cancelled"),
                ActiveStations = (int)activeStations,
                ApprovedFutureCount = approvedFutureCount
            };
        }

        /// <summary>
        /// Returns all reservations from the database, optionally filtered by status.
        /// Used by the operator Booking Monitoring page to display live reservation data.
        /// </summary>
        /// <param name="status">Optional status filter: Pending | Approved | Completed | Cancelled</param>
        public async Task<List<Reservation>> GetAllReservationsAsync(string? status = null)
        {
            // Apply status filter if provided, otherwise return all
            if (!string.IsNullOrWhiteSpace(status))
            {
                return await _reservations
                    .Find(r => r.Status == status)
                    .SortByDescending(r => r.CreatedAt)
                    .ToListAsync();
            }

            return await _reservations
                .Find(_ => true)
                .SortByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        /// <summary>
        /// Approves a pending reservation and generates a secure QR code transaction record.
        /// Business rules:
        ///   – Reservation must exist and be in Pending status
        ///   – Creates an EnergyReservation with a UUID as the QrCodeId
        ///   – Updates the source Reservation status to Approved
        /// Returns the generated QrCodeId for display/sharing with the prosumer.
        /// </summary>
        /// <param name="reservationId">The MongoDB ObjectId of the Reservation to approve</param>
        public async Task<string> ApproveReservationAsync(string reservationId)
        {
            // Find the reservation to approve
            var reservation = await _reservations
                .Find(r => r.Id == reservationId)
                .FirstOrDefaultAsync();

            if (reservation == null)
                throw new KeyNotFoundException($"Reservation {reservationId} not found.");

            if (reservation.Status != "Pending")
                throw new InvalidOperationException(
                    $"Only Pending reservations can be approved. Current status: {reservation.Status}");

            // Generate a unique QR code identifier (UUID)
            var qrCodeId = Guid.NewGuid().ToString();

            // Create the EnergyReservation document that carries the QR code
            var energyReservation = new EnergyReservation
            {
                ProsumerId = reservation.ProsumerNic,
                NodeId = reservation.NodeId,
                CapacityKWh = 0,          // Capacity tracked at node level
                ScheduledTime = reservation.ReservationDate,
                Status = "Approved",
                QrCodeId = qrCodeId,
                SourceReservationId = reservation.Id,
                CreatedAt = DateTime.UtcNow
            };

            // Persist the EnergyReservation record
            await _energyReservations.InsertOneAsync(energyReservation);

            // Update the source Reservation status to Approved
            var update = Builders<Reservation>.Update
                .Set(r => r.Status, "Approved")
                .Set(r => r.UpdatedAt, DateTime.UtcNow);
            await _reservations.UpdateOneAsync(r => r.Id == reservationId, update);

            return qrCodeId;
        }

        /// <summary>
        /// Verifies a scanned QR code and finalises the energy transfer transaction.
        /// Business rules:
        ///   – EnergyReservation with the given QrCodeId must exist
        ///   – Status must be Approved (not already Done or Cancelled)
        ///   – Sets EnergyReservation status to Done
        ///   – Sets corresponding Reservation status to Completed
        /// </summary>
        /// <param name="qrCodeId">The UUID QR code scanned by the operator</param>
        public async Task<bool> VerifyAndFinalizeTransactionAsync(string qrCodeId)
        {
            // Find the EnergyReservation matching the scanned QR code
            var energyReservation = await _energyReservations
                .Find(r => r.QrCodeId == qrCodeId)
                .FirstOrDefaultAsync();

            if (energyReservation == null)
                throw new KeyNotFoundException("Invalid QR Code. No matching reservation found.");

            if (energyReservation.Status != "Approved")
                throw new InvalidOperationException(
                    $"Cannot finalise reservation. Status must be Approved, current: {energyReservation.Status}");

            // Mark EnergyReservation as Done
            var energyUpdate = Builders<EnergyReservation>.Update
                .Set(r => r.Status, "Done");
            var result = await _energyReservations
                .UpdateOneAsync(r => r.Id == energyReservation.Id, energyUpdate);

            // Also update the parent Reservation to Completed for consistency
            var reservationUpdate = Builders<Reservation>.Update
                .Set(r => r.Status, "Completed")
                .Set(r => r.UpdatedAt, DateTime.UtcNow);
            await _reservations.UpdateOneAsync(
                r => r.Id == energyReservation.SourceReservationId,
                reservationUpdate);

            return result.ModifiedCount > 0;
        }
    }

    // ── DTO returned by GetDashboardStatsAsync ────────────────────────────────

    /// <summary>Aggregated statistics for the Operator Dashboard page.</summary>
    public class OperatorDashboardStats
    {
        public int TotalReservations { get; set; }
        public int PendingCount { get; set; }
        public int ApprovedCount { get; set; }
        public int CompletedCount { get; set; }
        public int CancelledCount { get; set; }
        public int ActiveStations { get; set; }
        public int ApprovedFutureCount { get; set; }
    }
}
