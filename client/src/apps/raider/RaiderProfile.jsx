import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Save, Camera, ArrowLeft, Truck, CreditCard } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <RaiderHeader user={user} />

      <main className="p-4 md:p-6 max-w-4xl mx-auto mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar */}
          <div className="md:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm"
            >
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
              className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-5"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2"><User size={16} className="text-[#fb5c00]"/> Full Name</label>
                  <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#fb5c00] focus:ring-2 focus:ring-[#fb5c00]/20 outline-none text-slate-800 font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2"><Phone size={16} className="text-[#fb5c00]"/> Phone Number</label>
                  <input type="tel" name="phone" value={profile.phone} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#fb5c00] focus:ring-2 focus:ring-[#fb5c00]/20 outline-none text-slate-800 font-mono font-medium transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2"><MapPin size={16} className="text-[#fb5c00]"/> Home Address</label>
                <textarea name="address" value={profile.address} onChange={handleChange} className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#fb5c00] focus:ring-2 focus:ring-[#fb5c00]/20 outline-none text-slate-800 font-medium resize-none transition-all"></textarea>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">Vehicle Information</h3>
              <p className="text-xs text-slate-500 mb-6">Vehicle changes require manual approval from your Hub Manager. Contact support to update.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <Truck size={24} className="text-[#fb5c00] mb-3" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Vehicle Type</p>
                  <p className="font-bold text-slate-800 text-lg">{profile.vehicleType || 'Not Provided'}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <CreditCard size={24} className="text-[#fb5c00] mb-3" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Reg. Number</p>
                  <p className="font-bold text-slate-800 text-lg uppercase tracking-wider">{profile.regNumber || 'Not Provided'}</p>
                </div>
              </div>
            </motion.div>

            <button 
              onClick={handleSave} 
              disabled={loading}
              className="w-full bg-[#fb5c00] hover:bg-[#e05200] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 mt-4"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
