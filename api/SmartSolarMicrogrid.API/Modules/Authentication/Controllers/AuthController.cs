using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
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

// Google OAuth callback endpoint
        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback()
        {
            var authenticateResult = await HttpContext.AuthenticateAsync("Google");

            if (!authenticateResult.Succeeded)
            {
                return Redirect("http://localhost:5173/login?error=google_auth_failed");
            }

            var email = authenticateResult.Principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var name = authenticateResult.Principal.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return Redirect("http://localhost:5173/login?error=email_not_provided");
            }

            var user = await _userService.GetUserByEmailAsync(email);
            
            if (user == null)
            {
                return Redirect("http://localhost:5173/login?error=user_not_found");
            }

            if (!user.IsActive)
            {
                return Redirect("http://localhost:5173/login?error=account_inactive");
            }

            var token = await _userService.GenerateJwtTokenForUser(user);
            
            await HttpContext.SignOutAsync("Google");

            return Redirect($"http://localhost:5173/login?token={token}&userId={user.Id}");
        }

// Facebook OAuth callback endpoint
        [HttpGet("facebook-callback")]
        public async Task<IActionResult> FacebookCallback()
        {
            var authenticateResult = await HttpContext.AuthenticateAsync("Facebook");

            if (!authenticateResult.Succeeded)
            {
                return Redirect("http://localhost:5173/login?error=facebook_auth_failed");
            }

            var email = authenticateResult.Principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var name = authenticateResult.Principal.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return Redirect("http://localhost:5173/login?error=email_not_provided");
            }

            var user = await _userService.GetUserByEmailAsync(email);
            
            if (user == null)
            {
                return Redirect("http://localhost:5173/login?error=user_not_found");
            }

            if (!user.IsActive)
            {
                return Redirect("http://localhost:5173/login?error=account_inactive");
            }

            var token = await _userService.GenerateJwtTokenForUser(user);
            
            await HttpContext.SignOutAsync("Facebook");

            return Redirect($"http://localhost:5173/login?token={token}&userId={user.Id}");
        }

// Apple OAuth callback endpoint
        [HttpGet("apple-callback")]
        public async Task<IActionResult> AppleCallback()
        {
            var authenticateResult = await HttpContext.AuthenticateAsync("Apple");

            if (!authenticateResult.Succeeded)
            {
                return Redirect("http://localhost:5173/login?error=apple_auth_failed");
            }

            var email = authenticateResult.Principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var name = authenticateResult.Principal.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return Redirect("http://localhost:5173/login?error=email_not_provided");
            }

            var user = await _userService.GetUserByEmailAsync(email);
            
            if (user == null)
            {
                return Redirect("http://localhost:5173/login?error=user_not_found");
            }

            if (!user.IsActive)
            {
                return Redirect("http://localhost:5173/login?error=account_inactive");
            }

            var token = await _userService.GenerateJwtTokenForUser(user);
            
            await HttpContext.SignOutAsync("Apple");

            return Redirect($"http://localhost:5173/login?token={token}&userId={user.Id}");
        }

// Google OAuth challenge endpoint
        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties { RedirectUri = "/api/auth/google-callback" };
            return Challenge(properties, "Google");
        }

// Facebook OAuth challenge endpoint
        [HttpGet("facebook-login")]
        public IActionResult FacebookLogin()
        {
            var properties = new AuthenticationProperties { RedirectUri = "/api/auth/facebook-callback" };
            return Challenge(properties, "Facebook");
        }

// Apple OAuth challenge endpoint
        [HttpGet("apple-login")]
        public IActionResult AppleLogin()
        {
            var properties = new AuthenticationProperties { RedirectUri = "/api/auth/apple-callback" };
            return Challenge(properties, "Apple");
        }
    }
}
