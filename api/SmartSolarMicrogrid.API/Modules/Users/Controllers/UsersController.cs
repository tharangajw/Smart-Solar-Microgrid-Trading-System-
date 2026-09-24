using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
/*
 * File: UsersController.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
using SmartSolarMicrogrid.API.Modules.Users.Models;
using SmartSolarMicrogrid.API.Modules.Users.Services;

namespace SmartSolarMicrogrid.API.Modules.Users.Controllers
{
    // Handles user profile management, status updates, and admin user controls
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        // Injects user management service
        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        // Returns profile data of the currently logged-in user
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // Updates current user profile details
        [HttpPut("me")]
        public async Task<IActionResult> UpdateCurrentUser([FromBody] UpdateUserRequest request)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userService.UpdateUserAsync(userId, request);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // Submits an account deactivation request (Prosumers only)
        [HttpPost("me/deactivate")]
        public async Task<IActionResult> RequestDeactivation()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            if (userRole != UserRoles.Prosumer)
            {
                return Forbid();
            }

            var result = await _userService.RequestDeactivationAsync(userId);

            if (!result)
            {
                return BadRequest(new { message = "Failed to request deactivation" });
            }

            return Ok(new { message = "Deactivation request submitted. Contact backoffice for reactivation." });
        }

        // Returns list of all system users (Backoffice only)
        [HttpGet]
        [Authorize(Roles = UserRoles.Backoffice)]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        // Returns pending user activation requests (Backoffice only)
        [HttpGet("pending")]
        [Authorize(Roles = UserRoles.Backoffice)]
        public async Task<IActionResult> GetPendingActivations()
        {
            var users = await _userService.GetPendingActivationsAsync();
            return Ok(users);
        }

        // Gets user profile by database ID (Backoffice only)
        [HttpGet("{id}")]
        [Authorize(Roles = UserRoles.Backoffice)]
        public async Task<IActionResult> GetUserById(string id)
        {
            var user = await _userService.GetUserByIdAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // Gets user profile by NIC number (Backoffice only)
        [HttpGet("nic/{nic}")]
        [Authorize(Roles = UserRoles.Backoffice)]
        public async Task<IActionResult> GetUserByNic(string nic)
        {
            var user = await _userService.GetUserByNicAsync(nic);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // Creates a new user (Backoffice only)
        [HttpPost]
        [Authorize(Roles = UserRoles.Backoffice)]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userService.CreateUserAsync(request);

            if (user == null)
            {
                return BadRequest(new { message = "NIC or email already exists or invalid role" });
            }

            return Ok(user);
        }

        // Updates user details by ID (Backoffice only)
        [HttpPut("{id}")]
        [Authorize(Roles = UserRoles.Backoffice)]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest request)
        {
            var user = await _userService.UpdateUserByBackofficeAsync(id, request);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // Approves and activates a user account (Backoffice only)
        [HttpPost("{id}/activate")]
        [Authorize(Roles = UserRoles.Backoffice)]
        public async Task<IActionResult> ActivateUser(string id)
        {
            var (success, message) = await _userService.ActivateUserAsync(id);

            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }

        // Deactivates/suspends a user account (Backoffice only)
        [HttpPost("{id}/deactivate")]
        [Authorize(Roles = UserRoles.Backoffice)]
        public async Task<IActionResult> DeactivateUser(string id)
        {
            var (success, message) = await _userService.DeactivateUserAsync(id);

            if (!success)
            {
                return BadRequest(new { message });
            }

            return Ok(new { message });
        }

        // Creates a new Grid Operator account (Backoffice only)
        [HttpPost("grid-operator")]
        [Authorize(Roles = UserRoles.Backoffice)]
        public async Task<IActionResult> CreateGridOperator([FromBody] CreateGridOperatorRequest request)
        {
            var user = await _userService.CreateGridOperatorAsync(request);

            if (user == null)
            {
                return BadRequest(new { message = "Failed to create Grid Operator" });
            }

            return Ok(user);
        }

        // Deletes a user account (Backoffice only)
        [HttpDelete("{id}")]
        [Authorize(Roles = UserRoles.Backoffice)]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var result = await _userService.DeleteUserAsync(id);

            if (!result)
            {
                return NotFound();
            }

            return Ok(new { message = "User deleted successfully" });
        }
    }
}
