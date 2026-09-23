import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const BackofficeRoute = () => {
  const token = localStorage.getItem('backoffice_token');
  const userRaw = localStorage.getItem('backoffice_user');

  if (!token) {
    return <Navigate to="/backoffice/login" replace />;
  }

  try {
    const user = JSON.parse(userRaw || '{}');
    if (user.role !== 'Backoffice') {
      localStorage.removeItem('backoffice_token');
      localStorage.removeItem('backoffice_user');
      return <Navigate to="/backoffice/login" replace />;
    }
  } catch {
    localStorage.removeItem('backoffice_token');
    localStorage.removeItem('backoffice_user');
    return <Navigate to="/backoffice/login" replace />;
  }

  return <Outlet />;
};

export default BackofficeRoute;
