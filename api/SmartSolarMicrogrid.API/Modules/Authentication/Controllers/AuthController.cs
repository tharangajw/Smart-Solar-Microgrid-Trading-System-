using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using SmartSolarMicrogrid.API.Modules.Authentication.Models;
/*
 * File: AuthController.cs
 * Project: Smart Solar Microgrid Trading System
 * Description: Implements the models, services, controllers, or infrastructure for this module.
 */
using SmartSolarMicrogrid.API.Modules.Users.Services;

namespace SmartSolarMicrogrid.API.Modules.Authentication.Controllers
{
    // Authentication controller for login, registration, JWT tokens, and OAuth logins
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        // Injects user authentication service
        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        // Authenticates user credentials and returns JWT token
        [HttpPost("login")]
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

        // Registers a new Prosumer account (starts as Pending)
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

        // Handles Google OAuth login callback and issues JWT token
        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback()
        {
            var authenticateResult = await HttpContext.AuthenticateAsync("Google");

            if (!authenticateResult.Succeeded)
            {
                return Redirect("http://localhost:5174/login?error=google_auth_failed");
            }

            var email = authenticateResult.Principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return Redirect("http://localhost:5174/login?error=email_not_provided");
            }

            var user = await _userService.GetUserByEmailAsync(email);
            
            if (user == null)
            {
                return Redirect("http://localhost:5174/login?error=user_not_found");
            }

            if (!user.IsActive)
            {
                return Redirect("http://localhost:5174/login?error=account_inactive");
            }

            var token = await _userService.GenerateJwtTokenForUser(user);
            
            await HttpContext.SignOutAsync("Google");

            return Redirect($"http://localhost:5174/login?token={token}&userId={user.Id}&role={user.Role}");
        }

        // Handles Facebook OAuth login callback and issues JWT token
        [HttpGet("facebook-callback")]
        public async Task<IActionResult> FacebookCallback()
        {
            var authenticateResult = await HttpContext.AuthenticateAsync("Facebook");

            if (!authenticateResult.Succeeded)
            {
                return Redirect("http://localhost:5174/login?error=facebook_auth_failed");
            }

            var email = authenticateResult.Principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return Redirect("http://localhost:5174/login?error=email_not_provided");
            }

            var user = await _userService.GetUserByEmailAsync(email);
            
            if (user == null)
            {
                return Redirect("http://localhost:5174/login?error=user_not_found");
            }

            if (!user.IsActive)
            {
                return Redirect("http://localhost:5174/login?error=account_inactive");
            }

            var token = await _userService.GenerateJwtTokenForUser(user);
            
            await HttpContext.SignOutAsync("Facebook");

            return Redirect($"http://localhost:5174/login?token={token}&userId={user.Id}&role={user.Role}");
        }

        // Handles Apple OAuth login callback and issues JWT token
        [HttpGet("apple-callback")]
        public async Task<IActionResult> AppleCallback()
        {
            var authenticateResult = await HttpContext.AuthenticateAsync("Apple");

            if (!authenticateResult.Succeeded)
            {
                return Redirect("http://localhost:5174/login?error=apple_auth_failed");
            }

            var email = authenticateResult.Principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return Redirect("http://localhost:5174/login?error=email_not_provided");
            }

            var user = await _userService.GetUserByEmailAsync(email);
            
            if (user == null)
            {
                return Redirect("http://localhost:5174/login?error=user_not_found");
            }

            if (!user.IsActive)
            {
                return Redirect("http://localhost:5174/login?error=account_inactive");
            }

            var token = await _userService.GenerateJwtTokenForUser(user);
            
            await HttpContext.SignOutAsync("Apple");

            return Redirect($"http://localhost:5174/login?token={token}&userId={user.Id}&role={user.Role}");
        }

        // Starts Google login flow
        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties { RedirectUri = "/api/auth/google-callback" };
            return Challenge(properties, "Google");
        }

        // Starts Facebook login flow
        [HttpGet("facebook-login")]
        public IActionResult FacebookLogin()
        {
            var properties = new AuthenticationProperties { RedirectUri = "/api/auth/facebook-callback" };
            return Challenge(properties, "Facebook");
        }

        // Starts Apple login flow
        [HttpGet("apple-login")]
        public IActionResult AppleLogin()
        {
            var properties = new AuthenticationProperties { RedirectUri = "/api/auth/apple-callback" };
            return Challenge(properties, "Apple");
        }
    }
}
