import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, User, Mail, Phone, KeyRound, ShieldCheck } from 'lucide-react';
import api from '../api';

export default function SignupPage() {
  const [role, setRole] = useState('Customer');
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
    if (otp.length !== 4) return;
    
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', { email, phone, role, otp });
      const { token } = res.data;
      
      let subdomain = 'customer';
      if (role === 'Raider') subdomain = 'raider';
      if (role === 'Hamali') subdomain = 'hamali';

      const currentHost = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseDomain = currentHost.replace(/^(admin\.|customer\.|raider\.|hamali\.)/, '');
      
      window.location.href = `http://${subdomain}.${baseDomain}${port}/?token=${token}`;
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center font-sans bg-[#f8f9fa] p-4">
      <div className="mb-6 flex gap-2 p-1 bg-white rounded-lg shadow-sm border border-slate-200">
        {['Customer', 'Raider', 'Hamali'].map(r => (
          <button 
            key={r} type="button"
            onClick={() => { setRole(r); setStep('details'); setError(''); }}
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
          <p className="text-sm text-slate-500">Create your {role.toLowerCase()} account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center mb-6 border border-red-200">
            {error}
          </div>
        )}

        {step === 'details' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><User size={16} /></div>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] border border-slate-200 rounded focus:outline-none focus:border-[#006D77] focus:ring-1 focus:ring-[#006D77] text-sm transition-all text-slate-800" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Mail size={16} /></div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] border border-slate-200 rounded focus:outline-none focus:border-[#006D77] focus:ring-1 focus:ring-[#006D77] text-sm transition-all text-slate-800" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Phone size={16} /></div>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="98765 43210" className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] border border-slate-200 rounded focus:outline-none focus:border-[#006D77] focus:ring-1 focus:ring-[#006D77] text-sm transition-all text-slate-800" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><KeyRound size={16} /></div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] border border-slate-200 rounded focus:outline-none focus:border-[#006D77] focus:ring-1 focus:ring-[#006D77] text-sm transition-all text-slate-800" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Confirm</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><KeyRound size={16} /></div>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fa] border border-slate-200 rounded focus:outline-none focus:border-[#006D77] focus:ring-1 focus:ring-[#006D77] text-sm transition-all text-slate-800" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2 pb-1">
              <input type="checkbox" required className="mt-1" />
              <p className="text-[11px] text-slate-500 leading-tight">
                I agree to the <a href="#" className="font-bold text-[#006D77]">Terms of Service</a> and <a href="#" className="font-bold text-[#006D77]">Privacy Policy</a>.
              </p>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#006D77] hover:bg-[#00585f] text-white text-sm font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-sm mt-2">
              {loading ? 'Processing...' : 'Create Account'} {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Enter 4-Digit OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" maxLength="4" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="1234" className="w-full text-center py-4 border-2 border-slate-200 rounded focus:border-[#006D77] outline-none font-mono font-bold text-2xl tracking-widest bg-[#f8f9fa] transition-colors" />
              </div>
              <p className="text-xs text-right text-[#006D77] font-bold mt-2 cursor-pointer hover:underline" onClick={() => { setStep('details'); setOtp(''); setError(''); }}>Change number?</p>
            </div>
            <button type="submit" disabled={loading || otp.length !== 4} className="w-full bg-[#006D77] text-white font-bold py-4 rounded shadow-lg hover:bg-[#00585f] disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Verifying...' : 'Verify & Continue'} <ShieldCheck size={18}/>
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-[13px] text-slate-500">
            Already have an account? <Link to="/login" className="font-bold text-[#003B46] hover:underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
