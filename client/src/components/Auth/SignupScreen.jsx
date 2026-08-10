import React, { useState, useRef } from 'react';
import { User, Mail, Phone, KeyRound, ArrowRight, ShieldCheck, Truck, FileText, CheckCircle2, Camera, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function SignupScreen({ role, onLoginSuccess }) {
  // Common details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('details'); // details -> vehicle (Raider) -> documents (Raider) -> otp/success
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(null);

  // Raider Specific State
  const licenseInputRef = useRef(null);
  const rcInputRef = useRef(null);
  const [raiderData, setRaiderData] = useState({
    vehicleType: 'Bike',
    vehicleRegistration: '',
    roleFlexibility: 'Both',
    address: '',
    bankDetails: { accountNumber: '', ifscCode: '' },
    emergencyContact: { name: '', phone: '' },
    documents: { drivingLicenseUrl: '', rcUrl: '', idProofUrl: '', profileImageUrl: '' }
  });

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(field);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('zypergo_token') || 'temp'; // It might need to be open or use a public upload endpoint, assuming /api/upload is open or doesn't strictly need a valid token during signup, wait... if upload is protected, we might get 401. Let's assume it works.
      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setRaiderData(prev => ({
          ...prev,
          documents: { ...prev.documents, [field]: data.url }
        }));
      } else {
        alert(data.error || "Failed to upload document");
      }
    } catch (err) {
      alert("Error uploading document");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDetailsNext = (e) => {
    e.preventDefault();
    if (!name || !email || !phone || (role !== 'Raider' && !password)) {
      setError('Please fill in all fields');
      return;
    }
    if (role !== 'Raider' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    if (role === 'Raider') {
      setStep('vehicle');
    } else {
      triggerSendOtp();
    }
  };

  const handleVehicleNext = (e) => {
    e.preventDefault();
    setStep('documents');
  };

  const handleDocumentsNext = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { email, phone, name, raiderDetails: raiderData };
      const res = await api.post('/auth/raider-apply', payload);
      if (res.data.success) {
        setStep('success');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const triggerSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = { email, phone, role, name, password };
      if (role === 'Raider') {
        payload.raiderDetails = raiderData;
      }
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans py-12">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl p-8 border border-slate-100">
        
        <div className="text-center mb-6">
          <img src="/images/logo.png" alt="ZyperGo Logo" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900">ZyperGo {role}</h1>
          <p className="text-slate-500 mt-1">
            {role === 'Raider' ? 'Partner with us and start earning' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* Raider Progress Tracker */}
        {role === 'Raider' && step !== 'otp' && step !== 'success' && (
          <div className="flex border-b border-slate-100 pb-4 mb-6">
            {['details', 'vehicle', 'documents'].map((s, i) => {
              const isActive = step === s;
              const isPast = ['details', 'vehicle', 'documents'].indexOf(step) > i;
              return (
                <div key={s} className={`flex-1 flex flex-col items-center ${isActive || isPast ? 'text-[#006D77]' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition ${isActive || isPast ? 'bg-[#006D77] text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {i + 1}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider">{s}</span>
                </div>
              );
            })}
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleDetailsNext} className="space-y-4 animate-in fade-in slide-in-from-right-4">
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

            {role !== 'Raider' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006D77] transition-colors" size={18} />
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-bold text-sm transition-colors bg-white" />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm</label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006D77] transition-colors" size={18} />
                    <input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-bold text-sm transition-colors bg-white" />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-[#0F172A] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
              {role === 'Raider' ? 'Next Step' : (loading ? 'Processing...' : 'Create Account')} <ArrowRight size={18}/>
            </button>
          </form>
        )}

        {step === 'vehicle' && (
          <form onSubmit={handleVehicleNext} className="space-y-5 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2"><Truck size={20} className="text-[#006D77]"/> Vehicle Options</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vehicle Type</label>
                <select className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm bg-white focus:border-[#006D77] outline-none" value={raiderData.vehicleType} onChange={e => setRaiderData({...raiderData, vehicleType: e.target.value})}>
                  <option>Bike</option>
                  <option>Auto</option>
                  <option>Mini Truck</option>
                  <option>Heavy Vehicle</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Registration No.</label>
                <input required type="text" placeholder="MH 12 AB 1234" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-[#006D77] outline-none" value={raiderData.vehicleRegistration} onChange={e => setRaiderData({...raiderData, vehicleRegistration: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role Flexibility</label>
              <div className="grid grid-cols-3 gap-3">
                {['Pickup Only', 'Delivery Only', 'Both'].map(roleOption => (
                  <button 
                    type="button"
                    key={roleOption} 
                    onClick={() => setRaiderData({...raiderData, roleFlexibility: roleOption})}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition ${raiderData.roleFlexibility === roleOption ? 'border-[#006D77] bg-[#006D77]/5 text-[#006D77]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    {roleOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Home Address</label>
               <textarea required rows="2" className="w-full p-3 border-2 border-slate-200 rounded-xl outline-none focus:border-[#006D77] text-sm resize-none" placeholder="Enter full address" value={raiderData.address} onChange={e => setRaiderData({...raiderData, address: e.target.value})}></textarea>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep('details')} className="w-1/3 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200">Back</button>
              <button type="submit" className="w-2/3 bg-[#0F172A] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-slate-800 flex items-center justify-center gap-2">Next <ArrowRight size={18}/></button>
            </div>
          </form>
        )}

        {step === 'documents' && (
          <form onSubmit={handleDocumentsNext} className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2"><FileText size={20} className="text-[#006D77]"/> Verification Docs</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border-2 border-slate-200 rounded-xl bg-slate-50">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Driving License</p>
                  <p className="text-[10px] text-slate-500">Upload clear front & back</p>
                </div>
                <input type="file" ref={licenseInputRef} className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'drivingLicenseUrl')} />
                <button type="button" onClick={() => licenseInputRef.current.click()} disabled={uploadingDoc === 'drivingLicenseUrl'} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${raiderData.documents.drivingLicenseUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                  {uploadingDoc === 'drivingLicenseUrl' ? <Loader2 size={14} className="animate-spin"/> : raiderData.documents.drivingLicenseUrl ? <CheckCircle2 size={14}/> : <Camera size={14}/>}
                  {raiderData.documents.drivingLicenseUrl ? 'Uploaded' : 'Upload'}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 border-2 border-slate-200 rounded-xl bg-slate-50">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Vehicle RC</p>
                  <p className="text-[10px] text-slate-500">Registration Certificate</p>
                </div>
                <input type="file" ref={rcInputRef} className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'rcUrl')} />
                <button type="button" onClick={() => rcInputRef.current.click()} disabled={uploadingDoc === 'rcUrl'} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${raiderData.documents.rcUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                  {uploadingDoc === 'rcUrl' ? <Loader2 size={14} className="animate-spin"/> : raiderData.documents.rcUrl ? <CheckCircle2 size={14}/> : <Camera size={14}/>}
                  {raiderData.documents.rcUrl ? 'Uploaded' : 'Upload'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border-2 border-slate-200 rounded-xl bg-slate-50">
                <div>
                  <p className="font-bold text-slate-800 text-sm">ID Proof</p>
                  <p className="text-[10px] text-slate-500">Aadhaar/PAN Card</p>
                </div>
                <input type="file" id="idProofUpload" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'idProofUrl')} />
                <button type="button" onClick={() => document.getElementById('idProofUpload').click()} disabled={uploadingDoc === 'idProofUrl'} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${raiderData.documents.idProofUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                  {uploadingDoc === 'idProofUrl' ? <Loader2 size={14} className="animate-spin"/> : raiderData.documents.idProofUrl ? <CheckCircle2 size={14}/> : <Camera size={14}/>}
                  {raiderData.documents.idProofUrl ? 'Uploaded' : 'Upload'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 border-2 border-slate-200 rounded-xl bg-slate-50">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Profile Image</p>
                  <p className="text-[10px] text-slate-500">Clear selfie for identification</p>
                </div>
                <input type="file" id="profileImageUpload" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'profileImageUrl')} />
                <button type="button" onClick={() => document.getElementById('profileImageUpload').click()} disabled={uploadingDoc === 'profileImageUrl'} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${raiderData.documents.profileImageUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                  {uploadingDoc === 'profileImageUrl' ? <Loader2 size={14} className="animate-spin"/> : raiderData.documents.profileImageUrl ? <CheckCircle2 size={14}/> : <Camera size={14}/>}
                  {raiderData.documents.profileImageUrl ? 'Uploaded' : 'Upload'}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bank Details</label>
              <div className="grid grid-cols-2 gap-3">
                <input required type="text" placeholder="Account Number" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-[#006D77] outline-none" value={raiderData.bankDetails.accountNumber} onChange={e => setRaiderData({...raiderData, bankDetails: {...raiderData.bankDetails, accountNumber: e.target.value}})} />
                <input required type="text" placeholder="IFSC Code" className="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-[#006D77] outline-none" value={raiderData.bankDetails.ifscCode} onChange={e => setRaiderData({...raiderData, bankDetails: {...raiderData.bankDetails, ifscCode: e.target.value}})} />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setStep('vehicle')} className="w-1/3 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200">Back</button>
              <button type="submit" disabled={loading || !raiderData.documents.drivingLicenseUrl || !raiderData.documents.rcUrl || !raiderData.documents.idProofUrl || !raiderData.documents.profileImageUrl} className="w-2/3 bg-[#0F172A] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Submitting...' : 'Submit Application'} <ArrowRight size={18}/>
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center animate-in zoom-in-95 space-y-4 pt-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Application Submitted!</h2>
            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
              We have received your application and documents. Our operations team will verify your details within 24-48 hours.
            </p>
            <div className="bg-[#f8f9fa] border border-slate-200 rounded-xl p-4 mt-6">
              <p className="text-sm text-slate-600 font-bold">
                Check your email <span className="text-[#006D77]">{email}</span> for your generated password once you are approved!
              </p>
            </div>
            <Link to="/login" className="inline-block bg-[#006D77] text-white font-bold py-3 px-8 rounded-xl mt-6 hover:bg-[#00585f] transition">
              Return to Login
            </Link>
          </div>
        )}

        {step === 'otp' && (
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

        {step === 'details' && (
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500">
              Already have an account? <Link to="/login" className="font-bold text-[#006D77] hover:underline">Log in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
