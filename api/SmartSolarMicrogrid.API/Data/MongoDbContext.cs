using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SmartSolarMicrogrid.API.Models;

namespace SmartSolarMicrogrid.API.Data;

/// <summary>
/// Provides a centralized MongoDB database context.
/// Inject this as a singleton to reuse the underlying MongoClient connection pool.
/// </summary>
public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
    }

    /// <summary>
    /// Returns a typed collection reference for the given collection name.
    /// </summary>
    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }

    /// <summary>
    /// Collection getter for SolarStationInfo (Nodes).
    /// </summary>
    public IMongoCollection<SolarStationInfo> SolarStations => GetCollection<SolarStationInfo>("SolarStationInfo");

    /// <summary>
    /// Collection getter for EnergyBookingSlots.
    /// </summary>
    public IMongoCollection<EnergyBookingSlots> EnergyBookingSlots => GetCollection<EnergyBookingSlots>("EnergyBookingSlots");

    /// <summary>
    /// Returns the underlying IMongoDatabase for advanced operations.
    /// </summary>
    public IMongoDatabase Database => _database;
}
