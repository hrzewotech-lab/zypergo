import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, ArrowRight, Activity, Map, Boxes, Search } from 'lucide-react';

export default function HubWelcome() {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingId.trim()) {
      alert(`Tracking functionality for ${trackingId} is not implemented in Hub view.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative overflow-hidden flex flex-col">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#006D77]/20 to-teal-100/40 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/4 mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#FFB703]/20 to-orange-100/40 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/4 mix-blend-multiply"></div>

      {/* Header */}
      <header className="px-6 py-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="ZyperGo Logo" className="h-8 md:h-10 object-contain" />
          <span className="font-black text-2xl tracking-tight text-[#006D77] hidden sm:block">Zyper<span className="text-[#FFB703]">Hub</span></span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="bg-white/80 backdrop-blur-md border border-white/60 text-[#006D77] px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:shadow-md hover:bg-white hover:-translate-y-0.5 transition-all"
        >
          Manager Login
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10 max-w-5xl mx-auto w-full text-center">
        
        {/* Animated Icon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50/80 backdrop-blur-sm border border-teal-100/50 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-black tracking-widest text-[#006D77] uppercase">Central Operations Active</span>
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Manage Logistics <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006D77] to-teal-400">
            At Scale
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          The central nervous system for ZyperGo operations. Consolidate shipments, manage dispatch fleets, and ensure seamless regional connectivity.
        </p>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          
          <div className="group relative bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:bg-white hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#006D77]/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="w-14 h-14 bg-[#006D77]/10 text-[#006D77] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Boxes size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Hub Operations</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Process incoming shipments, create manifests, and dispatch regional line-haul vehicles efficiently.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-[#006D77] font-bold group/btn"
            >
              Access Portal 
              <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="group relative bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:bg-white hover:-translate-y-1 transition-all duration-300 overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB703]/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="w-14 h-14 bg-[#FFB703]/10 text-[#b58200] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Live Tracking</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Monitor active transhipments, track intercity routing, and verify real-time status of manifests.
            </p>
            <form onSubmit={handleTrack} className="flex gap-2 relative z-10">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Enter Manifest ID"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#FFB703] text-sm font-bold placeholder:font-medium"
                />
              </div>
              <button 
                type="submit"
                className="bg-slate-900 text-white px-4 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
              >
                Track
              </button>
            </form>
          </div>

        </div>
      </main>

      {/* Footer Grid */}
      <footer className="w-full max-w-5xl mx-auto px-6 pb-8 pt-12 z-10 border-t border-slate-200/50 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 font-bold text-xs">
            © 2026 ZyperGo Hub Operations
          </div>
          <div className="flex gap-6">
            <span className="text-slate-400 text-xs font-bold hover:text-slate-600 cursor-pointer transition-colors">Operations Manual</span>
            <span className="text-slate-400 text-xs font-bold hover:text-slate-600 cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
