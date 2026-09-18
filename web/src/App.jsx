import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import HeroSection from './Components/HeroSection';
import HowItWorks from './Components/HowItWorks';
import StationHighlight from './Components/StationHighlight';
import EnergyConnection from './Components/EnergyConnection';
import MissionSection from './Components/MissionSection';
import Footer from './Components/Footer';
import './App.css';

// Operator Imports
import OperatorLayout from './Modules/Operator/Layout/OperatorLayout';
import OperatorDashboard from './Modules/Operator/Pages/OperatorDashboard';
import BookingMonitoring from './Modules/Operator/Pages/BookingMonitoring';
import BookingDetails from './Modules/Operator/Pages/BookingDetails';
import SlotAvailability from './Modules/Operator/Pages/SlotAvailability';
import OperatorLogin from './Modules/Operator/pages/OperatorLogin';
import OperatorRoute from './Routes/OperatorRoute';
import StationsMap from './Modules/Operator/pages/StationsMap';

const LandingPage = () => (
  <div className="min-h-screen bg-ivory font-sans text-charcoal">
    <Navbar />
    <main>
      <HeroSection />
      <HowItWorks />
      <StationHighlight />
      <EnergyConnection />
      <MissionSection />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<LandingPage />} />

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
