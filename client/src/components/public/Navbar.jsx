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
          <Link to="/" className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">Z</div>
            ZYPERGO
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
            {['Home', 'About', 'Features', 'Contact'].map(item => (
              <Link 
                key={item} 
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className="hover:text-blue-600 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            <Globe size={16} /> EN
          </button>
          <div className="w-px h-6 bg-slate-200"></div>
          <Link to="/login" className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">Log In</Link>
          <Link to="/signup" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-600/30">
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
          {['Home', 'About', 'Features', 'Contact'].map(item => (
             <Link key={item} to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="font-semibold text-slate-700 p-2 hover:bg-slate-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>{item}</Link>
          ))}
          <div className="h-px w-full bg-slate-100 my-2"></div>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="font-bold text-center p-3 text-slate-900 border border-slate-200 rounded-lg">Log In</Link>
          <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="font-bold text-center p-3 bg-blue-600 text-white rounded-lg shadow-md">Sign Up</Link>
        </div>
      )}
    </header>
  );
}
