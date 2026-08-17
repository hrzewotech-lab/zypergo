import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Star } from 'lucide-react';

export default function CustomerWelcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-white flex justify-center font-sans">
      {/* Mobile Constrained Container */}
      <div className="w-full max-w-md bg-white min-h-[100dvh] relative shadow-2xl flex flex-col items-center pt-20 pb-10 px-6">
        
        {/* Header Text */}
        <div className="text-center mb-8">
          <p className="text-sm font-bold text-slate-500 mb-2 tracking-widest uppercase">Welcome to</p>
          <img src="/images/logo.png" alt="ZyperGo Logo" className="h-12 mx-auto mb-4" />
          <h1 className="text-xl font-black text-slate-900 leading-tight">
            India's Reliable Logistics &<br />Parcel Delivery Partner
          </h1>
        </div>

        {/* Illustration Placeholder */}
        <div className="flex-1 flex items-center justify-center w-full my-8 relative">
          <div className="absolute inset-0 bg-[#006D77]/5 rounded-full blur-3xl"></div>
          {/* Mock Delivery Illustration */}
          <div className="relative w-64 h-64 bg-slate-50 rounded-full border border-slate-100 shadow-inner flex flex-col items-center justify-center text-[#006D77]">
             <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                <circle cx="17" cy="18" r="2"/>
                <circle cx="7" cy="18" r="2"/>
             </svg>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 translate-x-10 translate-y-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#FFB703" stroke="#b48102" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><path d="M9 4v16"/><path d="M15 4v16"/><path d="M4 9h16"/><path d="M4 15h16"/></svg>
             </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-4 mb-10">
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-[#006D77] text-white font-black py-4 rounded-xl text-lg shadow-[0_8px_20px_-6px_rgba(0,109,119,0.5)] hover:bg-[#00585f] active:scale-[0.98] transition-all"
          >
            Login / Sign Up
          </button>
          
        </div>

        {/* Footer features */}
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
           <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-[#006D77]" /> Secure</span>
           <span className="w-1 h-1 rounded-full bg-slate-300"></span>
           <span className="flex items-center gap-1"><Zap size={14} className="text-[#FFB703]" /> Fast</span>
           <span className="w-1 h-1 rounded-full bg-slate-300"></span>
           <span className="flex items-center gap-1"><Star size={14} className="text-amber-500" /> Reliable</span>
        </div>

      </div>
    </div>
  );
}
