import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Save, Camera, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CustomerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/profile');
      const data = await res.json();
      if (data.success && data.data) {
        setProfile({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          company: data.data.company || '',
          address: data.data.address || ''
        });
        setOriginalEmail(data.data.email || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = async () => {
    setErrorMsg('');
    // If email has changed, trigger OTP workflow
    if (profile.email !== originalEmail) {
      setSaving(true);
      try {
        const res = await fetch('/api/users/request-email-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newEmail: profile.email })
        });
        const data = await res.json();
        
        if (data.success) {
          setShowOtpModal(true);
        } else {
          setErrorMsg(data.error || 'Failed to request email update.');
        }
      } catch (err) {
        setErrorMsg('Network error.');
      } finally {
        setSaving(false);
      }
    } else {
      // Standard save
      executeStandardSave();
    }
  };

  const executeStandardSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          company: profile.company,
          address: profile.address
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Profile updated successfully!');
        // Update local storage so navbar reflects name change
        const userData = JSON.parse(localStorage.getItem('zypergo_user')) || {};
        userData.name = profile.name;
        localStorage.setItem('zypergo_user', JSON.stringify(userData));
        window.dispatchEvent(new Event('storage'));
      } else {
        alert('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/users/verify-email-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: profile.email, otp })
      });
      const data = await res.json();
      if (data.success) {
        setShowOtpModal(false);
        setOriginalEmail(profile.email);
        setOtp('');
        // Now save the rest of the profile
        await executeStandardSave();
      } else {
        setErrorMsg(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setErrorMsg('Network error.');
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-[#fb5c00] border-t-transparent rounded-full animate-spin mx-auto"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-4 relative">
      <h1 className="text-2xl font-black text-slate-900 mb-8">My Profile</h1>
      
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 font-medium">
          {errorMsg}
        </div>
      )}

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
                {profile.name.substring(0, 2)}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={32} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-slate-500 font-medium">{profile.company}</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Customer Account</p>
          </motion.div>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-6">Personal Information</h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2"><User size={16} className="text-[#fb5c00]"/> Full Name</label>
                  <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#fb5c00] focus:ring-2 focus:ring-[#fb5c00]/20 outline-none text-slate-800 font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2"><Building size={16} className="text-[#fb5c00]"/> Company Name</label>
                  <input type="text" name="company" value={profile.company} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#fb5c00] focus:ring-2 focus:ring-[#fb5c00]/20 outline-none text-slate-800 font-medium transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2"><Mail size={16} className="text-[#fb5c00]"/> Email Address</label>
                  <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#fb5c00] focus:ring-2 focus:ring-[#fb5c00]/20 outline-none text-slate-800 font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2"><Phone size={16} className="text-[#fb5c00]"/> Phone Number</label>
                  <input type="tel" name="phone" value={profile.phone} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#fb5c00] focus:ring-2 focus:ring-[#fb5c00]/20 outline-none text-slate-800 font-medium transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2"><MapPin size={16} className="text-[#fb5c00]"/> Billing Address</label>
                <textarea rows="3" name="address" value={profile.address} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#fb5c00] focus:ring-2 focus:ring-[#fb5c00]/20 outline-none text-slate-800 font-medium transition-all"></textarea>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-[#fb5c00] hover:bg-[#e05200] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-70"
              >
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
          >
            <button 
              onClick={() => { setShowOtpModal(false); setProfile({...profile, email: originalEmail}); }} 
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-[#fb5c00] mb-6 mx-auto">
              <Mail size={32} />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 text-center mb-2">Verify Email</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              We sent a verification code to <strong>{profile.email}</strong>. Enter it below to confirm your new email address.
            </p>
            
            <input 
              type="text" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 4-digit code" 
              className="w-full text-center tracking-[0.5em] font-mono text-xl px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#fb5c00] focus:ring-2 focus:ring-[#fb5c00]/20 outline-none text-slate-800 font-bold transition-all mb-4"
              maxLength={4}
            />

            <button 
              onClick={handleVerifyOtp}
              disabled={otp.length < 4 || otpLoading}
              className="w-full bg-[#fb5c00] hover:bg-[#e05200] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {otpLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
              {otpLoading ? 'Verifying...' : 'Verify & Update Email'}
            </button>
            <p className="text-xs text-center text-slate-400 mt-4">Hint: Use 1234 for testing.</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
