import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function ProtectedRoute({ requiredRole, children }) {
  const [isAuth, setIsAuth] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('zypergo_token');
      const userStr = localStorage.getItem('zypergo_user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const hasToken = !!token;
      const hasRole = requiredRole ? user?.role === requiredRole : true;
      
      setIsAuth(hasToken && hasRole);
      setIsChecking(false);
    };

    checkAuth();
    window.addEventListener('focus', checkAuth);
    window.addEventListener('pageshow', checkAuth);

    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('pageshow', checkAuth);
    };
  }, [location.pathname, requiredRole]);

  if (isChecking) return null;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children ? children : <Outlet />;
}

export function PublicRoute({ requiredRole, children }) {
  const [isAuth, setIsAuth] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('zypergo_token');
      const userStr = localStorage.getItem('zypergo_user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const hasToken = !!token;
      const hasRole = requiredRole ? user?.role === requiredRole : true;
      
      setIsAuth(hasToken && hasRole);
      setIsChecking(false);
    };

    checkAuth();
    window.addEventListener('focus', checkAuth);
    window.addEventListener('pageshow', checkAuth);

    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('pageshow', checkAuth);
    };
  }, [location.pathname, requiredRole]);

  if (isChecking) return null;

  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }
  return children ? children : <Outlet />;
}
