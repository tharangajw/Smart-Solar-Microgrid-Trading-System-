using Microsoft.AspNetCore.Mvc;
using SmartSolarMicrogrid.API.Modules.Authentication.Models;
using SmartSolarMicrogrid.API.Modules.Users.Services;

namespace SmartSolarMicrogrid.API.Modules.Authentication.Controllers
{
//  Authentication controller for login and registration
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

//  User login endpoint
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); 
            }

            var result = await _userService.LoginAsync(request);

            if (result == null)
            {
                return Unauthorized(new { message = "Invalid credentials or account inactive" });
            }

            return Ok(result);
        }

// Prosumer registration endpoint
        [HttpPost("register")]
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
