using MongoDB.Driver;
using SmartSolarMicrogrid.API.Data;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Services
{
    public class ReservationService
    {
        private readonly IMongoCollection<EnergyReservation> _reservations;

        public ReservationService(MongoDbContext context)
        {
            _reservations = context.Database.GetCollection<EnergyReservation>("EnergyReservations");
        }

        public async Task<EnergyReservation> CreateReservationAsync(EnergyReservation reservation)
        {
            // Business Rule: must be scheduled within 7 days
            if (reservation.ScheduledTime > DateTime.UtcNow.AddDays(7))
            {
                throw new ArgumentException("Reservation cannot be scheduled more than 7 days in advance.");
            }

            if (reservation.ScheduledTime < DateTime.UtcNow)
            {
                throw new ArgumentException("Reservation cannot be scheduled in the past.");
            }

            reservation.QrCodeId = Guid.NewGuid().ToString();
            reservation.Status = "Pending";
            reservation.CreatedAt = DateTime.UtcNow;

            await _reservations.InsertOneAsync(reservation);
            return reservation;
        }

        public async Task<EnergyReservation?> UpdateReservationAsync(string id, DateTime newScheduledTime, double newCapacity)
        {
            var reservation = await _reservations.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null) return null;

            // Business Rule: at least 12 hours notice required for updates
            if ((reservation.ScheduledTime - DateTime.UtcNow).TotalHours < 12)
            {
                throw new InvalidOperationException("Updates require at least 12 hours notice.");
            }
            
            if (newScheduledTime > DateTime.UtcNow.AddDays(7))
            {
                throw new ArgumentException("Reservation cannot be scheduled more than 7 days in advance.");
            }

            var update = Builders<EnergyReservation>.Update
                .Set(r => r.ScheduledTime, newScheduledTime)
                .Set(r => r.CapacityKWh, newCapacity);

            await _reservations.UpdateOneAsync(r => r.Id == id, update);
            
            reservation.ScheduledTime = newScheduledTime;
            reservation.CapacityKWh = newCapacity;
            
            return reservation;
        }

        public async Task<bool> CancelReservationAsync(string id)
        {
            var reservation = await _reservations.Find(r => r.Id == id).FirstOrDefaultAsync();
            if (reservation == null) return false;

            // Business Rule: at least 12 hours notice required for cancellations
            if ((reservation.ScheduledTime - DateTime.UtcNow).TotalHours < 12)
            {
                throw new InvalidOperationException("Cancellations require at least 12 hours notice.");
            }

            var update = Builders<EnergyReservation>.Update.Set(r => r.Status, "Cancelled");
            var result = await _reservations.UpdateOneAsync(r => r.Id == id, update);
            
            return result.ModifiedCount > 0;
        }

        public async Task<List<EnergyReservation>> GetProsumerReservationsAsync(string prosumerId)
        {
            return await _reservations.Find(r => r.ProsumerId == prosumerId).SortByDescending(r => r.ScheduledTime).ToListAsync();
        }
        
        public async Task<List<EnergyReservation>> GetPendingReservationsAsync()
        {
            return await _reservations.Find(r => r.Status == "Pending").SortByDescending(r => r.ScheduledTime).ToListAsync();
        }
    }
}
