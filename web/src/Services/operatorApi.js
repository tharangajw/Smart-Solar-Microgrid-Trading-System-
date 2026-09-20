/**
 * operatorApi.js
 * Axios client for all Grid Operator API calls.
 * Includes a request interceptor that automatically attaches the stored JWT
 * Bearer token to every request so protected endpoints work without
 * manually passing headers from each component.
 *
 * Endpoints covered (all routed through the C# Web API):
 *   Auth       POST /auth/login
 *   Operator   GET  /operator/dashboard
 *              GET  /operator/reservations?status=
 *              POST /operator/approve/{id}
 *              POST /operator/scan-qr
 *   Stations   GET  /stations
 *              GET  /stations/nearby?lat=&lng=&radius=
 *              GET  /stations/{id}
 *              PUT  /stations/{id}/slots
 *
 * Author: Member 4 – Operator Product
 */

import axios from "axios";

// Read base URL from Vite environment variable (.env)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

// Create a shared Axios instance for the entire operator product
const operatorApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ───────────────────────────────────────────────────────
// Automatically attach the JWT Bearer token stored in localStorage to every request.
operatorApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("operator_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
// If the API returns 401 Unauthorized, clear the stored token and redirect to login.
operatorApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("operator_token");
      localStorage.removeItem("operator_user");
      window.location.href = "/operator/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Login with email and password. Returns JWT token + user object on success. */
export const loginOperator = (email, password) =>
  operatorApi.post("/auth/login", { email, password });

// ── Operator Dashboard & Reservations ─────────────────────────────────────────

/** Fetch aggregated dashboard statistics (counts, active stations, etc.). */
export const getOperatorDashboard = () =>
  operatorApi.get("/operator/dashboard");

/**
 * Fetch all reservations, optionally filtered by status.
 * @param {string|null} status - e.g. "Pending" | "Approved" | "Completed" | "Cancelled"
 */
export const getOperatorReservations = (status = null) =>
  operatorApi.get("/operator/reservations", {
    params: status ? { status } : {},
  });

// Kept as the page-level name used throughout the operator product.
export const getAllReservations = getOperatorReservations;

/**
 * Approve a pending reservation and generate a QR code.
 * Returns { message, qrCodeId } on success.
 * @param {string} reservationId - MongoDB ObjectId of the reservation
 */
export const approveReservation = (reservationId) =>
  operatorApi.post(`/operator/approve/${reservationId}`);

/**
 * Verify a scanned QR code and finalise the energy transfer.
 * @param {string} qrCodeId - UUID QR code scanned from the prosumer's device
 */
export const scanQrCode = (qrCodeId) =>
  operatorApi.post("/operator/scan-qr", { qrCodeId });

// ── Reservations (direct access) ──────────────────────────────────────────────

/** Fetch a single reservation by its MongoDB ObjectId. */
export const getReservationById = (id) =>
  operatorApi.get(`/reservations/${id}`);

// ── Solar Stations ────────────────────────────────────────────────────────────

/** Fetch all stations for the operator map overview. */
export const getAllStations = () =>
  operatorApi.get("/stations");

/**
 * Fetch stations within a given radius of a GPS coordinate.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in km (default 50)
 */
export const getNearbyStations = (lat, lng, radius = 50) =>
  operatorApi.get("/stations/nearby", { params: { lat, lng, radius } });

/** Fetch full details of a single station by ID. */
export const getStationById = (id) =>
  operatorApi.get(`/stations/${id}`);

/**
 * Update the available battery slot count for a station.
 * @param {string} id - Station MongoDB ObjectId
 * @param {number} availableSlots - New available slot count
 */
export const updateSlotAvailability = (id, availableSlots) =>
  operatorApi.put(`/stations/${id}/slots`, { availableSlots });

export default operatorApi;
