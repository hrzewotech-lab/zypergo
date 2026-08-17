import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Phone, KeyRound, ArrowRight, Eye, EyeOff, CheckCircle2, User, UserPlus } from 'lucide-react';
import api from '../../api';

export default function LoginScreen({ role, onLoginSuccess }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone', 'otp', or 'forgot_password'
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login-password'; // Adjust if register endpoint exists
      const res = await api.post(endpoint, { identifier, password, role });
      const data = res.data;
      
      localStorage.setItem('zypergo_token', data.token);
      localStorage.setItem('zypergo_user', JSON.stringify(data.data));
      onLoginSuccess(data.data);
    } catch (err) {
      setError(err.response?.data?.error || (mode === 'register' ? 'Registration failed' : 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!identifier || identifier.length < 5 || !isEmail) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: identifier });
      setError('');
      alert('Password reset link sent to your email');
      setStep('phone');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send password reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FFB703] flex flex-col font-sans relative overflow-hidden">
      
      {/* Header Section (Rapido Style) */}
      <div className="pt-8 pb-16 px-6 text-center">
        <img src="/images/logo.png" alt="ZyperGo Logo" className="h-12 w-auto object-contain mx-auto mb-4" />
        <h1 className="text-2xl font-black text-black tracking-tight flex items-center justify-center gap-2 uppercase">
          {step === 'forgot_password' ? 'Reset Password' : (mode === 'login' ? 'Welcome Back!' : 'Join ZyperGo')}
        </h1>
        <p className="text-sm font-bold text-slate-800 mt-1">
          {step === 'forgot_password' 
            ? 'Enter your email to reset your password.' 
            : 'Secure access to your logistics dashboard.'}
        </p>
      </div>

      {/* Main Content Card */}
      <div className="flex-1 bg-white sm:max-w-xl sm:mx-auto w-full rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col relative z-10">

        {/* Toggle Login/Register or Static Indicator */}
        {step !== 'forgot_password' && (
          !['HubManager', 'SuperAdmin', 'Hamali'].includes(role) ? (
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 relative z-10 w-full max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => { setMode('login'); setStep('phone'); }}
                className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  mode === 'login' ? 'bg-black text-[#FFB703] shadow-md active:scale-95' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User size={18} /> Login
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  mode === 'register' ? 'bg-black text-[#FFB703] shadow-md active:scale-95' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserPlus size={18} /> Register
              </button>
            </div>
          ) : (
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 w-full max-w-sm mx-auto">
              <div className="flex-1 py-3 text-sm font-black rounded-xl flex items-center justify-center gap-2 bg-black text-[#FFB703] shadow-md uppercase tracking-wider">
                <User size={18} /> Login
              </div>
            </div>
          )
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold text-center mb-6 border border-red-200">
            {error}
          </div>
        )}

        <div className="flex-1 flex flex-col">
          {step === 'phone' ? (
            <>
              {/* Login Method Tabs */}
              <div className="flex justify-center gap-6 mb-6">
                <button type="button" onClick={() => setLoginMethod('otp')} className={`pb-2 text-sm font-black uppercase tracking-wider transition-colors border-b-4 ${loginMethod === 'otp' ? 'text-black border-black' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>OTP {mode === 'login' ? 'Login' : 'Signup'}</button>
                <button type="button" onClick={() => setLoginMethod('password')} className={`pb-2 text-sm font-black uppercase tracking-wider transition-colors border-b-4 ${loginMethod === 'password' ? 'text-black border-black' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>Password</button>
              </div>

              <form onSubmit={loginMethod === 'password' ? handlePasswordLogin : handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Mobile Number or Email</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter mobile or email"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none font-bold text-slate-900 transition-all duration-200"
                    />
                  </div>
                </div>
                
                {loginMethod === 'password' && (
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none font-bold text-slate-900 transition-all duration-200"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {mode === 'login' && (
                      <div className="flex justify-end mt-2">
                        <button type="button" onClick={() => setStep('forgot_password')} className="text-xs font-bold text-slate-500 hover:text-black">Forgot Password?</button>
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" disabled={loading || identifier.length < 5} className="w-full bg-black text-[#FFB703] font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg mt-8 uppercase tracking-wide">
                  {loading ? 'Processing...' : (loginMethod === 'password' ? (mode === 'login' ? 'Login Securely' : 'Register Securely') : 'Send OTP')} <ArrowRight size={20}/>
                </button>
              </form>


              {/* Trust Badges */}
              <div className="grid grid-cols-4 gap-2 mt-8 mb-4 border-t border-slate-100 pt-6">
                {[
                  { icon: <ShieldCheck size={18} className="text-black mb-1" />, label: 'Secure Transit' },
                  { icon: <CheckCircle2 size={18} className="text-emerald-500 mb-1" />, label: 'Verified Partner' },
                  { icon: <svg className="w-[18px] h-[18px] text-[#FFB703] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>, label: 'Bank-Grade' },
                  { icon: <svg className="w-[18px] h-[18px] text-indigo-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>, label: 'Compliance' }
                ].map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-1 border border-slate-200">
                      {badge.icon}
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider leading-tight mt-1">{badge.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : step === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Enter 4-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    maxLength="4"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full text-center py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none font-mono font-bold text-2xl tracking-widest transition-all duration-200"
                  />
                </div>
                <p className="text-xs text-right text-black font-bold mt-3 cursor-pointer hover:underline" onClick={() => setStep('phone')}>
                  Change number?
                </p>
              </div>
              <button type="submit" disabled={loading || otp.length !== 4} className="w-full bg-black text-[#FFB703] font-black py-4 rounded-xl shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-lg uppercase tracking-wide transition-all mt-8">
                {loading ? 'Verifying...' : 'Secure Login'} <ShieldCheck size={20}/>
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none font-bold text-slate-900 transition-all duration-200"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading || identifier.length < 5} className="w-full bg-black text-[#FFB703] font-black py-4 rounded-xl shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-lg uppercase tracking-wide transition-all mt-8">
                {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={20}/>
              </button>
              <div className="text-center mt-6">
                <button type="button" onClick={() => setStep('phone')} className="text-[11px] font-black text-slate-500 hover:text-black uppercase tracking-wider">Back to Login</button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 pb-4 sm:pb-0 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-500 font-bold flex flex-col gap-1 items-center justify-center uppercase tracking-wider">
            <span className="flex items-center gap-1 text-black">
              <ShieldCheck size={14} /> By continuing, you agree to our
            </span>
            <span>
              <a href="#" className="font-black text-black hover:underline">Terms & Conditions</a>
              {' • '}
              <a href="#" className="font-black text-black hover:underline">Privacy Policy</a>
            </span>
          </p>
          <div className="mt-4 py-2 px-4 bg-slate-50 rounded-full inline-flex items-center gap-2 text-[10px] font-black text-slate-600 border border-slate-200 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-[#FFB703]" /> Trusted by 10,000+ businesses
          </div>
        </div>

      </div>
    </div>
  );
}

