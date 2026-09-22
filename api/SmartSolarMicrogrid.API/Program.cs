/*
 * Program.cs
 * Application entry point and dependency injection configuration.
 * Configures MongoDB, JWT authentication, CORS, Swagger, and all service registrations.
 * Author: Smart Solar Microgrid Team
 */

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.Facebook;
using AspNet.Security.OAuth.Apple;
using Microsoft.IdentityModel.Tokens;
using SmartSolarMicrogrid.API.Data;
using SmartSolarMicrogrid.API.Modules.Reservations.Repositories;
using SmartSolarMicrogrid.API.Modules.Reservations.Services;
using SmartSolarMicrogrid.API.Modules.StationsMap.Services;
using SmartSolarMicrogrid.API.Modules.StationsMap.Hubs;
using SmartSolarMicrogrid.API.Modules.Transactions.Services;
using SmartSolarMicrogrid.API.Modules.Users.Services;
using SmartSolarMicrogrid.API.Helpers;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Controllers ──────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSignalR();

// ── Swagger / OpenAPI ─────────────────────────────────────────────────────────
// Configure Swagger with Bearer token support for testing protected endpoints
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using Bearer scheme. Enter 'Bearer {token}'",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// ── MongoDB ───────────────────────────────────────────────────────────────────
// Register MongoDbSettings from appsettings.json and the database context
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<MongoDbContext>();

// ── Database Seeder ───────────────────────────────────────────────────────────
// Seeds default Backoffice admin user on startup
builder.Services.AddScoped<DatabaseSeeder>();

// ── User & Auth Services ──────────────────────────────────────────────────────
// User service handles login, registration, and user management
builder.Services.AddScoped<IUserService, UserService>();

// ── Reservation Services ──────────────────────────────────────────────────────
// Repository and service for energy slot reservations
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<ReservationModelToDTO>();

// ── Station Services (Member 4 – Operator Product) ────────────────────────────
// Service for solar station queries and slot availability updates
builder.Services.AddScoped<StationService>();

// ── Operator Transaction Services (Member 4 – Operator Product) ───────────────
// Service for QR verification, reservation approval, and dashboard statistics
builder.Services.AddScoped<OperatorTransactionService>();

// ── JWT Authentication ────────────────────────────────────────────────────────
// Configure JWT Bearer token validation using settings from appsettings.json
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key is not configured in appsettings.json");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
})
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    options.CallbackPath = "/signin-google";
})
.AddFacebook(options =>
{
    options.AppId = builder.Configuration["Authentication:Facebook:AppId"];
    options.AppSecret = builder.Configuration["Authentication:Facebook:AppSecret"];
    options.CallbackPath = "/signin-facebook";
})
.AddApple(options =>
{
    options.ClientId = builder.Configuration["Authentication:Apple:ClientId"];
    options.ClientSecret = builder.Configuration["Authentication:Apple:ClientSecret"];
    options.TeamId = builder.Configuration["Authentication:Apple:TeamId"];
    options.KeyId = builder.Configuration["Authentication:Apple:KeyId"];
    options.CallbackPath = "/signin-apple";
});

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow all origins so both web and mobile clients can reach the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── Middleware Pipeline ───────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Apply CORS before authentication
app.UseCors("AllowAll");

// Disable HTTPS redirection for local IIS / dev convenience
// app.UseHttpsRedirection();

// Authentication must come before Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<StationHub>("/hubs/stations");

// ── Database Seeding ──────────────────────────────────────────────────────────
// Seed initial data (default Backoffice admin) on startup
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    await seeder.SeedAsync();
}

// Launch application server
app.Run();
