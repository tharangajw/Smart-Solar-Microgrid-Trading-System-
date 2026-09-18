using SmartSolarMicrogrid.API.Data;

var builder = WebApplication.CreateBuilder(args);

// ── MongoDB ──────────────────────────────────────────
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<MongoDbContext>();

// ── OpenAPI / Swagger ────────────────────────────────
builder.Services.AddOpenApi();

// ── Controllers ──────────────────────────────────────
builder.Services.AddScoped<SmartSolarMicrogrid.API.Modules.Reservations.Repositories.IReservationRepository, SmartSolarMicrogrid.API.Modules.Reservations.Repositories.ReservationRepository>();
//builder.Services.AddScoped<SmartSolarMicrogrid.API.Modules.Reservations.Services.IReservationService, SmartSolarMicrogrid.API.Modules.Reservations.Services.ReservationService>();

builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

<<<<<<< HEAD
app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

=======
// app.UseHttpsRedirection();

>>>>>>> 6a9b2cf2eb9ab4b231575f93ce885c6dff07e947
app.MapControllers();

app.Run();
