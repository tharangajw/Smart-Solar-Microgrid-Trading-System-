/**
 * OperatorRoute.jsx
 * Protected route wrapper for the Operator Dashboard.
 * Checks localStorage for a valid JWT token and GridOperator role.
 * If not authenticated, redirects to the Operator Login page.
 * Author: Member 4 – Operator Product
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const OperatorRoute = () => {
  // Check for stored token and user info
  const token = localStorage.getItem('operator_token');
  const userRaw = localStorage.getItem('operator_user');

  // If no token exists, redirect to login
  if (!token) {
    return <Navigate to="/operator/login" replace />;
  }

  // Parse stored user and verify role is GridOperator
  try {
    const user = JSON.parse(userRaw || '{}');
    if (user.role !== 'GridOperator') {
      localStorage.removeItem('operator_token');
      localStorage.removeItem('operator_user');
      return <Navigate to="/operator/login" replace />;
    }
  } catch {
    // If parsing fails, clear storage and redirect
    localStorage.removeItem('operator_token');
    localStorage.removeItem('operator_user');
    return <Navigate to="/operator/login" replace />;
  }

  // User is authenticated – render child routes
  return <Outlet />;
};

export default OperatorRoute;
