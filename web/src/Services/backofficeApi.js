import axios from 'axios';

// Use relative /api so Vite proxy forwards to C# Web API server
const BASE_URL = '/api';

/**
 * Dedicated Axios instance for System Administrator (Backoffice) management operations.
 */
const backofficeApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach backoffice JWT Bearer token to all outgoing requests
backofficeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('backoffice_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Automatically handle unauthorized 401 status by clearing tokens and redirecting to login
backofficeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('backoffice_token');
      localStorage.removeItem('backoffice_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/** Authenticates Backoffice administrator credentials. */
export const loginBackoffice = (email, password) =>
  backofficeApi.post('/auth/login', { email, password });

/** Fetches pending prosumer/operator account activation requests. */
export const getPendingActivations = () => backofficeApi.get('/Users/pending');

/** Retrieves all registered user accounts in the microgrid system. */
export const getAllUsers = () => backofficeApi.get('/Users');

/** Fetches a single user profile by MongoDB user ID. */
export const getUserById = (id) => backofficeApi.get(`/Users/${id}`);

/** Approves and activates a pending user account. */
export const activateUser = (id) => backofficeApi.post(`/Users/${id}/activate`);

/** Deactivates / suspends a user account. */
export const deactivateUser = (id) => backofficeApi.post(`/Users/${id}/deactivate`);

/** Creates a new user record from the administrative portal. */
export const createUser = (userData) => backofficeApi.post('/Users', userData);

/** Updates user profile attributes by ID. */
export const updateUser = (id, userData) => backofficeApi.put(`/Users/${id}`, userData);

/** Deletes a user record permanently. */
export const deleteUser = (id) => backofficeApi.delete(`/Users/${id}`);

/** Creates a new Grid Operator account. */
export const createGridOperator = (operatorData) =>
  backofficeApi.post('/Users/grid-operator', operatorData);

// ── Reservations Administrative Management ────────────────────────────────────

/** Searches/filters all system reservations by NIC, status, or date range. */
export const getAllReservations = (params) =>
  backofficeApi.get('/reservations/search', { params });

/** Creates a new reservation on behalf of a user. */
export const createReservation = (data) =>
  backofficeApi.post('/reservations', data);

/** Updates an existing reservation date or slot. */
export const updateReservation = (id, data) =>
  backofficeApi.put(`/reservations/${id}`, data);

/** Cancels a reservation with an administrative cancellation reason. */
export const cancelReservation = (id, data) =>
  backofficeApi.put(`/reservations/${id}/cancel`, data);

export default backofficeApi;
