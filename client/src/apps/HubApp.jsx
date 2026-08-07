import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import HamaliDashboard from './hub/HamaliDashboard';
import LoginScreen from '../components/Auth/LoginScreen';

export default function HubApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('zypergo_token'));

  if (!isAuthenticated) {
    return <LoginScreen role="Hamali" onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<HamaliDashboard />} />
    </Routes>
  );
}
