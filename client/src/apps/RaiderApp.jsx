import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import RaiderOnboarding from './raider/RaiderOnboarding';
import RaiderDashboard from './raider/RaiderDashboard';
import LoginScreen from '../components/Auth/LoginScreen';

export default function RaiderApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('zypergo_token'));

  if (!isAuthenticated) {
    return <LoginScreen role="Raider" onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<RaiderDashboard />} />
      <Route path="/onboarding" element={<RaiderOnboarding />} />
    </Routes>
  );
}
