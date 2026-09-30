# ☀️ Smart Solar Microgrid Trading & Charging System
 
[![Framework](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](.NET - Build modern apps and powerful cloud services)
[![Frontend](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Mobile](https://img.shields.io/badge/Android-Kotlin_SDK_35-3DDC84?logo=android&logoColor=white)](Android Mobile App Developer Tools - Android Developers)
[![Database](https://img.shields.io/badge/MongoDB-Driver_2.28-47A248?logo=mongodb&logoColor=white)](MongoDB | The Intelligent Data Platform for the AI Era)
[![Styling](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](Tailwind CSS - Rapidly build modern websites without ever leaving your HTML.)
[![API Testing](https://img.shields.io/badge/Bruno-API_Collection-FF6B6B?logo=bruno&logoColor=white)](https://www.usebruno.com/)
 
A modern, full-stack Enterprise Application for decentralized **Smart Solar Microgrid Energy Trading**, **EV Charging Slot Reservations**, **Station Operator Verification**, and **Real-time Microgrid Analytics**.
 
Developed as an **Enterprise Application Development (EAD)** project at **SLIIT**.
 
---
 
## 📑 Table of Contents
 
- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Backend API Setup](#1-backend-api-setup)
  - [2. Web Application Setup](#2-web-application-setup)
  - [3. Android Mobile Setup](#3-android-mobile-setup)
  - [4. Bruno API Testing](#4-bruno-api-testing)
- [Environment Configuration](#-environment-configuration)
- [API Documentation](#-api-documentation)
- [License & Credits](#-license--credits)
 
---
 
## 🌟 Overview
 
The **Smart Solar Microgrid Trading & Charging System** connects solar prosumers (energy producers), EV owners, microgrid station operators, and backoffice administrators into a unified energy trading ecosystem.
 
It empowers solar energy owners to monetize excess clean energy while providing EV drivers with seamless station discovery, slot reservation, real-time status tracking, and instant QR-code-based verification at charging stations.
 
```mermaid
graph TD
    A[Consumer / Prosumer Mobile App] -->|HTTP / REST & QR| B[ASP.NET Core Web API]
    C[Admin / Operator Web App] -->|HTTP / REST & WebSockets| B
    B -->|Persist Data| D[(MongoDB Database)]
    B -->|SignalR Real-Time Hub| C
```
 
---
 
## 🔥 Key Features
 
### 🚗 Prosumer & EV Consumer (Mobile App & Web)
* **Interactive Map Search**: Discover nearby microgrid charging stations using Google Maps (Android) and Leaflet (Web).
* **Energy Slot Booking**: Reserve time slots for EV charging or green energy transfer.
* **Dynamic QR Code Generation**: Instant QR code generation for smooth on-site verification.
* **Real-time Availability**: View live slot updates driven by SignalR WebSockets.
 
### 🏭 Station Operators
* **QR Verification Engine**: Scan customer QR codes on-site using the built-in Android camera scanner (ZXing) or web portal to validate reservations.
* **Slot Management**: Create, update, and toggle solar energy charging slot availability.
* **Operator Dashboard**: View daily transaction volume, total kWh delivered, and station performance analytics.
 
### 🛡️ Backoffice Administrators
* **User Management**: Oversee Prosumers, Consumers, Station Operators, and Admin profiles with RBAC security.
* **Microgrid Node Monitoring**: Register and manage microgrid solar generation nodes.
* **Transaction & Audit Logs**: Inspect system-wide trading logs, reservations, and financial settlements.
 
---
 
## 🏗️ System Architecture
 
The project follows a **Clean Architecture / Modular Monolith** approach separated into 3 main application tiers:
 
```
   +------------------------------+        +------------------------------+
   |   React 19 + Vite Web App    |        | Native Android Mobile App    |
   | (Admin & Operator Dashboard) |        | (EV Drivers & Prosumers UI)  |
   +--------------+---------------+        +--------------+---------------+
                  |                                       |
                  | REST APIs & SignalR WebSockets        |
                  +-------------------+-------------------+
                                      |
                                      v
                  +-----------------------------------+
                  |  ASP.NET Core Web API (.NET 10)   |
                  |  - SignalR Real-Time Station Hub  |
                  |  - JWT Bearer Authentication      |
                  |  - Modular Monolith Controllers  |
                  +-----------------+-----------------+
                                      |
                                      v
                  +-----------------------------------+
                  |          MongoDB Database         |
                  |   (Users, Stations, Reservations) |
                  +-----------------------------------+
```
 
---
 
## 🛠️ Tech Stack
 
### Backend API (`/api`)
- **Framework**: .NET 10.0 (ASP.NET Core Web API)
- **Database**: MongoDB (MongoDB.Driver 2.28)
- **Security**: JWT Bearer Tokens, BCrypt password hashing, OAuth (Google, Facebook, Apple)
- **Real-Time Engine**: ASP.NET Core SignalR Core (`/hubs/stations`)
- **API Documentation**: OpenAPI / Swashbuckle Swagger UI (`/swagger`)
 
### Web Frontend (`/web`)
- **Core**: React 19, Vite, JavaScript (ES Next)
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **State & Router**: React Router v7, Redux with Redux Thunk
- **Maps & Charts**: Leaflet.js, Recharts analytics library
- **WebSockets**: `@microsoft/signalr` client
 
### Mobile Application (`/mobile`)
- **Language**: Kotlin (Android SDK 35, Java 21)
- **UI & Architecture**: Android Material Design 3, ViewBinding, ViewModel, Lifecycle Scope
- **Maps & Location**: Google Maps SDK (`play-services-maps`), Location Services (`play-services-location`)
- **QR Code Scanning**: ZXing Android Embedded library (`zxing-android-embedded`)
- **Concurrency**: Kotlin Coroutines (`kotlinx-coroutines-android`)
 
### API Collection (`/bruno`)
- Automated endpoint collection using **Bruno API Client** for API testing and manual debugging.
 
---
 
## 📁 Repository Structure
 
```
Smart-Solar-Microgrid-Trading-System/
├── api/                             # .NET 10 Web API Backend
│   └── SmartSolarMicrogrid.API/
│       ├── Data/                    # MongoDB Context & Database Seeders
│       ├── Helpers/                 # Password Hashing, JWT Helpers
│       ├── Modules/                 # Feature Modules
│       │   ├── Authentication/      # Auth & Login Endpoints
│       │   ├── Dashboard/           # Operator Dashboard Analytics
│       │   ├── EnergySlots/         # Slot Scheduling & Pricing
│       │   ├── Microgrid/           # Microgrid Node Management
│       │   ├── Reservations/        # Energy Slot Booking System
│       │   ├── StationsMap/         # Station Geo-Locations & SignalR Hub
│       │   ├── Transactions/        # QR Code Verification & Operator Services
│       │   └── Users/               # User Profiles & Backoffice Management
│       └── Program.cs               # Application Startup & DI Configuration
├── web/                             # React 19 Web Portal (Admin & Operator)
│   ├── src/                         # React Components, Pages & Redux Store
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── mobile/                          # Native Android Mobile App (Kotlin)
│   ├── app/                         # Android App Source (Activities, Layouts)
│   ├── build.gradle.kts
│   └── settings.gradle.kts
└── bruno/                           # Bruno API Request Collection
```
 
---
 
## 🚀 Getting Started
 
### Prerequisites
 
Ensure you have the following installed on your developer machine:
- **[.NET 10 SDK](https://dotnet.microsoft.com/download)** (or .NET 8+)
- **[Node.js](Node.js — Run JavaScript Everywhere)** (v18.x or higher) & `npm`
- **[Android Studio](Download Android Studio & App Tools - Android Developers)** (Ladybug or newer) with JDK 21
- **[MongoDB](https://www.mongodb.com/try/download/community)** (Local instance or MongoDB Atlas cluster connection string)
 
---
 
### 1. Backend API Setup
 
1. Navigate to the API project directory:
   ```bash
   cd api/SmartSolarMicrogrid.API
   ```
 
2. Configure your MongoDB connection string in `appsettings.json`:
   ```json
   {
     "MongoDbSettings": {
       "ConnectionString": "mongodb://localhost:27017",
       "DatabaseName": "SmartSolarMicrogridDb"
     },
     "Jwt": {
       "Key": "YOUR_SUPER_SECRET_JWT_KEY_MIN_32_CHARS_LONG",
       "Issuer": "SmartSolarAPI",
       "Audience": "SmartSolarClients"
     }
   }
   ```
 
3. Restore dependencies and run the API:
   ```bash
   dotnet restore
   dotnet run
   ```
 
4. Open your browser and navigate to `https://localhost:7198/swagger` (or port indicated in console) to explore the Swagger UI documentation.
 
---
 
### 2. Web Application Setup
 
1. Navigate to the web application directory:
   ```bash
   cd web
   ```
 
2. Install dependencies:
   ```bash
   npm install
   ```
 
3. Create or check `.env` file for backend API URL:
   ```env
   VITE_API_BASE_URL=https://localhost:7198/api
   VITE_SIGNALR_HUB_URL=https://localhost:7198/hubs/stations
   ```
 
4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
 
5. Access the web app in your browser at `http://localhost:5173`.
 
---
 
### 3. Android Mobile Setup
 
1. Open **Android Studio**.
2. Select **Open an existing project** and choose the `mobile/` directory.
3. Allow Gradle to sync dependencies automatically.
4. Ensure your `local.properties` contains your Android SDK location and optionally a Google Maps API Key:
   ```properties
   sdk.dir=C\:\\Users\\YourUser\\AppData\\Local\\Android\\Sdk
   MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
   ```
5. Run the application on an Android Emulator or physical device (Min SDK 24 / Target SDK 35).
 
---
 
### 4. Bruno API Testing
 
1. Download and install [Bruno API Client](https://www.usebruno.com/).
2. Open Bruno and click **Open Collection**.
3. Select the `bruno/` folder located at the root of this repository.
4. Execute endpoint tests (Authentication, Station queries, Slot Reservations, Operator Approval).
 
---
 
## 🔐 Environment Configuration
 
| Service | File Path | Key Variables | Description |
| :--- | :--- | :--- | :--- |
| **Backend API** | `api/SmartSolarMicrogrid.API/appsettings.json` | `MongoDbSettings:ConnectionString`, `Jwt:Key` | MongoDB connection string & JWT secret key |
| **Web Portal** | `web/.env` | `VITE_API_BASE_URL` | Base URL for REST API backend |
| **Android App** | `mobile/local.properties` | `MAPS_API_KEY` | Google Maps API key for Android map rendering |
 
---
 
## 📡 API Endpoints Summary
 
| Module | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/login` | `POST` | Authenticate user & receive JWT token |
| **Auth** | `/api/auth/register` | `POST` | Register a new Consumer or Prosumer |
| **Stations** | `/api/stations` | `GET` | Get list of microgrid solar stations |
| **Slots** | `/api/slots/available` | `GET` | Query available energy charging slots |
| **Reservations** | `/api/reservations` | `POST` | Create a new energy slot reservation |
| **Operator** | `/api/operator/verify-qr` | `POST` | Verify customer reservation QR code |
| **Dashboard** | `/api/operator/dashboard` | `GET` | Fetch real-time operator station metrics |
| **Users** | `/api/users` | `GET` | Admin endpoint to manage registered users |
 
---
 
## 🎓 Academic Context
 
This project was created for the **Enterprise Application Development (EAD)** module at **Sri Lanka Institute of Information Technology (SLIIT)**.
 
| Detail | Info |
| :--- | :--- |
| **Module** | SE4040 — Enterprise Application Development |
| **Assignment** | Smart Solar Microgrid Trading System – Client-Server Application |
| **Year / Semester** | Year 4, Semester 2, 2026 |
| **Submission Deadline** | 30th September 2026, 11:59 PM |
 
---
 
## 🔗 Git Repository
 
📂 **[GitHub - tharangajw/Smart-Solar-Microgrid-Trading-System-](GitHub - tharangajw/Smart-Solar-Microgrid-Trading-System-)**
 
---
 
## 🎬 Video Demonstration
 
> A walkthrough of no more than 5 minutes explaining how the application works — covering the Web Application, Mobile Application, and Web API.
 
📺 **[Watch the Demo on YouTube](https://youtube.com/watch?v=demo123)**
 
> ⚠️ *Replace the above link with the real YouTube / OneDrive URL before final submission.*
 
---
 
## 👥 Individual Contributions
 
> **SE4040 Assignment Requirement** — Individual contributions of each group member are clearly stated below.
 
| # | Student Name | IT Number | Module Owned | Key Contributions |
|---|---|---|---|---|
| 1 | W.A.V. Nuwanga | IT23360396 | **👤 User & Authentication Product** | **Web:** Backoffice & Grid Operator login, role-based access control, user creation/activation/deactivation, pending activation view, role-based navigation · `GridOperatorsPage.jsx`, `ProsumerManagementPage.jsx`<br>**Android:** Prosumer registration (NIC as PK), prosumer login, profile view/edit, deactivation request, role-based home screen — `LoginActivity.kt`, `RegisterActivity.kt`, `ProfileActivity.kt`<br>**API:** `POST /api/auth/login`, `POST /api/users`, `GET /api/users`, `PUT /api/users/{id}`, `DELETE /api/users/{id}`, `POST /api/prosumers`, `GET /api/prosumers/{nic}`, `PUT /api/prosumers/{nic}` · Google, Facebook, Apple OAuth routes · database seeding for default accounts<br>**MongoDB:** `UserDetails` / `Prosumer` collections |
| 2 | A.M.K.B. Adikari | IT23241732 | **⚡ Microgrid & Slot Management Product** | **Web:** Create/edit/deactivate microgrid nodes with GPS coordinates, capacity (kW/h), battery storage slots and operational schedule; slot availability management — `StationList.jsx` with OpenStreetMap location picker<br>**Business Rule:** Deactivation blocked if active reservations exist → 409 Conflict enforced in `NodesController.cs`<br>**Android:** Nearby station data consumption; station list display<br>**API:** `POST /api/nodes`, `GET /api/nodes`, `GET /api/nodes/{id}`, `PUT /api/nodes/{id}`, `DELETE /api/nodes/{id}`, `POST /api/slots`, `GET /api/slots`, `PUT /api/slots/{id}` · Haversine near-me radius filtering · atomic `ReserveSlotAsync` / `ReleaseSlotAsync` in `StationService.cs`<br>**MongoDB:** `SolarStationInfo`, `EnergyBookingSlots` collections |
| 3 | J.K.C.T. Jayawardhana | IT23171992 | **📅 Energy Reservation & Booking Product** | **Web:** React web app base architecture (shared layout, Tailwind styling, React Router v7) · `ReservationManagementPage.jsx` with create/edit/cancel modals, status badge filters, stats cards · `ReservationsPage.jsx` with NIC/date/status filters<br>**Android:** View available slots, create/modify/cancel reservation, booking summary screen after each action, pending bookings list, booking history, search & filter — `CreateReservationActivity.kt`, `ReservationHistoryActivity.kt`, `SlotSelectionActivity.kt`<br>**Business Rules:** 7-day booking window enforced; ≥12-hour notice required for updates/cancellations (UTC-safe) in `ReservationService.cs`<br>**Dashboard:** Current bookings, pending bookings, booking history, approved future reservation count, search/filter<br>**API:** `POST /api/reservations`, `GET /api/reservations`, `GET /api/reservations/{id}`, `PUT /api/reservations/{id}`, `DELETE /api/reservations/{id}`, `GET /api/reservations/history`, `GET /api/reservations/pending`<br>**MongoDB:** `EnergyReservation` collection |
| 4 | E.M.G.T. Edirisinha | IT23243644 | **📱 Operator & Transaction Product** | **Android Operator Mode:** Grid Operator login → scan prosumer QR (`QRScannerActivity.kt`, ZXing) → extract transaction ID → call Web API → verify server data → display reservation → confirm energy transfer → mark job as DONE<br>**QR Flow:** QR generation for approved reservations (`QRDisplayActivity.kt`) · 2-step backend verification: `POST /api/operator/approve/{id}` (Pending→Approved) → `POST /api/operator/scan-qr` (Approved→Completed) · local status override via `SessionManager`<br>**Google Maps:** Nearby microgrid nodes plotted from API lat/lng (`StationMapActivity.kt`), auto-refresh every 5s, station detail bottom card with Book Slot action<br>**Web:** Grid Operator Dashboard (`OperatorDashboard.jsx`) with live stats — total bookings, pending, approved, active stations · `OperatorDashboardService.cs`<br>**API:** `GET /api/operator/bookings`, `POST /api/operator/approve/{id}`, `POST /api/operator/scan-qr`, `GET /api/nodes/nearby` · `OperatorTransactionService.cs` |
 
---
 
Developed with ❤️ by the **Smart Solar Microgrid Team**.
