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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/reservations/:id" element={<ReservationDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
