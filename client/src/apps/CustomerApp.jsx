import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import CustomerDashboard from './customer/CustomerDashboard';
import BookingFlow from './customer/BookingFlow';
import MyShipments from './customer/MyShipments';
import SupportCenter from './customer/SupportCenter';
import TrackingTimeline from './customer/TrackingTimeline';
import AddressBook from './customer/AddressBook';
import LoginScreen from '../components/Auth/LoginScreen';
import SignupScreen from '../components/Auth/SignupScreen';
import { ProtectedRoute, PublicRoute } from '../components/Auth/RouteGuards';
import { Search, Bell, Settings } from 'lucide-react';

function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('zypergo_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('zypergo_token');
    localStorage.removeItem('zypergo_user');
    window.location.href = '/login';
  };

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/shipments', label: 'Shipments' },
    { path: '/invoices', label: 'Invoices' },
    { path: '/support', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 shrink-0 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: Logo & Search */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-[#006D77] tracking-wider uppercase">
              <img src="/images/logo.png" alt="ZyperGo Logo" className="h-8" />
            </Link>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search shipments..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-md text-sm focus:ring-2 focus:ring-[#006D77] outline-none w-72"
              />
            </div>
          </div>
          
          {/* Middle: Navigation Links */}
          <nav className="hidden lg:flex gap-8 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className={`text-sm font-medium py-4 border-b-2 transition-colors ${
                    isActive ? 'border-[#006D77] text-[#006D77]' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/booking')} className="bg-[#00767C] text-white px-4 py-2 rounded font-medium text-sm hover:bg-[#005a5e] transition-colors shadow-sm">
              New Booking
            </button>
            <button className="text-slate-500 hover:text-slate-900 transition-colors p-1 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="text-slate-500 hover:text-slate-900 transition-colors p-1">
              <Settings size={20} />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 cursor-pointer" onClick={handleLogout} title="Logout">
               <img src="https://ui-avatars.com/api/?name=Logistics+Team&background=0D8ABC&color=fff" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function CustomerApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('zypergo_token'));
  const navigate = useNavigate();

  const handleClearAuth = () => {
    localStorage.removeItem('zypergo_token');
    localStorage.removeItem('zypergo_user');
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/', { replace: true });
  };

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute isAuthenticated={isAuthenticated} onClearAuth={handleClearAuth}>
          <LoginScreen role="Customer" onLoginSuccess={handleLoginSuccess} />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute isAuthenticated={isAuthenticated} onClearAuth={handleClearAuth}>
          <SignupScreen role="Customer" onLoginSuccess={handleLoginSuccess} />
        </PublicRoute>
      } />

      <Route path="/" element={
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <CustomerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<CustomerDashboard />} />
        <Route path="shipments" element={<MyShipments />} />
        <Route path="track/:id?" element={<TrackingTimeline />} />
        <Route path="address-book" element={<AddressBook />} />
        <Route path="support" element={<SupportCenter />} />
        <Route path="booking" element={<BookingFlow />} />
      </Route>
      
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
