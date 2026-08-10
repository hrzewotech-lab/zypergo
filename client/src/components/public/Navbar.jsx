import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="ZyperGo Logo" className="h-10" />
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
            {['Home', 'Track', 'About', 'Features', 'Contact'].map(item => {
              const path = item === 'Home' ? '/' : `/${item.toLowerCase()}`;
              const isActive = location.pathname === path;
              return (
                <Link 
                  key={item} 
                  to={path}
                  className={`transition-colors relative group ${isActive ? 'text-[#fb5c00]' : 'hover:text-[#fb5c00]'}`}
                >
                  {item}
                  <span className={`absolute -bottom-1 left-0 h-0.5 transition-all ${isActive ? 'w-full bg-[#fb5c00]' : 'w-0 bg-[#fb5c00] group-hover:w-full'}`}></span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/login" className="text-sm font-bold text-slate-900 hover:text-[#fb5c00] transition-colors">Log In</Link>
          <Link to="/signup" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#fb5c00] transition-all shadow-lg hover:shadow-[#fb5c00]/30">
            Sign Up
          </Link>
        </div>

        <button className="md:hidden text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {['Home', 'Track', 'About', 'Features', 'Contact'].map(item => {
             const path = item === 'Home' ? '/' : `/${item.toLowerCase()}`;
             const isActive = location.pathname === path;
             return (
               <Link key={item} to={path} className={`font-semibold p-2 rounded-lg ${isActive ? 'text-[#fb5c00] bg-orange-50' : 'text-slate-700 hover:bg-slate-50'}`} onClick={() => setMobileMenuOpen(false)}>{item}</Link>
             );
          })}
          <div className="h-px w-full bg-slate-100 my-2"></div>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="font-bold text-center p-3 text-slate-900 border border-slate-200 rounded-lg hover:border-[#fb5c00] hover:text-[#fb5c00] transition-colors">Log In</Link>
          <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="font-bold text-center p-3 bg-[#fb5c00] text-white rounded-lg shadow-md hover:bg-orange-600 transition-colors">Sign Up</Link>
        </div>
      )}
    </header>
  );
}
