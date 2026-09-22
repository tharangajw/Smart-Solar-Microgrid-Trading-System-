import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './Modules/Home/HomePage';
import DashboardPage from './Modules/Dashboard/DashboardPage';
import Login from './Modules/Authentication/Login';
import Register from './Modules/Authentication/Register';
import './App.css';

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
import ReservationsPage from './Modules/Reservations/ReservationsPage';
import ReservationDetailPage from './Modules/Reservations/ReservationDetailPage';
import MicrogridNodesPage from './Modules/Microgrid/MicrogridNodesPage';
import MapPage from './Modules/Map/MapPage';
import EnergySlotsPage from './Modules/EnergySlots/EnergySlotsPage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/reservations/:id" element={<ReservationDetailPage />} />
        <Route path="/microgrid" element={<MicrogridNodesPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/slots" element={<EnergySlotsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
