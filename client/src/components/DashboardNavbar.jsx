import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';

export default function DashboardNavbar({ showSearch = false }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Book', path: '/book' },
    { name: 'Track', path: '/track' },
    { name: 'Rates', path: '/calculate' },
    { name: 'Partner', path: '/partner' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm shrink-0">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8 lg:gap-12">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-[#FFB703] text-slate-900 flex items-center justify-center font-black group-hover:scale-105 transition-transform">Z</div>
            <span className="text-xl font-bold tracking-widest text-[#003B46] uppercase hidden sm:block">
              ZyperGo
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {links.map((link) => {
              const isActive = currentPath === link.path || (currentPath === '/' && link.path === '/');
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors relative py-1 ${
                    isActive ? 'text-[#006D77]' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-[-13px] left-0 w-full h-[3px] bg-[#006D77] rounded-t-md"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          {showSearch && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-[#006D77] focus:bg-white outline-none w-48 lg:w-64 transition-all"
              />
            </div>
          )}

          <div className="hidden sm:flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-[#006D77] transition-colors">
              Login
            </Link>
            <Link to="/signup" className="bg-[#006D77] hover:bg-[#00585f] text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow">
              Sign Up
            </Link>
          </div>

          <button 
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white absolute top-full left-0 right-0 shadow-lg">
          <nav className="flex flex-col px-4 py-4 space-y-2">
            {links.map((link) => {
              const isActive = currentPath === link.path || (currentPath === '/' && link.path === '/');
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive ? 'bg-[#006D77]/10 text-[#006D77]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            <div className="border-t border-slate-100 mt-2 pt-4 flex flex-col gap-3 sm:hidden">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-sm font-bold text-slate-700 text-center hover:bg-slate-50 rounded-lg">
                Login
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="bg-[#006D77] text-white px-4 py-3 rounded-lg text-sm font-bold text-center">
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
