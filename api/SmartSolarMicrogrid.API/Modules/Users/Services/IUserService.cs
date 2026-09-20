using SmartSolarMicrogrid.API.Modules.Authentication.Models;
using SmartSolarMicrogrid.API.Modules.Users.Models;

namespace SmartSolarMicrogrid.API.Modules.Users.Services
{
// User service interface
    public interface IUserService
    {
    // Authenticate user and generate JWT token
        Task<LoginResponse?> LoginAsync(LoginRequest request);

    // Register new prosumer
        Task<User?> RegisterProsumerAsync(RegisterRequest request);

    // Create user (Backoffice only)
        Task<User?> CreateUserAsync(CreateUserRequest request);

    // Get User By ID
        Task<User?> GetUserByIdAsync(string id);

    // Get user by NIC
        Task<User?> GetUserByNicAsync(string nic);

    // Get user by email
        Task<User?> GetUserByEmailAsync(string email);

    // Get all users (Backoffice only)
        Task<List<User>> GetAllUsersAsync();

    // Get pending activation prosumers
        Task<List<User>> GetPendingActivationsAsync();

    // Update user profile
        Task<User?> UpdateUserAsync(string id, UpdateUserRequest request);

    // Update user (Backoffice only)
        Task<User?> UpdateUserByBackofficeAsync(string id, UpdateUserRequest request);

    // Activate user account (Backoffice only)
        Task<(bool Success, string Message)> ActivateUserAsync(string id);

    // Deactivate user account
        Task<(bool Success, string Message)> DeactivateUserAsync(string id);

    // Request deactivation (Prosumer)
        Task<bool> RequestDeactivationAsync(string id);

    // Delete user (Backoffice only)
        Task<bool> DeleteUserAsync(string id);

    // Generate JWT token for OAuth user
        Task<string> GenerateJwtTokenForUser(User user);
    }
}
