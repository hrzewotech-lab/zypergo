import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Package, Camera, CheckCircle, Search, MapPin } from 'lucide-react';

function HamaliHome() {
  const [scannedPackage, setScannedPackage] = useState(null);
  const [searchId, setSearchId] = useState('');
  
  const handleScan = (e) => {
    e.preventDefault();
    if (searchId) {
      setScannedPackage(searchId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-primary text-white p-4 pt-10 flex justify-between items-center rounded-b-xl shadow-md">
        <div>
          <h1 className="text-xl font-bold">Hub Operations</h1>
          <p className="text-xs text-primary-100 flex items-center gap-1 mt-1">
            <MapPin size={12} /> Hyderabad Central Hub
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <Package size={20} />
        </div>
      </header>

      <main className="p-4 mt-4 space-y-6 max-w-lg mx-auto">
        
        {/* Scan/Search Section */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
           <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <Camera size={28} />
           </div>
           <h2 className="text-lg font-bold text-slate-900 mb-2">Scan Package Barcode</h2>
           <p className="text-xs text-slate-500 mb-6">Use your device camera to log a package handoff.</p>
           
           <button className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition shadow-sm mb-4">
             Open Camera Scanner
           </button>

           <div className="relative flex items-center justify-center mb-4">
             <div className="absolute border-t border-slate-200 w-full"></div>
             <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">OR ENTER MANUALLY</span>
           </div>

           <form onSubmit={handleScan} className="flex gap-2">
             <input 
               type="text" 
               placeholder="Enter AWB or Booking ID"
               value={searchId}
               onChange={(e) => setSearchId(e.target.value)}
               className="flex-1 px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-primary outline-none text-sm uppercase" 
             />
             <button type="submit" className="bg-slate-800 text-white px-4 rounded text-sm font-bold">Find</button>
           </form>
        </section>

        {/* Action Section */}
        {scannedPackage && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Package Found</p>
                <h3 className="text-lg font-extrabold text-slate-900">{scannedPackage.toUpperCase()}</h3>
                <p className="text-sm text-slate-600 mt-1">Intercity Standard &bull; 14.5 kg</p>
              </div>
              <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded">PENDING HANDOFF</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Upload Proof Photo (Required)</label>
                <button className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 text-center text-slate-500 hover:bg-slate-50 flex flex-col items-center gap-2 transition">
                  <Camera size={20} />
                  <span className="text-xs font-medium">Capture Condition Proof</span>
                </button>
              </div>
              
              <button 
                onClick={() => {
                  alert("Package Handoff Logged Successfully!");
                  setScannedPackage(null);
                  setSearchId('');
                }}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-sm"
              >
                <CheckCircle size={18} /> Confirm Hub Arrival
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

import LoginScreen from '../components/Auth/LoginScreen';
import SignupScreen from '../components/Auth/SignupScreen';

function HamaliApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('zypergo_token'));
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/', { replace: true });
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginScreen role="Hamali" onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<SignupScreen role="Hamali" onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HamaliHome />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default HamaliApp;
