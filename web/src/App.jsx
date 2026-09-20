import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import HomePage from './Modules/Home/HomePage';
import DashboardPage from './Modules/Dashboard/DashboardPage';

import OperatorLayout from './Modules/Operator/Layout/OperatorLayout';
import OperatorDashboard from './Modules/Operator/pages/OperatorDashboard';
import BookingMonitoring from './Modules/Operator/pages/BookingMonitoring';
import BookingDetails from './Modules/Operator/pages/BookingDetails';
import SlotAvailability from './Modules/Operator/pages/SlotAvailability';
import OperatorLogin from './Modules/Operator/pages/OperatorLogin';
import StationsMap from './Modules/Operator/pages/StationsMap';
import OperatorRoute from './Routes/OperatorRoute';

import BackofficeLayout from './Modules/Backoffice/Layout/BackofficeLayout';
import BackofficeLogin from './Modules/Backoffice/pages/BackofficeLogin';
import PendingActivationsPage from './Modules/Backoffice/pages/PendingActivationsPage';
import ProsumerManagementPage from './Modules/Backoffice/pages/ProsumerManagementPage';
import BackofficeRoute from './Routes/BackofficeRoute';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './Modules/Home/HomePage';
import DashboardPage from './Modules/Dashboard/DashboardPage';
import ReservationsPage from './Modules/Reservations/ReservationsPage';
import ReservationDetailPage from './Modules/Reservations/ReservationDetailPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Navigate to="/backoffice/dashboard" replace />} />

        <Route path="/backoffice/login" element={<BackofficeLogin />} />
        <Route element={<BackofficeRoute />}>
          <Route path="/backoffice" element={<BackofficeLayout />}>
            <Route index element={<Navigate to="pending" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="pending" element={<PendingActivationsPage />} />
            <Route path="prosumers" element={<ProsumerManagementPage />} />
          </Route>
        </Route>

        <Route path="/operator/login" element={<OperatorLogin />} />
        <Route element={<OperatorRoute />}>
          <Route path="/operator" element={<OperatorLayout />}>
            <Route path="dashboard" element={<OperatorDashboard />} />
            <Route path="bookings" element={<BookingMonitoring />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="slots" element={<SlotAvailability />} />
            <Route path="map" element={<StationsMap />} />
          </Route>
        </Route>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/reservations/:id" element={<ReservationDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
