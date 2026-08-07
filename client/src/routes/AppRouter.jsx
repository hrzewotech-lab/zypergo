import React, { useEffect, useState, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import PortalApp from '../apps/PortalApp';
import AdminApp from '../apps/AdminApp';
import CustomerApp from '../apps/CustomerApp';
import RaiderApp from '../apps/RaiderApp';
import HamaliApp from '../apps/HamaliApp';
import PartnerApp from '../apps/PartnerApp';
import HubApp from '../apps/HubApp';

function AppRouter() {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check if there is a token passed from the portal login
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('zypergo_token', token);
      // Remove token from URL to keep it clean and secure
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setAuthChecked(true);
  }, []);

  const subdomain = useMemo(() => {
    const hostname = window.location.hostname;
    // Check if the hostname starts with any of our subdomains or Vercel hyphenated prefixes
    if (hostname.startsWith('admin.') || hostname.startsWith('admin-')) return 'admin';
    if (hostname.startsWith('customer.') || hostname.startsWith('customer-')) return 'customer';
    if (hostname.startsWith('raider.') || hostname.startsWith('raider-')) return 'raider';
    if (hostname.startsWith('hamali.') || hostname.startsWith('hamali-')) return 'hamali';
    if (hostname.startsWith('partner.') || hostname.startsWith('partner-')) return 'partner';
    if (hostname.startsWith('hub.') || hostname.startsWith('hub-')) return 'hub';
    return 'portal'; // Default for www, localhost without subdomain, or any other domain
  }, []);

  if (!authChecked) return null;

  if (subdomain === 'admin') {
    return <AdminApp />;
  }

  if (subdomain === 'customer') {
    return <CustomerApp />;
  }

  if (subdomain === 'raider') {
    return <RaiderApp />;
  }

  if (subdomain === 'hamali') {
    return <HamaliApp />;
  }

  if (subdomain === 'partner') {
    return <PartnerApp />;
  }

  if (subdomain === 'hub') {
    return <HubApp />;
  }

  return <PortalApp />;
}

export default AppRouter;
