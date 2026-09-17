using SmartSolarMicrogrid.API.Data;

var builder = WebApplication.CreateBuilder(args);

// ── MongoDB ──────────────────────────────────────────
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<MongoDbContext>();

// ── OpenAPI / Swagger ────────────────────────────────
builder.Services.AddOpenApi();

// ── Controllers ──────────────────────────────────────
builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
