using BCrypt.Net;
using MongoDB.Driver;
using SmartSolarMicrogrid.API.Modules.Users.Models;
using SmartSolarMicrogrid.API.Modules.StationsMap.Models;

namespace SmartSolarMicrogrid.API.Data
{
//  Database seeder for initial data
    public class DatabaseSeeder
    {
        private readonly MongoDbContext _context;

        public DatabaseSeeder(MongoDbContext context)
        {
            _context = context;
        }
// Seed initial data including default Backoffice user
        public async Task SeedAsync()
        {
            await SeedBackofficeUser();
            await SeedGridOperatorUser();
            await SeedSolarStations();
        }

// Seed default Backoffice user if not exists
        private async Task SeedBackofficeUser()
        {
            var existingAdmin = await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Email, "admin@smartsolar.com"))
                .FirstOrDefaultAsync();

            if (existingAdmin == null)
            {
                var adminUser = new User
                {
                    Nic = "801234567V",
                    FullName = "System Administrator",
                    Email = "admin@smartsolar.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = UserRoles.Backoffice,
                    PhoneNumber = "0771234567",
                    Address = "Smart Solar HQ, Colombo",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _context.Users.InsertOneAsync(adminUser);
                Console.WriteLine("Default Backoffice user created successfully.");
                Console.WriteLine("Email: admin@smartsolar.com");
                Console.WriteLine("Password: Admin@123");
            }
            else
            {
                Console.WriteLine("Default Backoffice user already exists.");
            }
        }

        // Seed a local-development Grid Operator account for the operator portal.
        private async Task SeedGridOperatorUser()
        {
            const string email = "operator@smartsolar.com";
            var existingOperator = await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Email, email))
                .FirstOrDefaultAsync();

            if (existingOperator != null)
                return;

            var operatorUser = new User
            {
                Nic = "901234567V",
                FullName = "Grid Operator",
                Email = email,
                Password = BCrypt.Net.BCrypt.HashPassword("Operator@123"),
                Role = UserRoles.GridOperator,
                PhoneNumber = "0771234568",
                Address = "Smart Solar Operations, Colombo",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Users.InsertOneAsync(operatorUser);
            Console.WriteLine("Default Grid Operator user created successfully.");
        }

        // Add stations only on a new local database so map and availability features work immediately.
        private async Task SeedSolarStations()
        {
            if (await _context.SolarStations.CountDocumentsAsync(_ => true) > 0)
                return;

            var stations = new[]
            {
                new SolarStation { Name = "Colombo Solar Hub", Location = "Colombo 03", Latitude = 6.9271, Longitude = 79.8612, TotalSlots = 10, AvailableSlots = 7, CapacityKWh = 250, Status = "active" },
                new SolarStation { Name = "Kandy Solar Hub", Location = "Kandy Central", Latitude = 7.2906, Longitude = 80.6337, TotalSlots = 8, AvailableSlots = 4, CapacityKWh = 180, Status = "active" },
                new SolarStation { Name = "Galle Solar Hub", Location = "Galle Fort", Latitude = 6.0535, Longitude = 80.2210, TotalSlots = 6, AvailableSlots = 2, CapacityKWh = 120, Status = "active" },
                new SolarStation { Name = "Jaffna Solar Hub", Location = "Jaffna Town", Latitude = 9.6615, Longitude = 80.0255, TotalSlots = 5, AvailableSlots = 0, CapacityKWh = 100, Status = "full" }
            };

            await _context.SolarStations.InsertManyAsync(stations);
            Console.WriteLine("Default solar stations created successfully.");
        }
    }
}
