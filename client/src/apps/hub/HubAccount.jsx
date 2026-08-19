import React from 'react';
import { User, MapPin } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function HubAccount() {
  const { user, selectedHub, setSelectedHub, hubs } = useOutletContext();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 md:hidden">
      <div className="bg-white/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] flex flex-col items-center text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-50 pointer-events-none -z-10"></div>
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#006D77] to-[#83C5BE] flex items-center justify-center text-3xl font-black text-white shadow-[0_8px_20px_-6px_rgba(0,109,119,0.5)] border-4 border-white mb-4 transition-transform group-hover:scale-105">
          {user?.name?.substring(0, 2).toUpperCase() || 'U'}
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name || 'User'}</h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white/60 px-4 py-1.5 rounded-full mt-2 inline-block border border-white shadow-sm">{user?.role || 'Role'}</p>
        
        {hubs.length > 0 && (
          <div className="mt-8 w-full">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block text-left">Active Hub</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin size={16} className="text-[#006D77]" />
              </div>
              {hubs.length === 1 ? (
                <div className="w-full bg-white/60 backdrop-blur-md text-slate-800 font-bold pl-12 pr-4 py-4 rounded-2xl border border-white/80 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)]">
                  {hubs[0].name}
                </div>
              ) : (
                <>
                  <select
                    value={selectedHub?._id || ''}
                    onChange={(e) => setSelectedHub(hubs.find(h => h._id === e.target.value))}
                    className="w-full bg-white/60 backdrop-blur-md text-slate-800 font-bold pl-12 pr-4 py-4 rounded-2xl border border-white/80 outline-none focus:border-[#006D77] shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] appearance-none transition-all focus:ring-4 focus:ring-[#006D77]/10"
                  >
                    {hubs.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
