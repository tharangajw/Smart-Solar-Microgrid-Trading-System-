import { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

/**
 * useStationUpdates.js
 * Custom React hook that:
 * 1. Returns a [stations, setStations] pair (same API as useState).
 * 2. Opens a SignalR WebSocket connection to the backend hub and patches
 *    the station list in-place whenever a "ReceiveStationUpdate" event
 *    arrives — no polling, no REST call for the patch.
 *
 * The hook is purely a UI enhancement. All actual business operations
 * (load, update, reserve) still go through REST API calls.
 */
export const useStationUpdates = () => {
  const [stations, setStations] = useState([]);

  // Derive the SignalR hub URL from the same env var used by operatorApi.js
  // VITE_API_BASE_URL is e.g. "http://localhost:5001/api" → strip "/api" → hub base
  const hubUrl = useRef(() => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api';
    // Remove trailing "/api" to get the server root, then append the hub path
    return base.replace(/\/api\/?$/, '') + '/hubs/stations';
  });

  useEffect(() => {
    const url = hubUrl.current();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning) // reduce console noise
      .build();

    // Patch only the updated station without replacing the whole list
    connection.on('ReceiveStationUpdate', (updatedStation) => {
      setStations((prev) =>
        prev.map((s) => (s.id === updatedStation.id ? updatedStation : s))
      );
    });

    connection
      .start()
      .then(() => console.log('[SignalR] Connected to StationHub'))
      .catch((err) =>
        console.warn('[SignalR] Could not connect (live updates unavailable):', err.message)
      );

    return () => {
      connection.stop();
    };
  }, []); // run once on mount — no dependency on stations

  return [stations, setStations];
};
