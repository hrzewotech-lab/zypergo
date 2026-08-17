import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HubManagerDashboard from './hub/HubManagerDashboard';
import LoginScreen from '../components/Auth/LoginScreen';
import HubWelcome from './hub/HubWelcome';
import { ProtectedRoute, PublicRoute } from '../components/Auth/RouteGuards';

export default function HubApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('zypergo_token'));
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/dashboard', { replace: true });
  };

  const handleClearAuth = () => {
    localStorage.removeItem('zypergo_token');
    localStorage.removeItem('zypergo_user');
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <PublicRoute requiredRole="HubManager">
          <HubWelcome />
        </PublicRoute>
      } />
      
      <Route path="/login" element={
        <PublicRoute requiredRole="HubManager">
          <LoginScreen role="HubManager" onLoginSuccess={handleLoginSuccess} />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute requiredRole="HubManager">
          <HubManagerDashboard onLogout={handleClearAuth} />
        </ProtectedRoute>
      } />
      
      {/* Wildcard */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}
