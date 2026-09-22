using Microsoft.AspNetCore.Mvc;
using SmartSolarMicrogrid.API.Modules.Authentication.Models;
/*
 * File: AuthController.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
using SmartSolarMicrogrid.API.Modules.Users.Services;

namespace SmartSolarMicrogrid.API.Modules.Authentication.Controllers
{
//  Authentication controller for login and registration
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

// Initializes the AuthController instance.
        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

//  User login endpoint
        [HttpPost("login")]
// Handles the Login operation.
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); 
            }

            var (response, errorMessage) = await _userService.LoginAsync(request);

            if (response == null)
            {
                return Unauthorized(new { message = errorMessage ?? "Invalid credentials" });
            }

            return Ok(response);
        }

// Prosumer registration endpoint
        [HttpPost("register")]
// Handles the Register operation.
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userService.RegisterProsumerAsync(request);

            if (result == null)
            {
                return BadRequest(new { message = "NIC or email already exists" });
            }

            return Ok(new { message = "Registration successful. Please wait for backoffice activation.", user = result });
        }
    }
}
