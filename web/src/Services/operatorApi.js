import axios from "axios";

const operatorApi = axios.create({
  baseURL: "https://localhost:5001/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// NOTE: Request interceptors can be added here later to inject the GridOperator token

export const getOperatorDashboard = () =>
  operatorApi.get("/operator/dashboard");

export const getOperatorBookings = (params) =>
  operatorApi.get("/operator/bookings", { params });

export const getBookingById = (id) =>
  operatorApi.get(`/reservations/${id}`);

export const getNodes = () =>
  operatorApi.get("/nodes");

export const getNodeById = (id) =>
  operatorApi.get(`/nodes/${id}`);

export const updateSlotAvailability = (id, data) =>
  operatorApi.put(`/slots/${id}`, data);

export default operatorApi;
