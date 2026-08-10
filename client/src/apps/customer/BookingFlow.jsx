import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, Calendar, CreditCard, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Navigation, Clock, Zap, Truck, ShieldCheck, Box } from 'lucide-react';
import api from '../../api';

export default function BookingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  const [formData, setFormData] = useState({
    pickupPincode: '', pickupAddress: '', dropPincode: '', dropAddress: '',
    senderName: '', senderPhone: '', senderEmail: '', receiverName: '', receiverPhone: '', receiverEmail: '',
    category: 'General Parcel', weight: '', length: '', width: '', height: '', value: '', description: '', fragile: false, prohibitedDeclared: false,
    parcelPhoto: false, senderPhoto: false, billPhoto: false,
    schedulingType: 'Now', scheduleDate: '', scheduleTime: '',
    speed: 'Standard', handlingNotes: '',
    paymentMode: 'UPI', payer: 'Sender'
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const needsDimensions = ['Commercial Package', 'General Parcel'].includes(formData.category);

  const handleSubmit = async () => {
    if (!formData.prohibitedDeclared) {
      setError('You must declare that the parcel does not contain prohibited items.');
      return;
    }
    if (!formData.parcelPhoto) {
      setError('At least 1 Parcel Photo is mandatory.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const payload = {
        pickupLocation: { address: formData.pickupAddress, pincode: formData.pickupPincode },
        dropLocation: { address: formData.dropAddress, pincode: formData.dropPincode },
        senderDetails: { name: formData.senderName, phone: formData.senderPhone, email: formData.senderEmail },
        receiver: { name: formData.receiverName, phone: formData.receiverPhone, email: formData.receiverEmail },
        packageDetails: {
          category: formData.category, weight: parseFloat(formData.weight) || 0, value: parseFloat(formData.value) || 0, description: formData.description, fragile: formData.fragile, prohibitedDeclared: formData.prohibitedDeclared,
          dimensions: needsDimensions ? { length: parseFloat(formData.length) || 0, width: parseFloat(formData.width) || 0, height: parseFloat(formData.height) || 0 } : undefined
        },
        photos: {
          parcelUrl: formData.parcelPhoto ? 'mock_parcel_url' : undefined,
          senderUrl: formData.senderPhoto ? 'mock_sender_url' : undefined,
          billUrl: formData.billPhoto ? 'mock_bill_url' : undefined
        },
        scheduling: { type: formData.schedulingType, date: formData.scheduleDate, timeSlot: formData.scheduleTime },
        preferences: { speed: formData.speed, handlingNotes: formData.handlingNotes },
        payment: { mode: formData.paymentMode, payer: formData.payer }
      };

      const response = await api.post('/bookings', payload);
      setBookingResult(response.data.data);
      setCurrentStep(5);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { step: 1, label: 'Location', icon: MapPin },
    { step: 2, label: 'Parcel', icon: Package },
    { step: 3, label: 'Options', icon: Zap },
    { step: 4, label: 'Payment', icon: CreditCard }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-10 mb-8 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#fb5c00]/5 to-[#83C5BE]/20 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

      {currentStep < 5 && (
        <div className="mb-10 relative z-10">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-100 -z-10 rounded-full transform -translate-y-1/2"></div>
            <div className="absolute left-0 top-1/2 h-1 bg-[#fb5c00] -z-10 rounded-full transform -translate-y-1/2 transition-all duration-500 ease-out" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
            
            {steps.map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${currentStep >= item.step ? 'bg-gradient-to-br from-[#003B46] to-[#fb5c00] text-white scale-110 shadow-lg shadow-[#fb5c00]/30' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                  <item.icon size={20} className={currentStep === item.step ? 'animate-pulse' : ''} />
                </div>
                <span className={`text-[11px] font-extrabold uppercase tracking-widest hidden md:block transition-colors duration-300 ${currentStep >= item.step ? 'text-[#fb5c00]' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-3 text-sm font-bold shadow-sm">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* STEP 1: Location */}
      {currentStep === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Where are we heading?</h2>
            <p className="text-slate-500 mt-1">Enter the pickup and delivery addresses.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-slate-200 -translate-x-1/2 border-dashed border-l-2"></div>
            
            {/* Pickup */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-[#fb5c00]/30 hover:bg-[#fb5c00]/5 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#fb5c00]/10 text-[#fb5c00] flex items-center justify-center"><Navigation size={20} className="transform rotate-45" /></div>
                <h3 className="text-lg font-bold text-slate-800">Pickup Location</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pincode</label>
                  <input type="text" name="pickupPincode" value={formData.pickupPincode} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#fb5c00]/20 focus:border-[#fb5c00] outline-none font-bold text-slate-800 transition-all shadow-sm" placeholder="e.g. 500001" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Address</label>
                  <textarea rows="3" name="pickupAddress" value={formData.pickupAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#fb5c00]/20 focus:border-[#fb5c00] outline-none text-sm text-slate-700 transition-all shadow-sm" placeholder="House no, street name, landmark..."></textarea>
                </div>
              </div>
            </div>

            {/* Drop */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-[#E29578]/30 hover:bg-[#E29578]/5 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#E29578]/10 text-[#E29578] flex items-center justify-center"><MapPin size={20} /></div>
                <h3 className="text-lg font-bold text-slate-800">Drop Location</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pincode</label>
                  <input type="text" name="dropPincode" value={formData.dropPincode} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E29578]/20 focus:border-[#E29578] outline-none font-bold text-slate-800 transition-all shadow-sm" placeholder="e.g. 500081" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Address</label>
                  <textarea rows="3" name="dropAddress" value={formData.dropAddress} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E29578]/20 focus:border-[#E29578] outline-none text-sm text-slate-700 transition-all shadow-sm" placeholder="Receiver's house no, street name..."></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-10"></div>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Truck size={18} className="text-slate-400"/> Sender Contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
                  <input type="text" name="senderName" value={formData.senderName} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#fb5c00]/20 focus:border-[#fb5c00] outline-none font-bold text-slate-800 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                  <input type="tel" name="senderPhone" value={formData.senderPhone} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#fb5c00]/20 focus:border-[#fb5c00] outline-none font-bold text-slate-800 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email (For OTP)</label>
                  <input type="email" name="senderEmail" value={formData.senderEmail} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#fb5c00]/20 focus:border-[#fb5c00] outline-none font-bold text-slate-800 transition-all" />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-100 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-10"></div>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin size={18} className="text-slate-400"/> Receiver Contact</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
                  <input type="text" name="receiverName" value={formData.receiverName} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E29578]/20 focus:border-[#E29578] outline-none font-bold text-slate-800 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                  <input type="tel" name="receiverPhone" value={formData.receiverPhone} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E29578]/20 focus:border-[#E29578] outline-none font-bold text-slate-800 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email (For OTP)</label>
                  <input type="email" name="receiverEmail" value={formData.receiverEmail} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#E29578]/20 focus:border-[#E29578] outline-none font-bold text-slate-800 transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Parcel */}
      {currentStep === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">What are you sending?</h2>
            <p className="text-slate-500 mt-1">Provide package details for accurate pricing.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {['Document', 'Clothes', 'Fertilizers', 'Books', 'Electronics', 'Medicine', 'Fragile Item', 'Commercial Package', 'General Parcel'].map(cat => (
              <label key={cat} className={`cursor-pointer rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-2 text-center transition-all ${formData.category === cat ? 'border-[#fb5c00] bg-[#fb5c00]/5 shadow-md shadow-[#fb5c00]/10' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}>
                <input type="radio" name="category" value={cat} checked={formData.category === cat} onChange={handleInputChange} className="hidden" />
                <Box size={24} className={formData.category === cat ? 'text-[#fb5c00]' : 'text-slate-400'} />
                <span className={`text-[10px] uppercase tracking-wider font-bold ${formData.category === cat ? 'text-[#fb5c00]' : 'text-slate-600'}`}>{cat}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Est. Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#fb5c00] outline-none font-bold text-slate-800" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Declared Value (₹)</label>
              <input type="number" name="value" value={formData.value} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#fb5c00] outline-none font-bold text-slate-800" />
            </div>
          </div>

          {needsDimensions && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Dimensions in CM (L x W x H)</label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <input type="number" name="length" value={formData.length} onChange={handleInputChange} placeholder="Length" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-center font-bold" />
                <input type="number" name="width" value={formData.width} onChange={handleInputChange} placeholder="Width" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-center font-bold" />
                <input type="number" name="height" value={formData.height} onChange={handleInputChange} placeholder="Height" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-center font-bold" />
              </div>
              {formData.length && formData.width && formData.height && (
                <div className="bg-[#fb5c00]/10 text-[#fb5c00] px-4 py-2 rounded-lg text-xs font-bold inline-block">
                   Volumetric Weight: {((parseFloat(formData.length) * parseFloat(formData.width) * parseFloat(formData.height)) / 5000).toFixed(2)} kg
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Mandatory Photos</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setFormData({...formData, parcelPhoto: true})}
                className={`border-2 ${formData.parcelPhoto ? 'border-green-500 bg-green-50' : 'border-dashed border-slate-300 bg-white hover:border-[#fb5c00]'} cursor-pointer p-4 rounded-xl flex flex-col items-center justify-center transition`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${formData.parcelPhoto ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   {formData.parcelPhoto ? <CheckCircle2 size={16}/> : '+'}
                </div>
                <span className="text-xs font-bold text-slate-700">Parcel Photo *</span>
              </div>
              <div 
                onClick={() => setFormData({...formData, senderPhoto: true})}
                className={`border-2 ${formData.senderPhoto ? 'border-green-500 bg-green-50' : 'border-dashed border-slate-300 bg-white hover:border-[#fb5c00]'} cursor-pointer p-4 rounded-xl flex flex-col items-center justify-center transition`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${formData.senderPhoto ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   {formData.senderPhoto ? <CheckCircle2 size={16}/> : '+'}
                </div>
                <span className="text-xs font-bold text-slate-700">Sender Photo</span>
              </div>
              <div 
                onClick={() => setFormData({...formData, billPhoto: true})}
                className={`border-2 ${formData.billPhoto ? 'border-green-500 bg-green-50' : 'border-dashed border-slate-300 bg-white hover:border-[#fb5c00]'} cursor-pointer p-4 rounded-xl flex flex-col items-center justify-center transition`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${formData.billPhoto ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   {formData.billPhoto ? <CheckCircle2 size={16}/> : '+'}
                </div>
                <span className="text-xs font-bold text-slate-700">Bill Photo (High Value)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 p-4 rounded-xl cursor-pointer" onClick={() => setFormData({...formData, fragile: !formData.fragile})}>
            <input type="checkbox" name="fragile" checked={formData.fragile} readOnly className="w-5 h-5 accent-amber-500" />
            <div>
              <p className="text-sm font-bold text-amber-900">Fragile Item</p>
              <p className="text-[11px] text-amber-700">Requires careful handling during transit.</p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Options */}
      {currentStep === 3 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Delivery Speed & Time</h2>
            <p className="text-slate-500 mt-1">Choose how and when you want it delivered.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${formData.speed === 'Standard' ? 'border-[#fb5c00] bg-[#fb5c00]/5' : 'border-slate-100 hover:border-slate-200'}`}>
              <input type="radio" name="speed" value="Standard" checked={formData.speed === 'Standard'} onChange={handleInputChange} className="hidden" />
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-slate-800">Standard</h3>
                <Truck size={24} className={formData.speed === 'Standard' ? 'text-[#fb5c00]' : 'text-slate-400'} />
              </div>
              <p className="text-xs text-slate-500">Normal delivery route. Usually takes 24-48 hours depending on distance.</p>
            </label>
            
            <label className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${formData.speed === 'Express' ? 'border-[#FFB703] bg-[#FFB703]/10' : 'border-slate-100 hover:border-slate-200'}`}>
              <input type="radio" name="speed" value="Express" checked={formData.speed === 'Express'} onChange={handleInputChange} className="hidden" />
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-slate-800">Express</h3>
                <Zap size={24} className={formData.speed === 'Express' ? 'text-[#FFB703]' : 'text-slate-400'} />
              </div>
              <p className="text-xs text-slate-500">Priority routing. Delivered as fast as possible. Surcharge applies.</p>
            </label>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-6">
            <div className="flex gap-4">
              {['Now', 'Later'].map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="schedulingType" value={type} checked={formData.schedulingType === type} onChange={handleInputChange} className="accent-[#fb5c00] w-4 h-4" />
                  <span className="text-sm font-bold text-slate-700">Pickup {type}</span>
                </label>
              ))}
            </div>

            {formData.schedulingType === 'Later' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                <input type="date" name="scheduleDate" value={formData.scheduleDate} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#fb5c00] outline-none font-bold text-slate-800" />
                <select name="scheduleTime" value={formData.scheduleTime} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#fb5c00] outline-none font-bold text-slate-800 bg-white">
                  <option value="">Select Time</option>
                  <option value="09:00-12:00">09:00 AM - 12:00 PM</option>
                  <option value="12:00-15:00">12:00 PM - 03:00 PM</option>
                  <option value="15:00-18:00">03:00 PM - 06:00 PM</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: Review & Payment */}
      {currentStep === 4 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Review & Payment</h2>
            <p className="text-slate-500 mt-1">Final step before confirming your booking.</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-inner">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Route</span><span className="font-bold truncate max-w-[200px] text-right">{formData.pickupPincode} → {formData.dropPincode}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="font-bold">{formData.category} ({formData.weight}kg)</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Speed</span><span className="font-bold text-[#fb5c00]">{formData.speed}</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl mb-6 shadow-sm">
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">Who pays for delivery?</label>
             <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${formData.payer === 'Sender' ? 'border-[#fb5c00] bg-[#fb5c00]/5 text-[#fb5c00]' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}>
                  <input type="radio" name="payer" value="Sender" checked={formData.payer === 'Sender'} onChange={handleInputChange} className="hidden" />
                  <span className="font-bold text-sm">Prepaid (Sender Pays)</span>
                </label>
                <label className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${formData.payer === 'Receiver' ? 'border-[#fb5c00] bg-[#fb5c00]/5 text-[#fb5c00]' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}>
                  <input type="radio" name="payer" value="Receiver" checked={formData.payer === 'Receiver'} onChange={handleInputChange} className="hidden" />
                  <span className="font-bold text-sm">To-Pay (Receiver Pays)</span>
                </label>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className={`cursor-pointer rounded-2xl border-2 p-4 text-center transition-all ${formData.paymentMode === 'UPI' ? 'border-[#fb5c00] bg-[#fb5c00]/5' : 'border-slate-100 hover:border-slate-200'}`}>
              <input type="radio" name="paymentMode" value="UPI" checked={formData.paymentMode === 'UPI'} onChange={handleInputChange} className="hidden" />
              <span className={`font-bold ${formData.paymentMode === 'UPI' ? 'text-[#fb5c00]' : 'text-slate-600'}`}>UPI / Online</span>
            </label>
            <label className={`cursor-pointer rounded-2xl border-2 p-4 text-center transition-all ${formData.paymentMode === 'Cash' ? 'border-[#fb5c00] bg-[#fb5c00]/5' : 'border-slate-100 hover:border-slate-200'}`}>
              <input type="radio" name="paymentMode" value="Cash" checked={formData.paymentMode === 'Cash'} onChange={handleInputChange} className="hidden" />
              <span className={`font-bold ${formData.paymentMode === 'Cash' ? 'text-[#fb5c00]' : 'text-slate-600'}`}>Pay on {formData.payer === 'Sender' ? 'Pickup' : 'Delivery'}</span>
            </label>
          </div>

          <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-100 cursor-pointer" onClick={() => setFormData({...formData, prohibitedDeclared: !formData.prohibitedDeclared})}>
            <input type="checkbox" checked={formData.prohibitedDeclared} readOnly className="mt-1 w-5 h-5 accent-red-600" />
            <p className="text-xs font-bold text-red-900 leading-relaxed">I declare that this parcel does not contain any illegal, hazardous, flammable, or prohibited items as per ZyperGo's terms.</p>
          </div>
        </div>
      )}

      {/* STEP 5: Success */}
      {currentStep === 5 && bookingResult && (
        <div className="text-center py-12 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Your shipment has been registered successfully. A raider will be assigned shortly.</p>
          
          <div className="bg-slate-50 p-6 rounded-2xl inline-block text-left border border-slate-200 shadow-sm mb-8 min-w-[300px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tracking ID</p>
            <p className="text-3xl font-mono font-bold text-[#fb5c00]">{bookingResult.trackingId}</p>
          </div>
          
          <div>
            <button onClick={() => navigate(`/customer/track?id=${bookingResult.trackingId}`)} className="bg-[#fb5c00] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-[#00585f] transition-all hover:-translate-y-1">
              Track Shipment Live
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      {currentStep < 5 && (
        <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">
              <ArrowLeft size={18} /> Back
            </button>
          ) : <div></div>}
          
          {currentStep < 4 ? (
            <button onClick={nextStep} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-[#0F172A] text-white hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300">
              Next Step <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading || !formData.prohibitedDeclared} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-[#fb5c00] text-white hover:bg-[#00585f] transition-colors disabled:opacity-50 shadow-lg shadow-[#fb5c00]/30 hover:shadow-xl hover:-translate-y-0.5 duration-300">
              {loading ? 'Processing...' : 'Confirm Booking'} <ShieldCheck size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
