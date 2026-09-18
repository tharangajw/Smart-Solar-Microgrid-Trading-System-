using MongoDB.Driver;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Repositories
{
    public class ReservationRepository:IReservationRepository
    {
        //declare the MongoDB collection for reservations
        private readonly IMongoCollection<Reservation> _reservationsCollection;

        //constructor to initialize the MongoDB collection
        public ReservationRepository(IMongoDatabase database)
        {
            _reservationsCollection = database.GetCollection<Reservation>("EnergyReservation");
        }
        //save the reservation to the database
        public async Task<Reservation> CreateAsync(Reservation reservation)
        {
            await _reservationsCollection.InsertOneAsync(reservation);
            return reservation;
        }

        //get reservations by id from the database
        public async Task<Reservation?> GetReservationByIdAsync(string id)
        {
            return await _reservationsCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
        }

        //get all reservations from the database
        public async Task<List<Reservation>> GetAllReservationsAsync()
        {
            return await _reservationsCollection.Find(_ => true).ToListAsync();
        }

        //get reservations by prosumer nic from the database
        public async Task<List<Reservation>> GetReservationsByProsumerNicAsync(string nic)
        {
            return await _reservationsCollection.Find(r => r.ProsumerNic == nic).ToListAsync();
        }

        //get reservations by status from the database
        public async Task<List<Reservation>> GetReservationByStatusAsync(string status)
        {
            return await _reservationsCollection.Find(r => r.Status == status).ToListAsync();
        }

        //update reservation in the database
        public async Task<bool> UpdateReservationAsync(string id, Reservation reservation)
        {
            var result = await _reservationsCollection.ReplaceOneAsync(r => r.Id == id, reservation);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }

        //update reservation status in the database
        public async Task<bool> UpdateReservationStatusAsync(string id, string status, string? reason)
        {
            var update = Builders<Reservation>.Update
                .Set(r => r.Status, status)
                .Set(r => r.UpdatedAt, DateTime.UtcNow);
            if (!string.IsNullOrEmpty(reason))
            {
                update = update.Set(r => r.CancelledReason, reason);
            }
            var result = await _reservationsCollection.UpdateOneAsync(r => r.Id == id, update);
            return result.IsAcknowledged && result.ModifiedCount > 0;
        }
    }
}
