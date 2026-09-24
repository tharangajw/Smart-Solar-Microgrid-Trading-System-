using BCrypt.Net;
using MongoDB.Driver;
/*
 * File: DatabaseSeeder.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
using SmartSolarMicrogrid.API.Modules.Users.Models;
using SmartSolarMicrogrid.API.Modules.StationsMap.Models;
using SmartSolarMicrogrid.API.Modules.Reservations.Models;

namespace SmartSolarMicrogrid.API.Data
{
    // Populates initial admin user, operator user, solar stations, and sample reservations on startup
    public class DatabaseSeeder
    {
        private readonly MongoDbContext _context;

        // Initializes seeder with database context
        public DatabaseSeeder(MongoDbContext context)
        {
            _context = context;
        }

        // Runs all database seeding tasks
        public async Task SeedAsync()
        {
            await SeedBackofficeUser();
            await SeedGridOperatorUser();
            await SeedSolarStations();
            await SeedReservations();
        }

        // Seeds default Backoffice System Admin account if not existing
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
                    Status = UserAccountStatus.Active,
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

        // Seeds default Grid Operator account for station management
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
                Status = UserAccountStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Users.InsertOneAsync(operatorUser);
            Console.WriteLine("Default Grid Operator user created successfully.");
        }

        // Seeds sample solar stations with GPS coordinates and slot capacities
        private async Task SeedSolarStations()
        {
            if (await _context.SolarStations.CountDocumentsAsync(_ => true) > 0)
                return;

            var stations = new[]
            {
                new SolarStation { Name = "Colombo North Hub", Location = "Colombo 13", Latitude = 6.9450, Longitude = 79.8650, TotalSlots = 50, AvailableSlots = 50, CapacityKw = 250 },
                new SolarStation { Name = "Kandy Central Station", Location = "Kandy City Center", Latitude = 7.2906, Longitude = 80.6337, TotalSlots = 40, AvailableSlots = 40, CapacityKw = 200 },
                new SolarStation { Name = "Galle Fort Microgrid", Location = "Galle Fort", Latitude = 6.0328, Longitude = 80.2170, TotalSlots = 30, AvailableSlots = 30, CapacityKw = 150 },
                new SolarStation { Name = "Jaffna Solar Hub", Location = "Jaffna Town", Latitude = 9.6615, Longitude = 80.0255, TotalSlots = 60, AvailableSlots = 60, CapacityKw = 300, Status = "full" }
            };

            await _context.SolarStations.InsertManyAsync(stations);
            Console.WriteLine("Default solar stations created successfully.");
        }

        // Seeds sample slot reservations for testing reservation workflows
        private async Task SeedReservations()
        {
            var reservations = _context.Database.GetCollection<Reservation>("Reservations");
            if (await reservations.CountDocumentsAsync(_ => true) > 0)
                return;

            var firstStation = await _context.SolarStations.Find(_ => true).FirstOrDefaultAsync();
            var nodeId = firstStation?.Id ?? "unknown";

            var dummyReservations = new[]
            {
                new Reservation
                {
                    ProsumerNic   = "891234567V",
                    SlotId        = "SLOT-001",
                    NodeId        = nodeId,
                    ReservationDate = DateTime.UtcNow.AddDays(2),
                    Status        = "Pending",
                    CreatedAt     = DateTime.UtcNow,
                    UpdatedAt     = DateTime.UtcNow
                },
                new Reservation
                {
                    ProsumerNic   = "901234568V",
                    SlotId        = "SLOT-002",
                    NodeId        = nodeId,
                    ReservationDate = DateTime.UtcNow.AddDays(5),
                    Status        = "Pending",
                    CreatedAt     = DateTime.UtcNow,
                    UpdatedAt     = DateTime.UtcNow
                }
            };

            await reservations.InsertManyAsync(dummyReservations);
            Console.WriteLine("Dummy energy slot reservations seeded successfully.");
        }
    }
}
