// ============================================================================
// Module: Smart Solar Microgrid Trading System - C# Web API
// File: MongoDbContext.cs
// Description: Manages central MongoDB database context connection pool and
//              exposes typed IMongoCollection getters for SolarStationInfo,
//              EnergyBookingSlots, and Reservations.
// ============================================================================

using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SmartSolarMicrogrid.API.Models;

namespace SmartSolarMicrogrid.API.Data;

/// <summary>
/// Centralized MongoDB database context maintaining MongoClient connection pool.
/// </summary>
public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    // Constructor initializing MongoClient and connecting to target database
    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
    }

    /// <summary>
    /// Returns a typed collection reference for the given collection name
    /// </summary>
    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }

    /// <summary>
    /// Collection getter for SolarStationInfo (Microgrid Nodes)
    /// </summary>
    public IMongoCollection<SolarStationInfo> SolarStations => GetCollection<SolarStationInfo>("SolarStationInfo");

    /// <summary>
    /// Collection getter for EnergyBookingSlots
    /// </summary>
    public IMongoCollection<EnergyBookingSlots> EnergyBookingSlots => GetCollection<EnergyBookingSlots>("EnergyBookingSlots");

    /// <summary>
    /// Exposes underlying database reference for raw queries
    /// </summary>
    public IMongoDatabase Database => _database;
}
