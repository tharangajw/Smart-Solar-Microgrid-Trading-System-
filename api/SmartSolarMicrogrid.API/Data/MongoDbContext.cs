using Microsoft.Extensions.Options;
using MongoDB.Driver;

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
    /// Returns the underlying IMongoDatabase for advanced operations.
    /// </summary>
    public IMongoDatabase Database => _database;
using MongoDB.Driver;
using SmartSolarMicrogrid.API.Modules.Users.Models;

namespace SmartSolarMicrogrid.API.Data
{
//  MongoDB database context
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IConfiguration configuration)
        {
            var connectionString = configuration.GetSection("MongoDB:ConnectionString").Value;
            var databaseName = configuration.GetSection("MongoDB:DatabaseName").Value;

            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
        }

// Users collection
        public IMongoCollection<User> Users => _database.GetCollection<User>("users");
    }
}
