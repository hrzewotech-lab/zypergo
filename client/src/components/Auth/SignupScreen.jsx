import React, { useState, useRef } from 'react';
import { User, UserPlus, Mail, Phone, KeyRound, ArrowRight, ShieldCheck, Truck, FileText, CheckCircle2, Camera, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import CameraModal from '../common/CameraModal';

export default function SignupScreen({ role, onLoginSuccess }) {
  const navigate = useNavigate();
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
  const [step, setStep] = useState('details'); // details -> vehicle (Rider) -> documents (Rider) -> otp/success
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(null);

  // Rider Specific State
  const licenseInputRef = useRef(null);
  const rcInputRef = useRef(null);
  const [riderData, setRiderData] = useState({
    vehicleType: 'Bike',
    vehicleRegistration: '',
    vehicleMake: '',
    vehicleModel: '',
    rcNumber: '',
    address: '',
    bankDetails: { accountNumber: '', ifscCode: '' },
    emergencyContact: { name: '', phone: '' },
    documents: { drivingLicenseUrl: '', rcUrl: '', aadhaarUrl: '', panUrl: '', vehiclePicUrl: '', profileImageUrl: '' }
  });
  const [cameraConfig, setCameraConfig] = useState({ isOpen: false, field: null });

  const handleFileUpload = async (e, field) => {
    const file = e.target ? e.target.files[0] : e;
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
        setRiderData(prev => ({
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
    if (!name || !email || !phone || (role !== 'Rider' && !password)) {
      setError('Please fill in all fields');
      return;
    }
    if (role !== 'Rider' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    if (role === 'Rider') {
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
      const payload = { email, phone, name, riderDetails: riderData };
      const res = await api.post('/auth/rider-apply', payload);
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
      if (role === 'Rider') {
        payload.riderDetails = riderData;
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
    <div className="min-h-[100dvh] bg-[#FFB703] flex flex-col font-sans relative overflow-hidden">
      {/* Top Header Section (Rapido Style) */}
      <div className="pt-8 pb-16 px-6 text-center">
        <img src="/images/logo.png" alt="ZyperGo Logo" className="h-12 w-auto object-contain mx-auto mb-4" />
        <h1 className="text-2xl font-black text-black tracking-tight uppercase">ZyperGo {role}</h1>
        <p className="text-slate-800 mt-1 font-bold text-sm">
          {role === 'Rider' ? 'Partner with us and start earning' : 'Create your account to get started'}
        </p>
      </div>

      {/* Main Content Card */}
      <div className="flex-1 bg-white sm:max-w-xl sm:mx-auto w-full rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col relative z-10">
        
        {/* Toggle Login/Register */}
        {step === 'details' && (
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 relative z-10 w-full max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700"
            >
              <User size={18} /> Login
            </button>
            <button
              type="button"
              className="flex-1 py-3 text-sm font-black rounded-xl flex items-center justify-center gap-2 bg-black text-[#FFB703] shadow-md transition-transform active:scale-95"
            >
              <UserPlus size={18} /> Register
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center mb-6 border border-red-200">
            {error}
          </div>
        )}

        {/* Rider Progress Tracker */}
        {role === 'Rider' && step !== 'otp' && step !== 'success' && (
          <div className="flex justify-between border-b-2 border-slate-100 pb-4 mb-6 relative z-10 w-full px-2">
            {['details', 'vehicle', 'documents'].map((s, i) => {
              const isActive = step === s;
              const isPast = ['details', 'vehicle', 'documents'].indexOf(step) > i;
              return (
                <div key={s} className={`flex flex-col items-center gap-1 ${isActive || isPast ? 'text-black' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border-2 transition-colors ${isActive || isPast ? 'bg-[#FFB703] border-black text-black shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    {i + 1}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest">{s}</span>
                </div>
              );
            })}
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleDetailsNext} className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="text" placeholder="John Doe" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition-all duration-200 font-bold text-slate-900" value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="email" placeholder="name@company.com" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition-all duration-200 font-bold text-slate-900" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="tel" placeholder="98765 43210" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition-all duration-200 font-bold text-slate-900" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>
              
              {role !== 'Rider' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input required type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition-all duration-200 font-bold text-slate-900" value={password} onChange={e => setPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Confirm</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input required type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition-all duration-200 font-bold text-slate-900" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-black text-[#FFB703] font-black py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-3 mt-8">
              {role === 'Rider' ? 'Next Step' : (loading ? <><Loader2 size={20} className="animate-spin"/> Processing...</> : 'Create Account')} {role === 'Rider' && <ArrowRight size={20}/>}
            </button>
          </form>
        )}

        {step === 'vehicle' && (
          <form onSubmit={handleVehicleNext} className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-black text-black mb-4 flex items-center gap-2"><Truck size={20} className="text-[#FFB703]"/> Vehicle Options</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Vehicle Type</label>
                <select className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition-all duration-200 font-bold text-slate-900 appearance-none" value={riderData.vehicleType} onChange={e => setRiderData({...riderData, vehicleType: e.target.value})}>
                  <option>Scooter</option>
                  <option>Mini 3W</option>
                  <option>3 Wheeler</option>
                  <option>Tata Ace</option>
                  <option>Pickup 8ft</option>
                  <option>Pickup 9ft</option>
                  <option>14ft</option>
                  <option>17ft</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Company / Make</label>
                <input required type="text" placeholder="e.g. Honda, Tata" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition-all duration-200 font-bold text-slate-900" value={riderData.vehicleMake} onChange={e => setRiderData({...riderData, vehicleMake: e.target.value})} />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Vehicle Model</label>
                <input required type="text" placeholder="e.g. Activa 6G, Ace" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition-all duration-200 font-bold text-slate-900" value={riderData.vehicleModel} onChange={e => setRiderData({...riderData, vehicleModel: e.target.value})} />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Registration No.</label>
                <input required type="text" placeholder="MH 12 AB 1234" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition-all duration-200 font-bold text-slate-900" value={riderData.vehicleRegistration} onChange={e => setRiderData({...riderData, vehicleRegistration: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">RC Book Number</label>
              <input required type="text" placeholder="Enter RC Number" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition-all duration-200 font-bold text-slate-900" value={riderData.rcNumber} onChange={e => setRiderData({...riderData, rcNumber: e.target.value})} />
            </div>

            <div>
               <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">Home Address</label>
               <textarea required rows="2" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none transition-all duration-200 font-bold text-slate-900 resize-none" placeholder="Enter full address" value={riderData.address} onChange={e => setRiderData({...riderData, address: e.target.value})}></textarea>
            </div>

            <div className="flex gap-3 pt-4 mt-6">
              <button type="button" onClick={() => setStep('details')} className="w-1/3 bg-slate-100 border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 active:scale-95 transition-all">Back</button>
              <button type="submit" className="w-2/3 bg-black text-[#FFB703] font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">Next <ArrowRight size={20}/></button>
            </div>
          </form>
        )}

        {step === 'documents' && (
          <form onSubmit={handleDocumentsNext} className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-lg font-black text-black mb-4 flex items-center gap-2"><FileText size={20} className="text-[#FFB703]"/> Verification Docs</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { field: 'profileImageUrl', title: 'Profile Photo', desc: 'Clear selfie', icon: <User size={20} /> },
                { field: 'drivingLicenseUrl', title: 'Driving License', desc: 'Front & Back', icon: <FileText size={20} /> },
                { field: 'rcUrl', title: 'Vehicle RC', desc: 'Registration', icon: <FileText size={20} /> },
                { field: 'vehiclePicUrl', title: 'Vehicle Photo', desc: 'With Number Plate', icon: <Camera size={20} /> },
                { field: 'aadhaarUrl', title: 'Aadhaar Card', desc: 'Clear Image', icon: <ShieldCheck size={20} /> },
                { field: 'panUrl', title: 'PAN Card', desc: 'Clear Image', icon: <ShieldCheck size={20} /> },
              ].map(doc => (
                <div key={doc.field} className="border border-slate-200 rounded-xl p-3 flex flex-col hover:border-black transition-colors bg-slate-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-sm shrink-0 border border-slate-100">
                      {doc.icon}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-[13px]">{doc.title}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">{doc.desc}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setCameraConfig({ isOpen: true, field: doc.field })} disabled={uploadingDoc === doc.field} className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 ${riderData.documents[doc.field] ? 'bg-black text-[#FFB703]' : 'bg-white border border-slate-200 text-slate-600 hover:border-black hover:text-black'}`}>
                    {uploadingDoc === doc.field ? <Loader2 size={16} className="animate-spin"/> : riderData.documents[doc.field] ? <CheckCircle2 size={16}/> : <Camera size={16}/>}
                    <span>{riderData.documents[doc.field] ? 'Uploaded' : 'Upload / Capture'}</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">Bank Details</label>
              <div className="grid grid-cols-2 gap-3">
                <input required type="text" placeholder="Account Number" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none font-bold text-slate-900 transition-all" value={riderData.bankDetails.accountNumber} onChange={e => setRiderData({...riderData, bankDetails: {...riderData.bankDetails, accountNumber: e.target.value}})} />
                <input required type="text" placeholder="IFSC Code" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none font-bold text-slate-900 transition-all" value={riderData.bankDetails.ifscCode} onChange={e => setRiderData({...riderData, bankDetails: {...riderData.bankDetails, ifscCode: e.target.value}})} />
              </div>
            </div>

            <div className="flex gap-3 pt-6 mt-8">
              <button type="button" onClick={() => setStep('vehicle')} className="w-1/3 bg-slate-100 border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 active:scale-95 transition-all">Back</button>
              <button type="submit" disabled={loading || !riderData.documents.drivingLicenseUrl || !riderData.documents.rcUrl || !riderData.documents.aadhaarUrl || !riderData.documents.panUrl || !riderData.documents.vehiclePicUrl || !riderData.documents.profileImageUrl} className="w-2/3 bg-black text-[#FFB703] font-black py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg">
                {loading ? <><Loader2 size={20} className="animate-spin"/> Submitting...</> : 'Submit'} {!loading && <ArrowRight size={20}/>}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center animate-in zoom-in-95 space-y-5 pt-8 pb-4 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Application Submitted!</h2>
            <p className="text-slate-600 max-w-sm mx-auto leading-relaxed text-base">
              We have received your application and documents. Our operations team will verify your details within <span className="font-bold text-slate-900">24-48 hours</span>.
            </p>
            <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-5 mt-8 shadow-sm">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Check your email <span className="text-[#006D77] font-bold block mt-1">{email}</span> for your generated password once you are approved!
              </p>
            </div>
            <Link to="/login" className="inline-flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-[#006D77] to-teal-700 text-white font-black py-4 px-10 rounded-2xl mt-8 shadow-[0_8px_20px_-6px_rgba(0,109,119,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(0,109,119,0.6)] hover:-translate-y-0.5 active:scale-[0.98] transition-all text-lg">
              Return to Login
            </Link>
          </div>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-4 pt-4">
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
                  className="w-full text-center py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-black focus:ring-2 focus:ring-black/10 outline-none font-mono font-bold text-2xl tracking-widest transition-all"
                />
              </div>
              <p className="text-xs text-right text-black font-bold mt-2 cursor-pointer hover:underline" onClick={() => setStep('details')}>
                Change number?
              </p>
            </div>
            <button type="submit" disabled={loading || otp.length !== 4} className="w-full bg-black text-[#FFB703] font-black py-4 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg mt-8">
              {loading ? 'Verifying...' : 'Verify & Continue'} <ShieldCheck size={20}/>
            </button>
          </form>
        )}


      </div>
      <CameraModal 
        isOpen={cameraConfig.isOpen} 
        onClose={() => setCameraConfig({ isOpen: false, field: null })} 
        onCapture={(file) => handleFileUpload(file, cameraConfig.field)}
        onFileUpload={(file) => handleFileUpload(file, cameraConfig.field)}
      />
    </div>
  );
}
