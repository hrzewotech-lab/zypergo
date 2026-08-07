import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import RaiderOnboarding from './raider/RaiderOnboarding';
import RaiderDashboard from './raider/RaiderDashboard';
import LoginScreen from '../components/Auth/LoginScreen';
import SignupScreen from '../components/Auth/SignupScreen';

export default function RaiderApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('zypergo_token'));
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/', { replace: true });
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen role="Raider" onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<SignupScreen role="Raider" onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<RaiderDashboard />} />
      <Route path="/onboarding" element={<RaiderOnboarding />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
