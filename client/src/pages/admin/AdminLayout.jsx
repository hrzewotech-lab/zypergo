import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Map, Users, Menu, X, Home, Package, Truck, Network, FileText, Settings, DollarSign, LifeBuoy, Bell, Search, Megaphone, Scan, ShieldBan, RotateCcw, AlertCircle, Banknote } from 'lucide-react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState({ name: 'Admin', role: 'SuperAdmin' });

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
    { name: 'Control Tower', path: '/', icon: <Home size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'HubManager', 'DispatchManager', 'FinanceManager'] },
    { name: 'Bookings', path: '/bookings', icon: <Package size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'HubManager', 'HubOperator', 'DispatchManager', 'SupportExecutive', 'Auditor'] },
    { name: 'Hub Management', path: '/hubs', icon: <Network size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'HubManager'] },
    { name: 'Scanning & Manifests', path: '/scanning', icon: <Scan size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'HubManager', 'HubOperator', 'DispatchManager', 'Auditor'] },
    { name: 'Dispatch & Routing', path: '/dispatch', icon: <Truck size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'DispatchManager'] },
    { name: 'Rider Management', path: '/rider-management', icon: <Users size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'HubManager', 'DispatchManager'] },
    { name: 'Live Map', path: '/live-map', icon: <Map size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'HubManager', 'DispatchManager'] },
    { name: 'Finance & Pricing', path: '/finance', icon: <DollarSign size={18} />, roles: ['SuperAdmin', 'FinanceManager', 'Auditor'] },
    { name: 'Ledgers & Settlements', path: '/settlements', icon: <Banknote size={18} />, roles: ['SuperAdmin', 'FinanceManager', 'HubManager', 'Auditor'] },
    { name: 'Serviceability Engine', path: '/serviceability', icon: <ShieldBan size={18} />, roles: ['SuperAdmin', 'OperationsAdmin'] },
    { name: 'NDR & Exceptions', path: '/ndr', icon: <AlertCircle size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'SupportExecutive', 'HubManager'] },
    { name: 'Reverse Logistics', path: '/returns', icon: <RotateCcw size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'HubManager', 'DispatchManager'] },
    { name: 'Support Tickets', path: '/support', icon: <LifeBuoy size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'SupportExecutive'] },
    { name: 'Reports', path: '/reports', icon: <FileText size={18} />, roles: ['SuperAdmin', 'OperationsAdmin', 'FinanceManager', 'HubManager', 'Auditor'] },
    { name: 'Marketing', path: '/marketing', icon: <Megaphone size={18} />, roles: ['SuperAdmin', 'PartnerManager'] },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} />, roles: ['SuperAdmin'] }
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(user.role) || user.role === 'SuperAdmin');

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex text-slate-800">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-50 w-64 bg-[#0F172A] text-slate-300 transition-transform duration-300 ease-in-out flex flex-col shrink-0`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#FFB703] text-slate-900 flex items-center justify-center font-black">Z</div>
            <img src="/src/assets/logo.jpeg" alt="ZyperGo Logo" className="h-10" />
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-800 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#006D77] font-bold text-sm uppercase">{user.name.substring(0, 2)}</span>
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm text-white truncate">{user.name}</p>
              <p className="text-xs text-[#FFB703] font-medium truncate">{user.role}</p>
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
                    isActive 
                      ? 'bg-[#006D77]/20 text-[#00BCD4]' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon} {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-500">ZyperGo v2.0</span>
          <button onClick={handleLogout} className="text-xs text-red-400 font-bold hover:text-red-300 transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-600">
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search AWBs or Users..." 
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-[#006D77] outline-none w-64 lg:w-96"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-[#006D77] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#00585f] transition hidden md:block shadow-sm">
              + New Booking
            </button>
            <button className="text-slate-500 hover:text-slate-900 relative p-2 bg-slate-100 rounded-full">
              <Bell size={18} />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-slate-100 rounded-full"></span>
            </button>
            <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-100">
              Logout
            </button>
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
