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
