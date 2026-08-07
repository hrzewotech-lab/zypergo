import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Mail, Download, KeyRound, ShieldCheck } from 'lucide-react';
import api from '../api';

export default function LoginPage() {
  const [role, setRole] = useState('Customer');
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone', 'email', 'password'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!identifier) return;
    
    setLoading(true);
    setError('');
    try {
      const payload = { role };
      if (loginMethod === 'phone') payload.phone = identifier;
      else payload.email = identifier;
      
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
    if (otp.length !== 4) return;
    
    setLoading(true);
    setError('');
    try {
      const payload = { role, otp };
      if (loginMethod === 'phone') payload.phone = identifier;
      else payload.email = identifier;

      const res = await api.post('/auth/verify-otp', payload);
      const { token } = res.data;
      
      // Redirect to subdomain with token
      let subdomain = 'customer';
      if (role === 'Raider') subdomain = 'raider';
      if (role === 'Hamali') subdomain = 'hamali';
      if (role === 'SuperAdmin' || role === 'Admin') subdomain = 'admin';

      const currentHost = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseDomain = currentHost.replace(/^(admin\.|customer\.|raider\.|hamali\.)/, '');
      
      window.location.href = `http://${subdomain}.${baseDomain}${port}/?token=${token}`;
      window.location.href = `http://${subdomain}.${baseDomain}${port}/?token=${token}`;
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login-password', { identifier, password, role });
      const { token } = res.data;
      
      let subdomain = 'customer';
      if (role === 'Raider') subdomain = 'raider';
      if (role === 'Hamali') subdomain = 'hamali';
      if (role === 'SuperAdmin' || role === 'Admin') subdomain = 'admin';

      const currentHost = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseDomain = currentHost.replace(/^(admin\.|customer\.|raider\.|hamali\.)/, '');
      
      window.location.href = `http://${subdomain}.${baseDomain}${port}/?token=${token}`;
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center font-sans bg-[#f8f9fa] p-4">
      <div className="mb-6 flex gap-2 p-1 bg-white rounded-lg shadow-sm border border-slate-200">
        {['Customer', 'Raider', 'Hamali'].map(r => (
          <button 
            key={r}
            onClick={() => { setRole(r); setStep('phone'); setError(''); }}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              role === r ? 'bg-[#003B46] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-xl border border-slate-100 p-10 w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#003B46] tracking-tight mb-2">ZYPERGO</h1>
          <p className="text-sm text-slate-500">Access your {role.toLowerCase()} control tower</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center mb-6 border border-red-200">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <>
            <div className="flex border-b border-slate-200 mb-8">
              <button type="button" onClick={() => setLoginMethod('phone')} className={`flex-1 pb-3 text-sm font-bold transition-colors ${loginMethod === 'phone' ? 'text-[#006D77] border-b-2 border-[#006D77]' : 'text-slate-400 hover:text-slate-600'}`}>Mobile OTP</button>
              <button type="button" onClick={() => setLoginMethod('email')} className={`flex-1 pb-3 text-sm font-bold transition-colors ${loginMethod === 'email' ? 'text-[#006D77] border-b-2 border-[#006D77]' : 'text-slate-400 hover:text-slate-600'}`}>Email OTP</button>
              <button type="button" onClick={() => setLoginMethod('password')} className={`flex-1 pb-3 text-sm font-bold transition-colors ${loginMethod === 'password' ? 'text-[#006D77] border-b-2 border-[#006D77]' : 'text-slate-400 hover:text-slate-600'}`}>Password</button>
            </div>

            <form onSubmit={loginMethod === 'password' ? handlePasswordLogin : handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {loginMethod === 'phone' ? 'Mobile Number' : loginMethod === 'email' ? 'Email Address' : 'Email or Mobile Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    {loginMethod === 'phone' ? <Smartphone size={16} /> : <Mail size={16} />}
                  </div>
                  <input type={loginMethod === 'phone' ? 'tel' : loginMethod === 'email' ? 'email' : 'text'} value={identifier} onChange={(e) => setIdentifier(loginMethod === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value)} placeholder={loginMethod === 'phone' ? '98765 43210' : loginMethod === 'email' ? 'name@company.com' : 'Enter email or phone'} className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] border border-slate-200 rounded focus:outline-none focus:border-[#006D77] focus:ring-1 focus:ring-[#006D77] text-sm transition-all text-slate-800" />
                </div>
              </div>

              {loginMethod === 'password' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><KeyRound size={16} /></div>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] border border-slate-200 rounded focus:outline-none focus:border-[#006D77] focus:ring-1 focus:ring-[#006D77] text-sm transition-all text-slate-800" />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-[#006D77] hover:bg-[#00585f] text-white text-sm font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-sm">
                {loading ? 'Processing...' : (loginMethod === 'password' ? 'Login Securely' : 'Send Secure Code')} {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Enter 4-Digit OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" maxLength="4" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="1234" className="w-full text-center py-4 border-2 border-slate-200 rounded focus:border-[#006D77] outline-none font-mono font-bold text-2xl tracking-widest bg-[#f8f9fa] transition-colors" />
              </div>
              <p className="text-xs text-right text-[#006D77] font-bold mt-2 cursor-pointer hover:underline" onClick={() => { setStep('phone'); setOtp(''); setError(''); }}>Change number?</p>
            </div>
            <button type="submit" disabled={loading || otp.length !== 4} className="w-full bg-[#006D77] text-white font-bold py-4 rounded shadow-lg hover:bg-[#00585f] disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Verifying...' : 'Secure Login'} <ShieldCheck size={18}/>
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-[13px] text-slate-500">
            New to the platform? <Link to="/signup" className="font-bold text-[#003B46] hover:underline">Request Access</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
