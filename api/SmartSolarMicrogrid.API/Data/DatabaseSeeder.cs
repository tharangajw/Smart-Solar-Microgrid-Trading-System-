using BCrypt.Net;
using MongoDB.Driver;
using SmartSolarMicrogrid.API.Modules.Users.Models;

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
    }
}
