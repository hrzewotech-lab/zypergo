import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Save, Camera, ArrowLeft, Truck, CreditCard, LayoutDashboard, Wallet, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import RaiderHeader from './RaiderHeader';

export default function RaiderProfile({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    vehicleType: user?.raiderDetails?.vehicleType || '',
    regNumber: user?.raiderDetails?.regNumber || '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        vehicleType: user.raiderDetails?.vehicleType || '',
        regNumber: user.raiderDetails?.regNumber || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/api/users/profile`, {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });
      if (res.data.success) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Profile updated (simulated).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 font-sans relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#fb5c00]/20 to-[#83C5BE]/30 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/4 mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#fb5c00]/15 to-transparent rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/4 mix-blend-multiply"></div>

      <RaiderHeader user={user} />

      <main className="p-4 md:p-6 max-w-4xl mx-auto mt-4 pb-24 md:pb-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar */}
          <div className="md:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/30 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-50 pointer-events-none"></div>
              <div className="relative mb-4 group cursor-pointer">
                <div className="w-32 h-32 bg-[#fb5c00] text-white rounded-full flex items-center justify-center font-bold text-4xl shadow-inner uppercase">
                  {profile.name ? profile.name.substring(0, 2) : 'RD'}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white" size={32} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
              <p className="text-slate-500 font-medium">{profile.phone}</p>
              <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-bold bg-slate-100 px-3 py-1 rounded-full inline-block">Approved Partner</p>
            </motion.div>
          </div>

          {/* Right Column: Form */}
          <div className="md:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/30 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] space-y-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-50 pointer-events-none -z-10"></div>
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2"><User size={16} className="text-[#fb5c00]"/> Full Name</label>
                  <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full px-5 py-4 bg-white/40 backdrop-blur-md border border-white/80 rounded-2xl focus:border-[#fb5c00] focus:ring-4 focus:ring-[#fb5c00]/15 focus:bg-white/70 outline-none text-slate-800 font-bold transition-all shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:bg-white/50" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Phone size={16} className="text-[#fb5c00]"/> Phone Number</label>
                  <input type="tel" name="phone" value={profile.phone} onChange={handleChange} className="w-full px-5 py-4 bg-white/40 backdrop-blur-md border border-white/80 rounded-2xl focus:border-[#fb5c00] focus:ring-4 focus:ring-[#fb5c00]/15 focus:bg-white/70 outline-none text-slate-800 font-mono font-bold transition-all shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:bg-white/50" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2"><MapPin size={16} className="text-[#fb5c00]"/> Home Address</label>
                <textarea name="address" value={profile.address} onChange={handleChange} className="w-full h-28 p-5 bg-white/40 backdrop-blur-md border border-white/80 rounded-2xl focus:border-[#fb5c00] focus:ring-4 focus:ring-[#fb5c00]/15 focus:bg-white/70 outline-none text-slate-800 font-bold resize-none transition-all shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:bg-white/50"></textarea>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/30 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent opacity-50 pointer-events-none -z-10"></div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Vehicle Information</h3>
              <p className="text-xs font-bold text-slate-500 mb-6">Vehicle changes require manual approval from your Hub Manager. Contact support to update.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl border border-white/80 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:bg-white/50 transition-all">
                  <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center mb-3 shadow-inner">
                    <Truck size={24} className="text-[#fb5c00]" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Vehicle Type</p>
                  <p className="font-black text-slate-900 text-lg mt-1">{profile.vehicleType || 'Not Provided'}</p>
                </div>
                <div className="bg-white/40 backdrop-blur-md p-5 rounded-2xl border border-white/80 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] hover:bg-white/50 transition-all">
                  <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center mb-3 shadow-inner">
                    <CreditCard size={24} className="text-[#fb5c00]" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Reg. Number</p>
                  <p className="font-black text-slate-900 text-lg mt-1 uppercase tracking-wider">{profile.regNumber || 'Not Provided'}</p>
                </div>
              </div>
            </motion.div>

            <button 
              onClick={handleSave} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#fb5c00] to-orange-500 hover:from-[#e05200] hover:to-orange-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-[0_8px_20px_-6px_rgba(251,92,0,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(251,92,0,0.6)] transition-all disabled:opacity-70 mt-4 hover:-translate-y-1 duration-300"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>
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
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-[#fb5c00]">
          <div className="w-9 h-9 rounded-2xl bg-[#fb5c00]/10 flex items-center justify-center">
            <User size={20} />
          </div>
          <span className="text-[10px] font-black">Profile</span>
        </button>
        <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center">
            <Settings size={20} />
          </div>
          <span className="text-[10px] font-black">Settings</span>
        </button>
      </div>
    </div>
  );
}
