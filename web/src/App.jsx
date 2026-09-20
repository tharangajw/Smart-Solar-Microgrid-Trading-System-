import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Public / Backoffice imports
import HomePage from './Modules/Home/HomePage';
import DashboardPage from './Modules/Dashboard/DashboardPage';

// Operator imports — folder is lowercase 'pages'
import OperatorLayout from './Modules/Operator/Layout/OperatorLayout';
import OperatorDashboard from './Modules/Operator/pages/OperatorDashboard';
import BookingMonitoring from './Modules/Operator/pages/BookingMonitoring';
import BookingDetails from './Modules/Operator/pages/BookingDetails';
import SlotAvailability from './Modules/Operator/pages/SlotAvailability';
import OperatorLogin from './Modules/Operator/pages/OperatorLogin';
import StationsMap from './Modules/Operator/pages/StationsMap';
import OperatorRoute from './Routes/OperatorRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Operator Routes */}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
