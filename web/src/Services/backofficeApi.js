import axios from 'axios';

// Use relative /api so Vite proxy forwards to http://localhost:5281
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const backofficeApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const loginBackoffice = (email, password) =>
  backofficeApi.post('/auth/login', { email, password });

export const getPendingActivations = () => backofficeApi.get('/Users/pending');

export const getAllUsers = () => backofficeApi.get('/Users');

export const getUserById = (id) => backofficeApi.get(`/Users/${id}`);

export const activateUser = (id) => backofficeApi.post(`/Users/${id}/activate`);

export const deactivateUser = (id) => backofficeApi.post(`/Users/${id}/deactivate`);

export const createUser = (userData) => backofficeApi.post('/Users', userData);

export const updateUser = (id, userData) => backofficeApi.put(`/Users/${id}`, userData);

export const deleteUser = (id) => backofficeApi.delete(`/Users/${id}`);

export const createGridOperator = (operatorData) =>
  backofficeApi.post('/Users/grid-operator', operatorData);

// ── Reservations ─────────────────────────────────────────────────────────────
export const getAllReservations = (params) =>
  backofficeApi.get('/reservations/search', { params });

export const createReservation = (data) =>
  backofficeApi.post('/reservations', data);

export const updateReservation = (id, data) =>
  backofficeApi.put(`/reservations/${id}`, data);

export const cancelReservation = (id, data) =>
  backofficeApi.put(`/reservations/${id}/cancel`, data);

export const approveReservation = (id) =>
  backofficeApi.post(`/backoffice/reservations/${id}/approve`);

export default backofficeApi;
