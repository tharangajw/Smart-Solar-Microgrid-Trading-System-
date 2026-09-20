import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../Modules/Home/HomePage';
import DashboardPage from '../Modules/Dashboard/DashboardPage';
import MicrogridNodesPage from '../Modules/Microgrid/MicrogridNodesPage';
import EnergySlotsPage from '../Modules/EnergySlots/EnergySlotsPage';
import ReservationsPage from '../Modules/Reservations/ReservationsPage';
import ReservationDetailPage from '../Modules/Reservations/ReservationDetailPage';
import MapPage from '../Modules/Map/MapPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/microgrid" element={<MicrogridNodesPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/slots" element={<EnergySlotsPage />} />
      <Route path="/reservations" element={<ReservationsPage />} />
      <Route path="/reservations/:id" element={<ReservationDetailPage />} />
    </Routes>
  );
};

export default AppRoutes;
