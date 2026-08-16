import React, { useState } from 'react';
import { Bell, Lock, ShieldCheck, Map, Smartphone, LogOut, LayoutDashboard, Wallet, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import RaiderHeader from './RaiderHeader';

export default function RaiderSettings({ user, onLogout }) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    smsNotifications: false,
    locationTracking: true,
    autoAcceptJobs: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 font-sans relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#fb5c00]/20 to-[#83C5BE]/30 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/4 mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#fb5c00]/15 to-transparent rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/4 mix-blend-multiply"></div>

      <RaiderHeader user={user} onLogout={onLogout} />

      <main className="p-4 md:p-6 max-w-5xl mx-auto mt-4 pb-24 md:pb-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-white/60 flex items-center gap-3 bg-white/40 backdrop-blur-md">
              <Bell size={24} className="text-[#fb5c00]" />
              <h3 className="font-black text-slate-900 text-lg">Notifications</h3>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all">
                <div>
                  <p className="font-black text-slate-800">Push Notifications</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Get alerts for new jobs</p>
                </div>
                <button 
                  onClick={() => toggleSetting('pushNotifications')}
                  className={`w-14 h-7 rounded-full transition-colors relative shadow-inner ${settings.pushNotifications ? 'bg-gradient-to-r from-[#fb5c00] to-orange-500 shadow-md' : 'bg-slate-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 shadow-md transition-transform ${settings.pushNotifications ? 'translate-x-7.5 left-[1px]' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all">
                <div>
                  <p className="font-black text-slate-800">SMS Alerts</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Receive critical alerts</p>
                </div>
                <button 
                  onClick={() => toggleSetting('smsNotifications')}
                  className={`w-14 h-7 rounded-full transition-colors relative shadow-inner ${settings.smsNotifications ? 'bg-gradient-to-r from-[#fb5c00] to-orange-500 shadow-md' : 'bg-slate-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 shadow-md transition-transform ${settings.smsNotifications ? 'translate-x-7.5 left-[1px]' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-white/60 flex items-center gap-3 bg-white/40 backdrop-blur-md">
              <Smartphone size={24} className="text-[#fb5c00]" />
              <h3 className="font-black text-slate-900 text-lg">App Preferences</h3>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all">
                <div>
                  <p className="font-black text-slate-800 flex items-center gap-2"><Map size={18} className="text-slate-400"/> Location Tracking</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Required for live tracking</p>
                </div>
                <button 
                  onClick={() => toggleSetting('locationTracking')}
                  className={`w-14 h-7 rounded-full transition-colors relative shadow-inner ${settings.locationTracking ? 'bg-gradient-to-r from-[#fb5c00] to-orange-500 shadow-md' : 'bg-slate-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 shadow-md transition-transform ${settings.locationTracking ? 'translate-x-7.5 left-[1px]' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden md:col-span-2"
          >
            <div className="p-6 border-b border-white/60 flex items-center gap-3 bg-white/40 backdrop-blur-md">
              <ShieldCheck size={24} className="text-[#fb5c00]" />
              <h3 className="font-black text-slate-900 text-lg">Security & Account</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="w-full text-left p-5 bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-md border border-white/60 hover:-translate-y-0.5 transition-all rounded-2xl font-black text-slate-700 flex justify-between items-center">
                Change Password <Lock size={18} className="text-slate-400" />
              </button>
              <button className="w-full text-left p-5 bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-md border border-white/60 hover:-translate-y-0.5 transition-all rounded-2xl font-black text-slate-700 flex justify-between items-center">
                Privacy Policy
              </button>
            </div>
          </motion.div>

        </div>

        {onLogout && (
          <button onClick={onLogout} className="w-full max-w-md mx-auto mt-10 bg-gradient-to-r from-red-500 to-red-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(239,68,68,0.6)] hover:-translate-y-1 transition-all">
            <LogOut size={20} /> Sign Out of Raider App
          </button>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-3xl border-t border-white/60 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-40 px-6 py-4 pb-6 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          <span className="text-[10px] font-black">Dashboard</span>
        </button>
        <button onClick={() => navigate('/earnings')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center">
            <Wallet size={20} />
          </div>
          <span className="text-[10px] font-black">Earnings</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center">
            <UserIcon size={20} />
          </div>
          <span className="text-[10px] font-black">Profile</span>
        </button>
        <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-1 text-[#fb5c00]">
          <div className="w-9 h-9 rounded-2xl bg-[#fb5c00]/10 flex items-center justify-center">
            <SettingsIcon size={20} />
          </div>
          <span className="text-[10px] font-black">Settings</span>
        </button>
      </div>
    </div>
  );
}
