# ⚡ Smart Solar Microgrid Trading System - Backend API

This directory contains the **.NET 10 Web API** backend servicing the Smart Solar Microgrid System.

For full project documentation, system architecture, and client setup guides, see the **[Root README.md](../README.md)**.

---

## 🛠️ Technology Stack

- **Framework**: .NET 10.0 (ASP.NET Core Web API)
- **Database**: MongoDB (`MongoDB.Driver` 2.28)
- **Authentication**: JWT Bearer, BCrypt password hashing, OAuth (Google, Facebook, Apple)
- **Real-Time Hub**: ASP.NET Core SignalR (`/hubs/stations`)
- **API Docs**: Swagger / Swashbuckle OpenAPI (`/swagger`)

---

## 🚀 Quick Start

1. Ensure local MongoDB instance is running or configure `appsettings.json`.
2. Run the application:
   ```bash
   cd SmartSolarMicrogrid.API
   dotnet run
   ```
3. Access Swagger UI at `https://localhost:7198/swagger`.
