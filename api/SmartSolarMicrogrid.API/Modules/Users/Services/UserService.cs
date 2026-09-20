using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;
using SmartSolarMicrogrid.API.Data;
using SmartSolarMicrogrid.API.Modules.Authentication.Models;
using SmartSolarMicrogrid.API.Modules.Users.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace SmartSolarMicrogrid.API.Modules.Users.Services
{
    // User service implementation with business logic
    public class UserService : IUserService
    {
        private readonly MongoDbContext _context;
        private readonly IConfiguration _configuration;

        public UserService(MongoDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Authenticate user and generate JWT token
        public async Task<(LoginResponse? Response, string? ErrorMessage)> LoginAsync(LoginRequest request)
        {
            var identifier = (request.Email ?? request.Nic ?? string.Empty).Trim();
            var user = await FindUserByEmailOrNicAsync(identifier);

            if (user == null || string.IsNullOrEmpty(user.Password) || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return (null, "Invalid NIC/email or password");
            }

            if (!user.IsActive)
            {
                var message = user.Status == UserAccountStatus.Deactivated
                    ? "Account is deactivated. Contact a Backoffice officer to reactivate it."
                    : "Account is pending Backoffice activation. You can log in after an officer approves your registration.";
                return (null, message);
            }

            var token = GenerateJwtToken(user);

            return (new LoginResponse
            {
                Token = token,
                UserId = user.Id ?? string.Empty,
                Email = user.Email,
                Role = user.Role,
                FullName = user.FullName,
                Nic = user.Nic
            }, null);
        }

        // Find a user by exact NIC or case-insensitive email
        private async Task<User?> FindUserByEmailOrNicAsync(string identifier)
        {
            if (string.IsNullOrWhiteSpace(identifier))
            {
                return null;
            }

            var nicFilter = Builders<User>.Filter.Eq(u => u.Nic, identifier);
            var emailFilter = Builders<User>.Filter.Regex(
                u => u.Email,
                new BsonRegularExpression($"^{Regex.Escape(identifier)}$", "i")
            );

            return await _context.Users
                .Find(Builders<User>.Filter.Or(nicFilter, emailFilter))
                .FirstOrDefaultAsync();
        }

        // Register new prosumer
        public async Task<User?> RegisterProsumerAsync(RegisterRequest request)
        {
            // Check if NIC already exists
            var existingByNic = await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Nic, request.Nic))
                .FirstOrDefaultAsync();

            if (existingByNic != null)
            {
                return null;
            }

            // Check if email already exists
            var existingByEmail = await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Email, request.Email))
                .FirstOrDefaultAsync();

            if (existingByEmail != null)
            {
                return null;
            }

            var user = new User
            {
                Nic = request.Nic,
                FullName = request.FullName,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = UserRoles.Prosumer,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                SolarCapacityKw = request.SolarCapacityKw,
                IsActive = false,
                Status = UserAccountStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Users.InsertOneAsync(user);
            return user;
        }

        // Create user (Backoffice only)
        public async Task<User?> CreateUserAsync(CreateUserRequest request)
        {
            // Validate role
            if (request.Role != UserRoles.Backoffice && request.Role != UserRoles.GridOperator)
            {
                return null;
            }

            // Check if NIC already exists
            var existingByNic = await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Nic, request.Nic))
                .FirstOrDefaultAsync();

            if (existingByNic != null)
            {
                return null;
            }

            // Check if email already exists
            var existingByEmail = await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Email, request.Email))
                .FirstOrDefaultAsync();

            if (existingByEmail != null)
            {
                return null;
            }

            var user = new User
            {
                Nic = request.Nic,
                FullName = request.FullName,
                Email = request.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                IsActive = true,
                Status = UserAccountStatus.Active,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Users.InsertOneAsync(user);
            return user;
        }

        // Get user by ID
        public async Task<User?> GetUserByIdAsync(string id)
        {
            return await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Id, id))
                .FirstOrDefaultAsync();
        }

        // Get user by NIC
        public async Task<User?> GetUserByNicAsync(string nic)
        {
            return await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Nic, nic))
                .FirstOrDefaultAsync();
        }

        // Get user by email
        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Email, email))
                .FirstOrDefaultAsync();
        }

        // Get all users (Backoffice only)
        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users
                .Find(Builders<User>.Filter.Empty)
                .ToListAsync();
        }

        // Get pending activation prosumers
        public async Task<List<User>> GetPendingActivationsAsync()
        {
            return await _context.Users
                .Find(Builders<User>.Filter.And(
                    Builders<User>.Filter.Eq(u => u.Role, UserRoles.Prosumer),
                    Builders<User>.Filter.Eq(u => u.IsActive, false),
                    Builders<User>.Filter.Ne(u => u.Status, UserAccountStatus.Deactivated)
                ))
                .ToListAsync();
        }

        // Update user profile
        public async Task<User?> UpdateUserAsync(string id, UpdateUserRequest request)
        {
            var user = await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Id, id))
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return null;
            }

            var update = Builders<User>.Update
                .Set(u => u.UpdatedAt, DateTime.UtcNow);

            if (!string.IsNullOrEmpty(request.FullName))
                update = update.Set(u => u.FullName, request.FullName);
            if (!string.IsNullOrEmpty(request.Email))
                update = update.Set(u => u.Email, request.Email);
            if (!string.IsNullOrEmpty(request.PhoneNumber))
                update = update.Set(u => u.PhoneNumber, request.PhoneNumber);
            if (!string.IsNullOrEmpty(request.Address))
                update = update.Set(u => u.Address, request.Address);
            if (request.SolarCapacityKw.HasValue)
                update = update.Set(u => u.SolarCapacityKw, request.SolarCapacityKw);

            await _context.Users.UpdateOneAsync(Builders<User>.Filter.Eq(u => u.Id, id), update);

            return await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Id, id))
                .FirstOrDefaultAsync();
        }

        // Update user (Backoffice only)
        public async Task<User?> UpdateUserByBackofficeAsync(string id, UpdateUserRequest request)
        {
            return await UpdateUserAsync(id, request);
        }

        // Activate user account (Backoffice only)
        public async Task<(bool Success, string Message)> ActivateUserAsync(string id)
        {
            var user = await FindUserForActivationAsync(id);

            if (user == null)
            {
                return (false, "User not found");
            }

            if (user.IsActive)
            {
                return (false, "User is already active");
            }

            var result = await _context.Users.UpdateOneAsync(
                Builders<User>.Filter.Eq(u => u.Id, user.Id),
                Builders<User>.Update
                    .Set(u => u.IsActive, true)
                    .Set("isActive", true)
                    .Set(u => u.Status, UserAccountStatus.Active)
                    .Set(u => u.UpdatedAt, DateTime.UtcNow)
            );

            if (result.ModifiedCount > 0)
            {
                return (true, "User activated successfully");
            }

            return (false, "Failed to activate user");
        }

        // Deactivate user account
        public async Task<(bool Success, string Message)> DeactivateUserAsync(string id)
        {
            var user = await _context.Users
                .Find(Builders<User>.Filter.Eq(u => u.Id, id))
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return (false, "User not found");
            }

            if (!user.IsActive)
            {
                return (false, "User is already inactive");
            }

            var result = await _context.Users.UpdateOneAsync(
                Builders<User>.Filter.Eq(u => u.Id, id),
                Builders<User>.Update
                    .Set(u => u.IsActive, false)
                    .Set(u => u.Status, UserAccountStatus.Deactivated)
                    .Set(u => u.UpdatedAt, DateTime.UtcNow)
            );

            if (result.ModifiedCount > 0)
            {
                return (true, "User deactivated successfully");
            }

            return (false, "Failed to deactivate user");
        }

        // Request deactivation (Prosumer)
        public async Task<bool> RequestDeactivationAsync(string id)
        {
            // Prosumers can only request deactivation, which sets it to inactive
            var (success, _) = await DeactivateUserAsync(id);
            return success;
        }

        // Delete user (Backoffice only)
        public async Task<bool> DeleteUserAsync(string id)
        {
            var result = await _context.Users.DeleteOneAsync(Builders<User>.Filter.Eq(u => u.Id, id));
            return result.DeletedCount > 0;
        }

        // Generate JWT token for authenticated user
        private string GenerateJwtToken(User user)
        {
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim("nic", user.Nic)
                }),
                Expires = DateTime.UtcNow.AddMinutes(
                    double.Parse(_configuration["Jwt:ExpiryInMinutes"] ?? "60")
                ),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
