import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, Users, Menu, X, Home, Package, Truck, Network, FileText, Settings, DollarSign, LifeBuoy, Bell, Search, Megaphone, Scan, ShieldBan, RotateCcw, AlertCircle, Banknote, ChevronDown, User as UserIcon } from 'lucide-react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const [user, setUser] = useState({ name: 'Admin', role: 'SuperAdmin' });

  // Handle clicking outside of dropdown
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
    const saved = localStorage.getItem('zypergo_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('zypergo_token');
    localStorage.removeItem('zypergo_user');
    navigate('/login', { replace: true });
    // Force a full reload to clear all states
    window.location.reload();
  };

  const allMenuItems = [
    { name: 'Control Tower', path: '/', icon: <Home size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'DispatchManager', 'FinanceManager'] },
    { name: 'Bookings', path: '/bookings', icon: <Package size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'HubOperator', 'DispatchManager', 'SupportExecutive', 'Auditor'] },
    { name: 'Hub Management', path: '/hubs', icon: <Network size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'HubManager'] },
    { name: 'Scanning & Manifests', path: '/scanning', icon: <Scan size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'HubOperator', 'DispatchManager', 'Auditor'] },
    { name: 'Dispatch & Routing', path: '/dispatch', icon: <Truck size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'DispatchManager'] },
    { name: 'Rider Management', path: '/rider-management', icon: <Users size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'DispatchManager'] },
    { name: 'Live Map', path: '/live-map', icon: <Map size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'HubManager', 'DispatchManager'] },
    { name: 'Finance & Pricing', path: '/finance', icon: <DollarSign size={18} />, roles: ['SuperAdmin', 'FinanceManager', 'Auditor'] },
    { name: 'Ledgers & Settlements', path: '/settlements', icon: <Banknote size={18} />, roles: ['SuperAdmin', 'FinanceManager', 'HubManager', 'Auditor'] },
    { name: 'Serviceability Engine', path: '/serviceability', icon: <ShieldBan size={18} />, roles: ['SuperAdmin', 'OperationsAdmin'] },
    { name: 'NDR & Exceptions', path: '/ndr', icon: <AlertCircle size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'SupportExecutive', 'HubManager'] },
    { name: 'Reverse Logistics', path: '/returns', icon: <RotateCcw size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'HubManager', 'DispatchManager'] },
    { name: 'Support Tickets', path: '/support', icon: <LifeBuoy size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'SupportExecutive'] },
    { name: 'Reports', path: '/reports', icon: <FileText size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'OperationsStaff', 'FinanceManager', 'HubManager', 'Auditor'] },
    { name: 'Marketing', path: '/marketing', icon: <Megaphone size={18} />, roles: ['SuperAdmin', 'PartnerManager'] },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} />, roles: ['SuperAdmin'] }
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user.role) || user.role === 'SuperAdmin');

  return (
    <div className="h-screen overflow-hidden bg-slate-100 font-sans flex text-slate-800">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-50 w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200 text-slate-700 transition-transform duration-300 ease-in-out flex flex-col shrink-0 shadow-xl md:shadow-none`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="ZyperGo Logo" className="h-10" />
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-200 mb-2 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#006D77] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm uppercase">{user.name.substring(0, 2)}</span>
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-[#006D77] font-medium truncate">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <p className="px-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Main Menu</p>
          <nav className="space-y-1 px-3">
            {menuItems.map(item => {
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
              return (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${
                    isActive 
                      ? 'bg-[#006D77]/10 text-[#006D77] border-l-4 border-[#006D77]' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.icon} {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">ZyperGo v2.0</span>
          <button onClick={handleLogout} className="text-xs text-red-600 font-bold hover:text-red-500 transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-20 shrink-0 sticky top-0">
          <div className="flex items-center gap-3 md:gap-4 flex-1">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1 text-slate-600 hover:text-slate-900 transition-colors">
              <Menu size={24} />
            </button>
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search AWBs, Hubs, or Users..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-transparent rounded-lg text-sm focus:bg-white focus:border-[#006D77] focus:ring-2 focus:ring-[#006D77]/20 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5 ml-4">
            <button className="text-slate-500 hover:text-slate-900 relative p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <Bell size={18} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors"
              >
                <div className="w-8 h-8 bg-[#006D77] text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                  {user.name.substring(0, 2)}
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs font-medium text-[#006D77] truncate">{user.role}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link to="/settings" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#006D77] transition-colors">
                      <UserIcon size={16} /> My Profile
                    </Link>
                    <Link to="/settings" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#006D77] transition-colors">
                      <Settings size={16} /> Account Settings
                    </Link>
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
          </div>
        </header>

        {/* Dashboard Canvas */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
}
