import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function ProtectedRoute({ isAuthenticated: propIsAuth, children }) {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('zypergo_token'));
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('zypergo_token');
      setIsAuth(!!token);
    };

    checkAuth();
    window.addEventListener('focus', checkAuth);
    window.addEventListener('pageshow', checkAuth);

    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('pageshow', checkAuth);
    };
  }, [location.pathname]);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children ? children : <Outlet />;
}

export function PublicRoute({ isAuthenticated: propIsAuth, children }) {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('zypergo_token'));
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('zypergo_token');
      setIsAuth(!!token);
    };

    checkAuth();
    window.addEventListener('focus', checkAuth);
    window.addEventListener('pageshow', checkAuth);

    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('pageshow', checkAuth);
    };
  }, [location.pathname]);

  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }
  return children ? children : <Outlet />;
}
