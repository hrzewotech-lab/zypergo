import React, { useState } from 'react';
import { Bell, Lock, Shield, CreditCard, Smartphone, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CustomerSettings() {
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    smsAlerts: true,
    whatsappAlerts: false,
    promotions: false
  });

  const toggleToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      <h1 className="text-2xl font-black text-slate-900 mb-8">Account Settings</h1>
      
      <div className="space-y-6">
        {/* Notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#fb5c00]">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
              <p className="text-sm text-slate-500">Control how you want to be notified about shipments.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value], idx) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-bold text-slate-700 capitalize text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                </div>
                <button 
                  onClick={() => toggleToggle(key)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-[#fb5c00]' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : ''}`}></div>
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#fb5c00]">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Security & Password</h2>
              <p className="text-sm text-slate-500">Keep your account secure.</p>
            </div>
          </div>
          
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Current Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#fb5c00] outline-none text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-[#fb5c00] outline-none text-sm transition-all" />
            </div>
            <button className="bg-slate-900 hover:bg-[#fb5c00] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors mt-2">
              Update Password
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50 border border-red-100 rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-red-700 mb-1">Deactivate Account</h2>
              <p className="text-sm text-red-500">Permanently delete your account and all associated data.</p>
            </div>
            <button className="bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm">
              Deactivate
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
