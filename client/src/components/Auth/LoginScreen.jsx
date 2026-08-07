import React, { useState } from 'react';
import { ShieldCheck, Phone, KeyRound, ArrowRight } from 'lucide-react';
import api from '../../api';

export default function LoginScreen({ role, onLoginSuccess }) {
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmail = identifier.includes('@');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (identifier.length < 5) {
      setError('Please enter a valid email or phone number');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const payload = { role };
      if (isEmail) payload.email = identifier;
      else payload.phone = identifier;
      
      await api.post('/auth/send-otp', payload);
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
      const payload = { role, otp };
      if (isEmail) payload.email = identifier;
      else payload.phone = identifier;

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

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (identifier.length < 5 || !password) {
      setError('Please enter valid credentials');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login-password', { identifier, password, role });
      const data = res.data;
      
      // Save to local storage
      localStorage.setItem('zypergo_token', data.token);
      localStorage.setItem('zypergo_user', JSON.stringify(data.data));
      onLoginSuccess(data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
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
          <p className="text-slate-500 mt-2">Log in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center mb-6 border border-red-200">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <>
            <div className="flex border-b border-slate-200 mb-8">
              <button type="button" onClick={() => setLoginMethod('otp')} className={`flex-1 pb-3 text-sm font-bold transition-colors ${loginMethod === 'otp' ? 'text-[#006D77] border-b-2 border-[#006D77]' : 'text-slate-400 hover:text-slate-600'}`}>OTP Login</button>
              <button type="button" onClick={() => setLoginMethod('password')} className={`flex-1 pb-3 text-sm font-bold transition-colors ${loginMethod === 'password' ? 'text-[#006D77] border-b-2 border-[#006D77]' : 'text-slate-400 hover:text-slate-600'}`}>Password</button>
            </div>

            <form onSubmit={loginMethod === 'password' ? handlePasswordLogin : handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email or Phone Number</label>
                <div className="flex items-center relative">
                  <Phone className="absolute left-4 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@email.com or 9876543210"
                    className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-bold text-lg transition-colors"
                  />
                </div>
              </div>
              
              {loginMethod === 'password' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                  <div className="flex items-center relative">
                    <KeyRound className="absolute left-4 text-slate-400" size={20} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-bold text-lg transition-colors"
                    />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading || identifier.length < 5} className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Processing...' : (loginMethod === 'password' ? 'Login Securely' : 'Send OTP')} <ArrowRight size={18}/>
              </button>
              <p className="text-xs text-center text-slate-400 mt-4">By logging in, you agree to our Terms of Service.</p>
            </form>
          </>
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
              <p className="text-xs text-right text-[#006D77] font-bold mt-2 cursor-pointer hover:underline" onClick={() => setStep('phone')}>
                Change number?
              </p>
            </div>
            <button type="submit" disabled={loading || otp.length !== 4} className="w-full bg-[#006D77] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#00585f] disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Verifying...' : 'Secure Login'} <ShieldCheck size={18}/>
            </button>
            <p className="text-xs text-center text-slate-400 mt-4">
              {role === 'SuperAdmin' 
                ? 'Seed Admin: Use 9999999999 and OTP 1234'
                : 'Mock Mode: Use 1234 to bypass.'}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
