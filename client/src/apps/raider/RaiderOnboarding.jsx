import React, { useState } from 'react';
import { Truck, Upload, CheckCircle2, ChevronRight, User, Briefcase, Phone, MapPin } from 'lucide-react';

export default function RaiderOnboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicleType: '2-Wheeler (Bike)',
    regNumber: '',
    phone: '',
    address: '',
    accountNumber: '',
    ifscCode: '',
    emergencyName: '',
    emergencyPhone: '',
    rolePreference: 'Both'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = (e) => {
    e.preventDefault();
    setStep(prev => prev + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      onComplete(); // Move to pending approval state
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <header className="bg-[#0F172A] p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#fb5c00] rounded flex items-center justify-center text-white">
            <Truck size={16} />
          </div>
          <h1 className="font-bold text-white">ZyperGo Partner</h1>
        </div>
        <span className="text-xs font-bold text-slate-400">Step {step} of 3</span>
      </header>

      <main className="p-4 max-w-md mx-auto mt-4 mb-20">
        {step === 1 && (
          <form onSubmit={nextStep} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Profile Details</h2>
              <p className="text-sm text-slate-600">Setup your basic information.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-slate-200 rounded-full border-4 border-white shadow-md flex items-center justify-center relative overflow-hidden group cursor-pointer">
                  <User size={40} className="text-slate-400" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={16} className="mb-1"/>
                    <span className="text-[10px] font-bold">Upload Photo</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                <div className="flex items-center">
                  <div className="w-10 h-11 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg flex items-center justify-center text-slate-500"><Phone size={16}/></div>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="10-digit mobile" className="w-full h-11 px-3 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-[#fb5c00] outline-none text-sm font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Address</label>
                <div className="flex items-start">
                  <div className="w-10 h-24 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg flex items-center justify-center text-slate-500 pt-3 items-start"><MapPin size={16}/></div>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} required placeholder="House No, Street, City, Pincode" className="w-full h-24 p-3 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-[#fb5c00] outline-none text-sm resize-none"></textarea>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#fb5c00] text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-[#e05200] flex items-center justify-center gap-2">
              Next Step <ChevronRight size={18} />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={nextStep} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Vehicle & Documents</h2>
              <p className="text-sm text-slate-600">Tell us about the vehicle you'll be using.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vehicle Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['2-Wheeler (Bike)', '3-Wheeler (Auto)', 'Mini Truck', 'Heavy Vehicle'].map(type => (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => setFormData({...formData, vehicleType: type})}
                      className={`p-3 border rounded-xl text-xs font-bold text-left transition ${formData.vehicleType === type ? 'border-[#fb5c00] bg-[#fb5c00]/10 text-[#fb5c00]' : 'border-slate-200 bg-white text-slate-600'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Registration Number</label>
                <input type="text" name="regNumber" value={formData.regNumber} onChange={handleInputChange} required placeholder="TS 09 AB 1234" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#fb5c00] outline-none text-sm uppercase font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Upload RC Book</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-slate-500 bg-white cursor-pointer hover:border-[#fb5c00]">
                    <Upload size={20} className="mb-2" />
                    <span className="text-[10px] font-bold text-center">RC Photo</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Driving License</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-slate-500 bg-white cursor-pointer hover:border-[#fb5c00]">
                    <Upload size={20} className="mb-2" />
                    <span className="text-[10px] font-bold text-center">DL Photo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="px-6 bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl">Back</button>
              <button type="submit" className="flex-1 bg-[#fb5c00] text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-[#e05200] flex items-center justify-center gap-2">
                Next Step <ChevronRight size={18} />
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Banking & Emergency</h2>
              <p className="text-sm text-slate-600">Final details to get you started.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3"><Briefcase size={14} className="inline mr-1"/> Role Preference</label>
                <select name="rolePreference" value={formData.rolePreference} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#fb5c00] outline-none text-sm font-bold bg-white">
                  <option value="Both">Both Pickups & Deliveries</option>
                  <option value="Pickup Only">Pickup Only</option>
                  <option value="Delivery Only">Delivery Only</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-2 leading-tight">Flexibility allows you to choose what type of trips you want to receive.</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Number</label>
                  <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#fb5c00] outline-none text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">IFSC Code</label>
                  <input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#fb5c00] outline-none text-sm uppercase font-mono" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-sm text-slate-800">Emergency Contact</h3>
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg flex items-center justify-center text-slate-500"><User size={16}/></div>
                    <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} required placeholder="Contact Name" className="w-full h-10 px-3 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-[#fb5c00] outline-none text-sm" />
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg flex items-center justify-center text-slate-500"><Phone size={16}/></div>
                    <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} required placeholder="Phone Number" className="w-full h-10 px-3 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-[#fb5c00] outline-none text-sm font-mono" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#FFB703]/20 p-4 rounded-xl border border-[#FFB703]/30 mt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="mt-1 w-5 h-5 rounded text-[#fb5c00] focus:ring-[#fb5c00]" />
                <span className="text-xs text-slate-700 leading-tight">I agree to the ZyperGo Partner Terms & Conditions and confirm all provided documents are genuine.</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="px-6 bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl">Back</button>
              <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-green-700 flex items-center justify-center gap-2">
                Submit Application <CheckCircle2 size={18} />
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
