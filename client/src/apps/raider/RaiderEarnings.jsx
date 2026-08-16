import React, { useState } from 'react';
import { LayoutDashboard, Wallet, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api';
import RaiderHeader from './RaiderHeader';

export default function RaiderEarnings({ user, onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDepositCash = async () => {
    setLoading(true);
    try {
      const res = await api.post('/raider/deposit-cash', { userId: user._id });
      if (res.data.success) {
        alert('Deposit request sent to Hub Manager. Pending approval.');
      } else {
        alert(res.data.error || 'Failed to deposit cash');
      }
    } catch (err) {
      alert('Deposit flow triggered! (Backend endpoint required)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 font-sans relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#fb5c00]/20 to-[#83C5BE]/30 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/4 mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#fb5c00]/15 to-transparent rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/4 mix-blend-multiply"></div>

      <RaiderHeader user={user} onLogout={onLogout} />

      <main className="p-4 md:p-6 max-w-4xl mx-auto mt-4 pb-24 md:pb-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/40 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Earnings & Cash</h3>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-white/60 backdrop-blur-sm border border-white/60 p-6 rounded-3xl shadow-[0_4px_15px_-4px_rgba(0,0,0,0.03)] flex justify-between items-center transition-all hover:bg-white/70 hover:shadow-md">
              <div>
                <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Today's Earnings</p>
                <p className="text-4xl font-black text-slate-900 tracking-tight">₹{user?.raiderDetails?.earnings?.totalEarnings || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Performance</p>
                <p className="text-xl font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-xl shadow-inner">{user?.raiderDetails?.performance?.completionRate || 100}%</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#fb5c00]/10 to-orange-500/5 border border-[#fb5c00]/20 p-6 rounded-3xl relative overflow-hidden shadow-sm transition-all hover:shadow-md">
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#fb5c00]/10 rounded-tl-full blur-xl"></div>
              <p className="text-[10px] sm:text-xs font-black text-[#fb5c00] uppercase tracking-widest mb-1">Cash in Hand (Pending Deposit)</p>
              <p className="text-4xl font-black text-[#fb5c00] tracking-tight mb-2">₹{user?.raiderDetails?.earnings?.pendingDeposit || 0}</p>
              <p className="text-xs font-bold text-orange-800/70">Deposit this cash to the Hub Manager at the end of your shift.</p>
            </div>
          </div>

          <button 
            onClick={handleDepositCash}
            disabled={!user?.raiderDetails?.earnings?.pendingDeposit || loading}
            className="w-full py-4 bg-gradient-to-r from-[#0F172A] to-slate-800 text-white font-black rounded-2xl text-base sm:text-lg shadow-[0_8px_20px_-6px_rgba(15,23,42,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(15,23,42,0.6)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Deposit Cash to Hub'}
          </button>
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-3xl border-t border-white/60 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-40 px-6 py-4 pb-6 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          <span className="text-[10px] font-black">Dashboard</span>
        </button>
        <button onClick={() => navigate('/earnings')} className="flex flex-col items-center gap-1 text-[#fb5c00]">
          <div className="w-9 h-9 rounded-2xl bg-[#fb5c00]/10 flex items-center justify-center">
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
        <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center">
            <SettingsIcon size={20} />
          </div>
          <span className="text-[10px] font-black">Settings</span>
        </button>
      </div>
    </div>
  );
}
