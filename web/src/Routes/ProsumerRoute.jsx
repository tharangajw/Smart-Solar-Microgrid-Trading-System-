import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProsumerRoute = () => {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userRaw || '{}');
    if (user.role !== 'Prosumer' && user.Role !== 'Prosumer') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProsumerRoute;
