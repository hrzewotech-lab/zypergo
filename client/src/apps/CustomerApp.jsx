import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import CustomerDashboard from './customer/CustomerDashboard';
import BookingFlow from './customer/BookingFlow';
import MyShipments from './customer/MyShipments';
import SupportCenter from './customer/SupportCenter';
import TrackingTimeline from './customer/TrackingTimeline';
import AddressBook from './customer/AddressBook';
import CustomerInvoices from './customer/CustomerInvoices';
import CustomerProfile from './customer/CustomerProfile';
import CustomerSettings from './customer/CustomerSettings';
import LoginScreen from '../components/Auth/LoginScreen';
import SignupScreen from '../components/Auth/SignupScreen';
import { ProtectedRoute, PublicRoute } from '../components/Auth/RouteGuards';
import { Search, Bell, Menu, X, ChevronDown, User as UserIcon, Settings } from 'lucide-react';

function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'Customer User', role: 'Customer' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    { path: '/track', label: 'Track' },
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
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-[#fb5c00] tracking-wider uppercase">
              <img src="/images/logo.png" alt="ZyperGo Logo" className="h-8" />
            </Link>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search shipments..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-md text-sm focus:ring-2 focus:ring-[#fb5c00] outline-none w-72 transition-all"
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
                    isActive ? 'border-[#fb5c00] text-[#fb5c00]' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/booking')} className="hidden md:block bg-[#fb5c00] text-white px-4 py-2 rounded font-medium text-sm hover:bg-[#e05200] transition-colors shadow-sm">
              New Booking
            </button>
            <button className="hidden md:block text-slate-500 hover:text-slate-900 transition-colors p-1 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            {/* Profile Dropdown */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors"
              >
                <div className="w-8 h-8 bg-[#fb5c00] text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                  {user?.name ? user.name.substring(0, 2) : 'CU'}
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Customer'}</p>
                    <p className="text-xs font-medium text-[#fb5c00] truncate">{user?.role || 'Customer'}</p>
                  </div>
                  
                  <div className="py-1">
                    <button onClick={() => { setProfileDropdownOpen(false); navigate('/profile'); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#fb5c00] transition-colors">
                      <UserIcon size={16} /> My Profile
                    </button>
                    <button onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#fb5c00] transition-colors">
                      <Settings size={16} /> Account Settings
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 font-bold hover:bg-red-50 transition-colors"
                    >
                      Logout Session
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile Menu Toggle */}
            <button className="lg:hidden text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            {navItems.map(item => {
               const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
               return (
                 <Link 
                   key={item.path} 
                   to={item.path} 
                   className={`font-semibold p-2 rounded-lg ${isActive ? 'text-[#fb5c00] bg-orange-50' : 'text-slate-700 hover:bg-slate-50'}`} 
                   onClick={() => setMobileMenuOpen(false)}
                 >
                   {item.label}
                 </Link>
               );
            })}
            <div className="h-px w-full bg-slate-100 my-2"></div>
            <button onClick={() => { navigate('/booking'); setMobileMenuOpen(false); }} className="w-full font-bold text-center p-3 bg-[#fb5c00] text-white rounded-lg shadow-md hover:bg-[#e05200] transition-colors">New Booking</button>
            <button onClick={handleLogout} className="w-full font-bold text-center p-3 text-slate-900 border border-slate-200 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors">Log Out</button>
          </div>
        )}
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
        <Route path="invoices" element={<CustomerInvoices />} />
        <Route path="track/:id?" element={<TrackingTimeline />} />
        <Route path="address-book" element={<AddressBook />} />
        <Route path="support" element={<SupportCenter />} />
        <Route path="booking" element={<BookingFlow />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="settings" element={<CustomerSettings />} />
      </Route>
      
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
