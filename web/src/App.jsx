import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MicrogridNodesPage from './Modules/Microgrid/MicrogridNodesPage';
import EnergySlotsPage from './Modules/EnergySlots/EnergySlotsPage';
import MapPage from './Modules/Map/MapPage';
import './App.css';

import HomePage from './Modules/Home/HomePage';
import DashboardPage from './Modules/Dashboard/DashboardPage';
import Login from './Modules/Authentication/Login';
import Register from './Modules/Authentication/Register';

import OperatorLayout from './Modules/Operator/Layout/OperatorLayout';
import OperatorDashboard from './Modules/Operator/pages/OperatorDashboard';
import BookingMonitoring from './Modules/Operator/pages/BookingMonitoring';
import BookingDetails from './Modules/Operator/pages/BookingDetails';
import SlotAvailability from './Modules/Operator/pages/SlotAvailability';
import StationsMap from './Modules/Operator/pages/StationsMap';
import OperatorRoute from './Routes/OperatorRoute';

import BackofficeLayout from './Modules/Backoffice/Layout/BackofficeLayout';
import BackofficeDashboard from './Modules/Backoffice/pages/BackofficeDashboard';
import GridOperatorsPage from './Modules/Backoffice/pages/GridOperatorsPage';
import BackofficeMicrogridNodesPage from './Modules/Backoffice/pages/MicrogridNodesPage';
import PendingActivationsPage from './Modules/Backoffice/pages/PendingActivationsPage';
import ProsumerManagementPage from './Modules/Backoffice/pages/ProsumerManagementPage';
import ReservationManagementPage from './Modules/Backoffice/pages/ReservationManagementPage';
import BackofficeRoute from './Routes/BackofficeRoute';
import ProsumerRoute from './Routes/ProsumerRoute';
import ReservationsPage from './Modules/Reservations/ReservationsPage';
import ReservationDetailPage from './Modules/Reservations/ReservationDetailPage';

import ReportsPage from './Modules/Reports/ReportsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<BackofficeRoute />}>
          <Route path="/backoffice" element={<BackofficeLayout />}>
            <Route index element={<Navigate to="pending" replace />} />
            <Route path="dashboard" element={<BackofficeDashboard />} />
            <Route path="operators" element={<GridOperatorsPage />} />
            <Route path="nodes" element={<BackofficeMicrogridNodesPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="pending" element={<PendingActivationsPage />} />
            <Route path="prosumers" element={<ProsumerManagementPage />} />
            <Route path="reservations" element={<ReservationManagementPage />} />
          </Route>
        </Route>

        <Route element={<OperatorRoute />}>
          <Route path="/operator" element={<OperatorLayout />}>
            <Route path="dashboard" element={<OperatorDashboard />} />
            <Route path="bookings" element={<BookingMonitoring />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="slots" element={<SlotAvailability />} />
            <Route path="map" element={<StationsMap />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Route>

        <Route element={<ProsumerRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/reservations/:id" element={<ReservationDetailPage />} />
        <Route path="/microgrid" element={<MicrogridNodesPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/slots" element={<EnergySlotsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
