import React, { useState, useEffect } from 'react';
import { KeyRound, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/reset-password', { token, password });
      // Clear old tokens to force user to login again
      localStorage.removeItem('zypergo_token');
      localStorage.removeItem('zypergo_user');
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 border border-slate-100">
        
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="ZyperGo Logo" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900">Create New Password</h1>
          <p className="text-slate-500 mt-2">Enter your new secure password below</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center mb-6 border border-red-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Password Reset Successful!</h2>
            <p className="text-slate-500 mb-6">Your password has been successfully updated. You can now log in with your new credentials.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="w-full bg-[#006D77] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#00585f] transition-colors"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password</label>
              <div className="flex items-center relative group">
                <KeyRound className="absolute left-4 text-slate-400 group-focus-within:text-[#006D77] transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-bold text-lg transition-colors bg-white"
                  disabled={!token}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm New Password</label>
              <div className="flex items-center relative group">
                <KeyRound className="absolute left-4 text-slate-400 group-focus-within:text-[#006D77] transition-colors" size={20} />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-bold text-lg transition-colors bg-white"
                  disabled={!token}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !token || !password || !confirmPassword} 
              className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Updating...' : 'Update Password'} <ArrowRight size={18}/>
            </button>
            
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => window.location.href = '/login'} 
                className="text-sm font-bold text-slate-500 hover:text-[#006D77]"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
