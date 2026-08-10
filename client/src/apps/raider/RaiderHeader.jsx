import React, { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Settings as SettingsIcon, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function RaiderHeader({ user, onLogout, onShowEarnings }) {
  const [isOnline, setIsOnline] = useState(user?.raiderDetails?.isOnline || false);
  const [isOnShift, setIsOnShift] = useState(user?.raiderDetails?.isOnShift || false);
  const [isOnBreak, setIsOnBreak] = useState(user?.raiderDetails?.isOnBreak || false);
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Sync state if user prop changes
  useEffect(() => {
    if (user?.raiderDetails) {
      setIsOnline(user.raiderDetails.isOnline || false);
      setIsOnShift(user.raiderDetails.isOnShift || false);
      setIsOnBreak(user.raiderDetails.isOnBreak || false);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShiftToggle = async (type) => {
    try {
      let payload = { userId: user._id };
      if (type === 'online') {
        payload.isOnline = !isOnline;
      } else if (type === 'shift') {
        payload.isOnShift = !isOnShift;
        if (!isOnShift) payload.isOnline = true;
        else {
          payload.isOnline = false;
          payload.isOnBreak = false;
        }
      } else if (type === 'break') {
        payload.isOnBreak = !isOnBreak;
        if (!isOnBreak) payload.isOnline = false;
      }

      const res = await api.post('/raider/shift', payload);
      if (res.data.success) {
         if (type === 'online') setIsOnline(payload.isOnline);
         if (type === 'shift') { setIsOnShift(payload.isOnShift); setIsOnline(payload.isOnline); setIsOnBreak(payload.isOnBreak || false); }
         if (type === 'break') { setIsOnBreak(payload.isOnBreak); setIsOnline(payload.isOnline); }
      }
    } catch (err) {
      alert('Failed to update shift status');
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('zypergo_token');
      localStorage.removeItem('zypergo_user');
      window.location.href = '/login';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex flex-wrap justify-between items-center z-50 sticky top-0 shadow-sm gap-4">
      <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-start">
        <img src="/images/logo.png" alt="ZyperGo Logo" className="h-6 md:h-8 cursor-pointer" onClick={() => navigate('/')} />
        <div className="hidden md:block h-6 w-px bg-slate-300"></div>
        <nav className="flex gap-4 md:gap-6">
          <button onClick={() => navigate('/')} className={`font-bold text-xs md:text-sm border-b-2 pb-1 transition-colors ${window.location.pathname === '/' ? 'text-[#fb5c00] border-[#fb5c00]' : 'text-slate-500 border-transparent hover:text-slate-800'}`}>Dashboard</button>
          <button onClick={() => onShowEarnings && onShowEarnings()} className="text-slate-500 font-bold text-xs md:text-sm hover:text-slate-800 pb-1 flex items-center gap-1">
             Earnings
          </button>
        </nav>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end flex-wrap pb-1 md:pb-0">
        {!isOnShift ? (
           <button onClick={() => handleShiftToggle('shift')} className="bg-[#fb5c00] text-white px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap shadow-sm hover:bg-[#e05200] transition">Start Shift</button>
        ) : (
           <>
             <button onClick={() => handleShiftToggle('break')} className={`px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold border transition whitespace-nowrap shadow-sm ${isOnBreak ? 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{isOnBreak ? 'End Break' : 'Take Break'}</button>
             <button onClick={() => handleShiftToggle('shift')} className="bg-slate-800 text-white px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap shadow-sm hover:bg-slate-900 transition">End Shift</button>
           </>
        )}

        <div className="bg-slate-100 rounded-full p-1 flex items-center ml-auto md:ml-2 shadow-inner">
          <button onClick={() => handleShiftToggle('online')} disabled={!isOnShift} className={`px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition whitespace-nowrap ${isOnline ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 opacity-50'}`}>Online</button>
          <button onClick={() => handleShiftToggle('online')} disabled={!isOnShift} className={`px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold transition whitespace-nowrap ${!isOnline ? 'bg-slate-400 text-white shadow-sm' : 'text-slate-400 opacity-50'}`}>Offline</button>
        </div>
        
        <div className="relative ml-2" ref={dropdownRef}>
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-full transition focus:outline-none"
          >
            <div className="w-9 h-9 bg-[#fb5c00] text-white rounded-full flex items-center justify-center font-bold shadow-sm uppercase text-xs border-2 border-white ring-1 ring-slate-200">
              {user?.name ? user.name.substring(0, 2) : 'RD'}
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 mb-2 bg-slate-50/50 rounded-t-xl mt-[-8px]">
                <p className="text-sm font-bold text-slate-900">{user?.name || 'Raider'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.phone || user?.email || 'No contact info'}</p>
              </div>
              
              <button onClick={() => { setProfileDropdownOpen(false); navigate('/profile'); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#fb5c00] flex items-center gap-3 font-medium transition">
                <UserIcon size={16} /> My Profile
              </button>
              <button onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#fb5c00] flex items-center gap-3 font-medium transition">
                <SettingsIcon size={16} /> Settings
              </button>
              
              <div className="mt-2 pt-2 border-t border-slate-100">
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-bold transition">
                  <LogOut size={16} /> Logout Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
