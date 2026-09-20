// ============================================================================
// Module: Smart Solar Microgrid Trading System - C# Web API
// File: Program.cs
// Description: Application entry point configuring MongoDB, CORS policies,
//              Dependency Injection services, and REST API controllers pipeline.
// ============================================================================

using SmartSolarMicrogrid.API.Data;

var builder = WebApplication.CreateBuilder(args);

// ── MongoDB Database Configuration ───────────────────
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

// Register MongoDB Singleton context
builder.Services.AddSingleton<MongoDbContext>();

// ── CORS Policy ──────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ── OpenAPI / Swagger Documentation ──────────────────
builder.Services.AddOpenApi();

// ── Dependency Injection Services & Controllers ──────
builder.Services.AddScoped<SmartSolarMicrogrid.API.Modules.Reservations.Repositories.IReservationRepository, SmartSolarMicrogrid.API.Modules.Reservations.Repositories.ReservationRepository>();
builder.Services.AddScoped<SmartSolarMicrogrid.API.Modules.Reservations.Services.IReservationService, SmartSolarMicrogrid.API.Modules.Reservations.Services.ReservationService>();
builder.Services.AddScoped<SmartSolarMicrogrid.API.Helpers.ReservationModelToDTO>();

builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");

app.MapControllers();

// Launch application server
app.Run();
