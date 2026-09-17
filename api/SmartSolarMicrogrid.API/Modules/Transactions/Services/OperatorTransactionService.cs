using MongoDB.Driver;
using SmartSolarMicrogrid.API.Data;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;

namespace SmartSolarMicrogrid.API.Modules.Transactions.Services
{
    public class OperatorTransactionService
    {
        private readonly IMongoCollection<EnergyReservation> _reservations;

        public OperatorTransactionService(MongoDbContext context)
        {
            _reservations = context.Database.GetCollection<EnergyReservation>("EnergyReservations");
        }

        public async Task<bool> VerifyAndFinalizeTransactionAsync(string qrCodeId)
        {
            // Grid Operator scans QR code to verify and finalize
            var reservation = await _reservations.Find(r => r.QrCodeId == qrCodeId).FirstOrDefaultAsync();

            if (reservation == null)
            {
                throw new KeyNotFoundException("Invalid QR Code.");
            }

            if (reservation.Status != "Approved")
            {
                throw new InvalidOperationException($"Cannot finalize reservation with status: {reservation.Status}. Status must be Approved.");
            }

            // Update status to Done
            var update = Builders<EnergyReservation>.Update.Set(r => r.Status, "Done");
            var result = await _reservations.UpdateOneAsync(r => r.Id == reservation.Id, update);
            
            // Note: Update battery slot availability on the microgrid node would happen here
            // via a MicrogridNodeService.

            return result.ModifiedCount > 0;
        }
    }
}
