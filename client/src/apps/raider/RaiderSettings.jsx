import React, { useState } from 'react';
import { Bell, Lock, ShieldCheck, Map, Smartphone, LogOut } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <RaiderHeader user={user} onLogout={onLogout} />

      <main className="p-4 md:p-6 max-w-5xl mx-auto mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
              <Bell size={24} className="text-[#fb5c00]" />
              <h3 className="font-bold text-slate-900 text-lg">Notifications</h3>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">Push Notifications</p>
                  <p className="text-xs text-slate-500 mt-1">Get alerts for new jobs and updates.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('pushNotifications')}
                  className={`w-14 h-7 rounded-full transition-colors relative shadow-inner ${settings.pushNotifications ? 'bg-[#fb5c00]' : 'bg-slate-300'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 shadow-md transition-transform ${settings.pushNotifications ? 'translate-x-7.5 left-[1px]' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">SMS Alerts</p>
                  <p className="text-xs text-slate-500 mt-1">Receive critical alerts via SMS.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('smsNotifications')}
                  className={`w-14 h-7 rounded-full transition-colors relative shadow-inner ${settings.smsNotifications ? 'bg-[#fb5c00]' : 'bg-slate-300'}`}
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
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
              <Smartphone size={24} className="text-[#fb5c00]" />
              <h3 className="font-bold text-slate-900 text-lg">App Preferences</h3>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-2"><Map size={18} className="text-slate-400"/> Live Location Tracking</p>
                  <p className="text-xs text-slate-500 mt-1">Required for customers to track deliveries.</p>
                </div>
                <button 
                  onClick={() => toggleSetting('locationTracking')}
                  className={`w-14 h-7 rounded-full transition-colors relative shadow-inner ${settings.locationTracking ? 'bg-[#fb5c00]' : 'bg-slate-300'}`}
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
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden md:col-span-2"
          >
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
              <ShieldCheck size={24} className="text-[#fb5c00]" />
              <h3 className="font-bold text-slate-900 text-lg">Security & Account</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 transition rounded-xl font-bold text-slate-700 flex justify-between items-center">
                Change Password <Lock size={18} className="text-slate-400" />
              </button>
              <button className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 transition rounded-xl font-bold text-slate-700 flex justify-between items-center">
                Privacy Policy
              </button>
            </div>
          </motion.div>

        </div>

        {onLogout && (
          <button onClick={onLogout} className="w-full max-w-md mx-auto mt-10 bg-red-50 text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition shadow-sm">
            <LogOut size={20} /> Sign Out of Raider App
          </button>
        )}
      </main>
    </div>
  );
}
