/*
 * OperatorTransactionService.cs
 * Service layer for all Grid Operator business logic in the Smart Solar Microgrid system.
 * Implements the FAT service pattern – all business rules live here, not in the controller.
 * Responsibilities:
 *   – Dashboard statistics aggregation across Reservations and SolarStations collections
 *   – Listing reservations with optional status filter for operator monitoring
 *   – Approving a Reservation and generating a unique QR Code (QrTransaction record)
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
        private readonly IMongoCollection<QrTransaction> _qrTransactions;
        private readonly MongoDbContext _context;

        // Constructor – inject MongoDbContext and obtain typed collections
        public OperatorTransactionService(MongoDbContext context)
        {
            _context = context;
            _reservations = context.Reservations;
            _qrTransactions = context.QrTransactions;
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
        ///   – Creates an QrTransaction with a UUID as the QrCodeId
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

            // Create the QrTransaction document that carries the QR code
            var qrTransaction = new QrTransaction
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

            // Persist the QrTransaction record
            await _qrTransactions.InsertOneAsync(qrTransaction);

            // Update the source Reservation status to Approved
            var update = Builders<Reservation>.Update
                .Set(r => r.Status, "Approved")
                .Set(r => r.QrCodeId, qrCodeId)
                .Set(r => r.UpdatedAt, DateTime.UtcNow);
            await _reservations.UpdateOneAsync(r => r.Id == reservationId, update);

            return qrCodeId;
        }

        /// <summary>
        /// Verifies a scanned QR code and finalises the energy transfer transaction.
        /// Business rules:
        ///   – QrTransaction with the given QrCodeId or SourceReservationId must exist
        ///   – Status must be Approved (not already Done or Cancelled)
        ///   – Sets QrTransaction status to Done
        ///   – Sets corresponding Reservation status to Completed
        /// </summary>
        /// <param name="qrCodeId">The UUID QR code or Reservation ID scanned by the operator</param>
        public async Task<bool> VerifyAndFinalizeTransactionAsync(string qrCodeId)
        {
            var cleanId = qrCodeId?.Trim().Replace("QR_", "").Replace("qr_", "") ?? "";

            // Find the QrTransaction matching the scanned QR code or source reservation ID
            var qrTransaction = await _qrTransactions
                .Find(r => r.QrCodeId == cleanId || r.SourceReservationId == cleanId || r.QrCodeId == qrCodeId)
                .FirstOrDefaultAsync();

            // If not found in QrTransactions, check if Reservation exists and is Approved
            if (qrTransaction == null)
            {
                var reservation = await _reservations
                    .Find(r => r.Id == cleanId || r.QrCodeId == cleanId)
                    .FirstOrDefaultAsync();

                if (reservation != null && reservation.Status == "Approved")
                {
                    qrTransaction = new QrTransaction
                    {
                        ProsumerId = reservation.ProsumerNic,
                        NodeId = reservation.NodeId,
                        CapacityKWh = 0,
                        ScheduledTime = reservation.ReservationDate,
                        Status = "Approved",
                        QrCodeId = string.IsNullOrEmpty(reservation.QrCodeId) ? cleanId : reservation.QrCodeId,
                        SourceReservationId = reservation.Id,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _qrTransactions.InsertOneAsync(qrTransaction);
                }
            }

            if (qrTransaction == null)
                throw new KeyNotFoundException("Invalid QR Code. No matching reservation found.");

            if (qrTransaction.Status != "Approved")
                throw new InvalidOperationException(
                    $"Cannot finalise reservation. Status must be Approved, current: {qrTransaction.Status}");

            // Update only an Approved transaction. The status predicate makes the
            // completion idempotent-safe when two operators scan the same QR.
            var energyUpdate = Builders<QrTransaction>.Update
                .Set(r => r.Status, "Done");
            var result = await _qrTransactions
                .UpdateOneAsync(r => r.Id == qrTransaction.Id && r.Status == "Approved", energyUpdate);

            if (result.ModifiedCount == 0)
                throw new InvalidOperationException("This transaction was already completed or is no longer approved.");

            // Also update the parent Reservation to Completed for consistency
            var reservationUpdate = Builders<Reservation>.Update
                .Set(r => r.Status, "Completed")
                .Set(r => r.UpdatedAt, DateTime.UtcNow);
            await _reservations.UpdateOneAsync(
                r => r.Id == qrTransaction.SourceReservationId,
                reservationUpdate);

            return true;
        }

        /// <summary>
        /// Reads the server-side transaction and its source reservation without
        /// changing state. Operators use this as the verification step before
        /// confirming the physical energy transfer.
        /// </summary>
        public async Task<VerifiedTransaction?> GetVerifiedTransactionAsync(string qrCodeId)
        {
            var cleanId = qrCodeId?.Trim().Replace("QR_", "").Replace("qr_", "") ?? "";

            var transaction = await _qrTransactions
                .Find(t => t.QrCodeId == cleanId || t.SourceReservationId == cleanId || t.QrCodeId == qrCodeId)
                .FirstOrDefaultAsync();

            if (transaction == null)
            {
                var res = await _reservations
                    .Find(r => r.Id == cleanId || r.QrCodeId == cleanId)
                    .FirstOrDefaultAsync();

                if (res != null)
                {
                    transaction = new QrTransaction
                    {
                        ProsumerId = res.ProsumerNic,
                        NodeId = res.NodeId,
                        CapacityKWh = 0,
                        ScheduledTime = res.ReservationDate,
                        Status = res.Status,
                        QrCodeId = string.IsNullOrEmpty(res.QrCodeId) ? cleanId : res.QrCodeId,
                        SourceReservationId = res.Id,
                        CreatedAt = res.CreatedAt
                    };
                    return new VerifiedTransaction
                    {
                        Transaction = transaction,
                        Reservation = res
                    };
                }
                return null;
            }

            var reservation = await _reservations
                .Find(r => r.Id == transaction.SourceReservationId)
                .FirstOrDefaultAsync();

            return new VerifiedTransaction
            {
                Transaction = transaction,
                Reservation = reservation
            };
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

    public class VerifiedTransaction
    {
        public QrTransaction Transaction { get; set; } = null!;
        public Reservation? Reservation { get; set; }
    }
}
