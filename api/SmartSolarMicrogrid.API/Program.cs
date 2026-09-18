using SmartSolarMicrogrid.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<MongoDbContext>();

// --- Reservations Module ---
builder.Services.AddScoped<SmartSolarMicrogrid.API.Modules.Reservations.Services.ReservationService>();

// --- Transactions / Operator QR Module ---
builder.Services.AddScoped<SmartSolarMicrogrid.API.Modules.Transactions.Services.OperatorTransactionService>();

// --- StationsMap Module (Nearby Stations + Google Maps) ---
builder.Services.AddScoped<SmartSolarMicrogrid.API.Modules.StationsMap.Services.StationService>();

// --- Operator Dashboard Module ---
builder.Services.AddScoped<SmartSolarMicrogrid.API.Modules.Dashboard.Services.OperatorDashboardService>();

// Add CORS to allow web and mobile clients to connect
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
