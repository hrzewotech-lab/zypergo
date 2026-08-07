import React, { useState } from 'react';
import { User, Mail, Phone, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function SignupScreen({ role, onLoginSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('details'); // 'details' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp', { email, phone, role, name, password });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 4) {
      setError('OTP must be 4 digits');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const payload = { email, phone, role, otp };
      const res = await api.post('/auth/verify-otp', payload);
      const data = res.data;
      
      // Save to local storage
      localStorage.setItem('zypergo_token', data.token);
      localStorage.setItem('zypergo_user', JSON.stringify(data.data));
      onLoginSuccess(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 border border-slate-100">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FFB703] rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm">
            <span className="text-3xl font-black text-[#0F172A]">Z</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">ZyperGo {role}</h1>
          <p className="text-slate-500 mt-2">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center mb-6 border border-red-200">
            {error}
          </div>
        )}

        {step === 'details' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-bold text-sm transition-colors bg-[#f8f9fa]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-bold text-sm transition-colors bg-[#f8f9fa]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="98765 43210" className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-bold text-sm transition-colors bg-[#f8f9fa]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-bold text-sm transition-colors bg-[#f8f9fa]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-bold text-sm transition-colors bg-[#f8f9fa]" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? 'Processing...' : 'Create Account'} <ArrowRight size={18}/>
            </button>
            <p className="text-xs text-center text-slate-400 mt-4">
              By signing up, you agree to our Terms of Service.
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Enter 4-Digit OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  className="w-full text-center py-4 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-mono font-bold text-2xl tracking-widest transition-colors"
                />
              </div>
              <p className="text-xs text-right text-[#006D77] font-bold mt-2 cursor-pointer hover:underline" onClick={() => setStep('details')}>
                Change number?
              </p>
            </div>
            <button type="submit" disabled={loading || otp.length !== 4} className="w-full bg-[#006D77] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#00585f] disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Verifying...' : 'Verify & Continue'} <ShieldCheck size={18}/>
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-bold text-[#006D77] hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
