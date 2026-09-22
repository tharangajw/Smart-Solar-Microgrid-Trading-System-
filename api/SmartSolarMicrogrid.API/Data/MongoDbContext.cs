/*
 * MongoDbContext.cs
 * Centralized MongoDB database context for the Smart Solar Microgrid API.
 * Provides typed collection accessors and the raw IMongoDatabase for all modules.
 * Registered as a singleton so the MongoClient connection pool is reused.
 * Author: Smart Solar Microgrid Team
 */

using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SmartSolarMicrogrid.API.Models;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;
using SmartSolarMicrogrid.API.Modules.StationsMap.Models;
using SmartSolarMicrogrid.API.Modules.Users.Models;

namespace SmartSolarMicrogrid.API.Data;

/// <summary>
/// Centralized MongoDB database context maintaining MongoClient connection pool.
/// </summary>
public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    // Constructor – initialise MongoClient using connection settings from appsettings.json
    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
    }

    // ── Collection Accessors ──────────────────────────────────────────────

    /// <summary>Users collection (Backoffice, GridOperator, Prosumer).</summary>
    public IMongoCollection<User> Users =>
        _database.GetCollection<User>("Users");

    /// <summary>Main energy slot reservations created by prosumers.</summary>
    public IMongoCollection<Reservation> Reservations =>
        _database.GetCollection<Reservation>("EnergyReservation");

    /// <summary>Approved energy reservations that carry a QR code for operator scanning.</summary>
    public IMongoCollection<QrTransaction> QrTransactions =>
        _database.GetCollection<QrTransaction>("QrTransactions");

    /// <summary>Solar microgrid station/node records with GPS locations.</summary>
    public IMongoCollection<SolarStation> SolarStations =>
        _database.GetCollection<SolarStation>("SolarStations");

    /// <summary>
    /// Collection getter for SolarStationInfo (Microgrid Nodes)
    /// </summary>
    public IMongoCollection<SolarStationInfo> SolarStationInfos => 
        _database.GetCollection<SolarStationInfo>("SolarStationInfo");

    /// <summary>
    /// Collection getter for EnergyBookingSlots
    /// </summary>
    public IMongoCollection<EnergyBookingSlots> EnergyBookingSlots => 
        _database.GetCollection<EnergyBookingSlots>("EnergyBookingSlots");

    /// <summary>
    /// Generic typed collection accessor used by repositories that manage their own collections.
    /// </summary>
    public IMongoCollection<T> GetCollection<T>(string collectionName) =>
        _database.GetCollection<T>(collectionName);

    /// <summary>Exposes the raw IMongoDatabase for advanced/ad-hoc queries.</summary>
    public IMongoDatabase Database => _database;
}
