import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import RaiderDashboard from './raider/RaiderDashboard';
import LoginScreen from '../components/Auth/LoginScreen';
import SignupScreen from '../components/Auth/SignupScreen';
import { ProtectedRoute, PublicRoute } from '../components/Auth/RouteGuards';
import api from '../api';

export default function RaiderApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('zypergo_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClearAuth = () => {
    localStorage.removeItem('zypergo_token');
    localStorage.removeItem('zypergo_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const userStr = localStorage.getItem('zypergo_user');
          if (userStr) {
             const u = JSON.parse(userStr);
             const res = await api.get(`/raider/me?userId=${u._id}`);
             if (res.data.success) {
                setUser(res.data.data);
                localStorage.setItem('zypergo_user', JSON.stringify(res.data.data));
             }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    navigate('/', { replace: true });
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-slate-500">Loading Profile...</div>;

  const approvalStatus = user?.raiderDetails?.approvalStatus;

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute isAuthenticated={isAuthenticated} onClearAuth={handleClearAuth}>
          <LoginScreen role="Raider" onLoginSuccess={handleLoginSuccess} />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute isAuthenticated={isAuthenticated} onClearAuth={handleClearAuth}>
          <SignupScreen role="Raider" onLoginSuccess={handleLoginSuccess} />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          {approvalStatus === 'Approved' ? (
            <RaiderDashboard user={user} />
          ) : (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="text-4xl">⏱</div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Pending</h2>
                <p className="text-slate-500 mb-6">Your application is currently under review by our operations team. We will notify you via email once you are approved to start accepting trips.</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200">
                  Check Status
                </button>
              </div>
            </div>
          )}
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
