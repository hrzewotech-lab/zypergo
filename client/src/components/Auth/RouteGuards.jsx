import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children ? children : <Outlet />;
}

export function PublicRoute({ isAuthenticated, onClearAuth, children }) {
  useEffect(() => {
    // If a user navigates to a public auth route while logged in,
    // we assume they want to log out / switch accounts.
    if (isAuthenticated && onClearAuth) {
      onClearAuth();
    }
  }, [isAuthenticated, onClearAuth]);

  return children ? children : <Outlet />;
}
