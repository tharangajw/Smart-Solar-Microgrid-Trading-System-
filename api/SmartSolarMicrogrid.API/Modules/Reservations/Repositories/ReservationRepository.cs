using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using SmartSolarMicrogrid.API.Data;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;

namespace SmartSolarMicrogrid.API.Modules.Reservations.Repositories;

public class ReservationRepository : IReservationRepository
{
    private readonly IMongoCollection<Reservation> _reservations;

    public ReservationRepository(MongoDbContext dbContext)
    {
        _reservations = dbContext.GetCollection<Reservation>("Reservations");
    }

    public async Task<Reservation> CreateAsync(Reservation reservation)
    {
        await _reservations.InsertOneAsync(reservation);
        return reservation;
    }

    public async Task<Reservation?> GetByIdAsync(string id)
    {
        return await _reservations.Find(r => r.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Reservation>> GetAllAsync()
    {
        return await _reservations.Find(_ => true).ToListAsync();
    }

    public async Task<List<Reservation>> GetByProsumerNicAsync(string prosumerNic)
    {
        return await _reservations.Find(r => r.ProsumerNic == prosumerNic).ToListAsync();
    }

    public async Task<List<Reservation>> GetByStatusAsync(string status)
    {
        return await _reservations.Find(r => r.Status == status).ToListAsync();
    }

    public async Task<bool> UpdateAsync(Reservation reservation)
    {
        var result = await _reservations.ReplaceOneAsync(r => r.Id == reservation.Id, reservation);
        return result.IsAcknowledged && result.ModifiedCount > 0;
    }

    public async Task<bool> UpdateStatusAsync(string id, string status, string? cancelledReason = null)
    {
        var update = Builders<Reservation>.Update
            .Set(r => r.Status, status)
            .Set(r => r.UpdatedAt, System.DateTime.UtcNow);

        if (cancelledReason != null)
        {
            update = update.Set(r => r.CancelledReason, cancelledReason);
        }

        var result = await _reservations.UpdateOneAsync(r => r.Id == id, update);
        return result.IsAcknowledged && result.ModifiedCount > 0;
    }
}
