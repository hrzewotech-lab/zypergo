import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import AdminLayout from '../pages/admin/AdminLayout';
import LiveMapPage from '../pages/admin/LiveMapPage';
import RiderManagementPage from '../pages/admin/RiderManagementPage';
import AdminDashboard from './admin/AdminDashboard';
import BookingManagement from './admin/BookingManagement';
import PlatformConfig from './admin/PlatformConfig';
import MarketingBroadcast from './admin/MarketingBroadcast';
import HubManagement from './admin/HubManagement';
import DispatchRouting from './admin/DispatchRouting';
import FinancePricing from './admin/FinancePricing';
import FinanceSettlements from './admin/FinanceSettlements';
import SupportTickets from './admin/SupportTickets';
import ServiceabilityEngine from './admin/ServiceabilityEngine';
import NdrExceptions from './admin/NdrExceptions';
import ReverseLogistics from './admin/ReverseLogistics';
import Reports from './admin/Reports';
import LoginScreen from '../components/Auth/LoginScreen';
import ScanningManifest from './admin/ScanningManifest';

function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('zypergo_token'));
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/', { replace: true });
  };
  
  if (!isAuthenticated) {
    return <LoginScreen role="SuperAdmin" onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="hubs" element={<HubManagement />} />
        <Route path="scanning" element={<ScanningManifest />} />
        <Route path="dispatch" element={<DispatchRouting />} />
        <Route path="rider-management" element={<RiderManagementPage />} />
        <Route path="live-map" element={<LiveMapPage />} />
        <Route path="finance" element={<FinancePricing />} />
        <Route path="settlements" element={<FinanceSettlements />} />
        <Route path="serviceability" element={<ServiceabilityEngine />} />
        <Route path="ndr" element={<NdrExceptions />} />
        <Route path="returns" element={<ReverseLogistics />} />
        <Route path="support" element={<SupportTickets />} />
        <Route path="reports" element={<Reports />} />
        <Route path="marketing" element={<MarketingBroadcast />} />
        <Route path="settings" element={<PlatformConfig />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AdminApp;
