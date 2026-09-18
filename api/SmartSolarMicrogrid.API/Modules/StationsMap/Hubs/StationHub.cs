/*
 * StationHub.cs
 * SignalR Hub for broadcasting real-time solar station updates to connected clients.
 * Author: Member 4 - Operator Product
 */

using Microsoft.AspNetCore.SignalR;

namespace SmartSolarMicrogrid.API.Modules.StationsMap.Hubs
{
    public class StationHub : Hub
    {
        // Clients will listen to "ReceiveStationUpdate" events pushed from the server.
    }
}
