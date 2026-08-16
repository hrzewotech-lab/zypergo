import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Package, Calendar, CreditCard, ArrowRight, ArrowLeft, 
  AlertCircle, CheckCircle2, Navigation, Clock, Zap, Truck, 
  ShieldCheck, FileText, Shirt, Leaf, Book, Monitor, Pill, 
  GlassWater, Briefcase, Calculator, Receipt, ShoppingBag, 
  ChevronUp, ChevronDown, User
} from 'lucide-react';
import api from '../../api';

export default function BookingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [showMobileCost, setShowMobileCost] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('zypergo_user') || '{}');
  const hasEmailInDB = !!currentUser.email;

  const [estimatedPrice, setEstimatedPrice] = useState({
    base: 0,
    handlingFee: 0,
    surcharges: 0,
    gst: 0,
    codCharge: 0,
    total: 0
  });

  const [formData, setFormData] = useState(() => {
    let defaultUser = { name: '', phone: '', email: '' };
    try {
      const saved = localStorage.getItem('zypergo_user');
      if (saved) defaultUser = JSON.parse(saved);
    } catch (e) {}

    return {
      pickupPincode: '', pickupAddress: '', 
      dropPincode: '', dropAddress: '',
      senderName: defaultUser.name || '', senderPhone: defaultUser.phone || '', senderEmail: defaultUser.email || '', 
      receiverName: '', receiverPhone: '', receiverEmail: '',
      purpose: 'Personal', category: 'General Parcel', 
      weight: '', length: '', width: '', height: '', value: '', description: '', 
      fragile: false, prohibitedDeclared: false,
      parcelPhoto: false, senderPhoto: false, billPhoto: false,
      schedulingType: 'Now', scheduleDate: '', scheduleTime: '',
      speed: 'Standard', handlingNotes: '',
      paymentMode: 'UPI', payer: 'Sender'
    };
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };
  
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const needsDimensions = ['Commercial Package', 'General Parcel'].includes(formData.category);

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const payload = {
          originPincode: formData.pickupPincode || '500001',
          destPincode: formData.dropPincode || '500001',
          originCity: formData.pickupPincode ? 'Hyderabad' : 'Hyderabad',
          destCity: formData.dropPincode ? (formData.pickupPincode === formData.dropPincode ? 'Hyderabad' : 'Vijayawada') : 'Hyderabad',
          actualWeight: parseFloat(formData.weight) || 1,
          length: parseFloat(formData.length) || 10,
          width: parseFloat(formData.width) || 10,
          height: parseFloat(formData.height) || 10,
          category: formData.category,
          speed: formData.speed,
          parcelValue: formData.purpose === 'Business' ? (parseFloat(formData.value) || 0) : 0
        };
        const res = await api.post('/bookings/estimate', payload);
        const data = res.data.data.breakdown;
        
        const codCharge = formData.purpose === 'Business' ? (parseFloat(formData.value) || 0) * 0.02 : 0;
        
        setEstimatedPrice({
          base: data.baseCost,
          handlingFee: data.handlingFee,
          surcharges: data.surcharges,
          gst: data.gst,
          codCharge: codCharge,
          total: data.totalCustomerPrice + codCharge
        });
      } catch (err) {
        console.error('Estimate failed', err);
      }
    };
    
    if (currentStep >= 3) {
      const timeoutId = setTimeout(() => fetchEstimate(), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, currentStep]);

  const categories = [
    { name: 'Document', icon: FileText },
    { name: 'Clothes', icon: Shirt },
    { name: 'Fertilizers', icon: Leaf },
    { name: 'Books', icon: Book },
    { name: 'Electronics', icon: Monitor },
    { name: 'Medicine', icon: Pill },
    { name: 'Fragile Item', icon: GlassWater },
    { name: 'Commercial Package', icon: Briefcase },
    { name: 'General Parcel', icon: Package }
  ];

  const inputClass = "w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#fb5c00] focus:ring-4 focus:ring-[#fb5c00]/10 outline-none font-bold text-slate-800 transition-all duration-300 shadow-inner hover:bg-slate-100 placeholder:text-slate-400 placeholder:font-medium";

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
          purpose: formData.purpose, category: formData.category, weight: parseFloat(formData.weight) || 0, 
          value: formData.purpose === 'Business' ? (parseFloat(formData.value) || 0) : 0, 
          description: formData.description, fragile: formData.fragile, prohibitedDeclared: formData.prohibitedDeclared,
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
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { step: 1, label: 'Pickup', icon: Navigation },
    { step: 2, label: 'Drop', icon: MapPin },
    { step: 3, label: 'Parcel', icon: Package },
    { step: 4, label: 'Options', icon: Zap },
    { step: 5, label: 'Payment', icon: CreditCard }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white p-5 sm:p-8 md:p-12 mb-28 md:mb-8 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#fb5c00]/10 to-[#FFB703]/20 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#fb5c00]/10 to-[#83C5BE]/20 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>

      {currentStep < 6 && (
        <div className="mb-12 sm:mb-16 relative z-10 max-w-4xl mx-auto">
          <div className="flex justify-between items-center relative px-2 sm:px-0">
            <div className="absolute left-0 right-0 top-1/2 h-2 bg-slate-100 -z-10 rounded-full transform -translate-y-1/2 shadow-inner"></div>
            <div className="absolute left-0 top-1/2 h-2 bg-gradient-to-r from-[#fb5c00] to-[#FFB703] -z-10 rounded-full transform -translate-y-1/2 transition-all duration-700 ease-in-out shadow-[0_0_20px_rgba(251,92,0,0.5)]" style={{ width: `${((currentStep - 1) / 4) * 100}%` }}></div>
            
            {steps.map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-3 relative">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shadow-sm ${currentStep >= item.step ? 'bg-gradient-to-br from-[#fb5c00] to-orange-500 text-white scale-110 shadow-lg shadow-[#fb5c00]/40 border border-white/20' : 'bg-white border-2 border-slate-100 text-slate-300'}`}>
                  <item.icon size={24} className={currentStep === item.step ? 'animate-pulse' : ''} />
                </div>
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest hidden md:block transition-colors duration-300 ${currentStep >= item.step ? 'text-[#fb5c00]' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-5 bg-red-50 text-red-700 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-sm max-w-4xl mx-auto">
          <AlertCircle size={24} className="text-red-500" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN: MAIN FORM */}
        <div className={`lg:col-span-${currentStep >= 3 && currentStep < 6 ? '2' : '3'} max-w-4xl mx-auto w-full ${currentStep >= 3 && currentStep < 6 ? 'pb-32 lg:pb-0' : ''}`}>
          
          {/* STEP 1: Pickup Location */}
          {currentStep === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Pickup Details</h2>
                <p className="text-slate-500 mt-2 text-lg">Where should our rider collect the package?</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] border border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] space-y-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#fb5c00]/10 text-[#fb5c00] flex items-center justify-center shadow-inner"><Navigation size={26} className="transform rotate-45" /></div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Location</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Pincode</label>
                    <input type="text" name="pickupPincode" value={formData.pickupPincode} onChange={handleInputChange} className={inputClass} placeholder="e.g. 500001" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Full Address</label>
                    <textarea rows="3" name="pickupAddress" value={formData.pickupAddress} onChange={handleInputChange} className={`${inputClass} resize-none`} placeholder="House no, street name, landmark..."></textarea>
                  </div>
                </div>

                <div className="border-t-2 border-slate-50 pt-8 mt-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-inner"><User size={26} /></div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Sender Contact</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Full Name</label>
                      <input type="text" name="senderName" value={formData.senderName} onChange={handleInputChange} readOnly className={`${inputClass} bg-slate-100 cursor-not-allowed opacity-80`} placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Phone Number</label>
                      <input type="tel" name="senderPhone" value={formData.senderPhone} onChange={handleInputChange} readOnly className={`${inputClass} bg-slate-100 cursor-not-allowed opacity-80`} placeholder="+91 9876543210" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Email (For OTP)</label>
                      <input type="email" name="senderEmail" value={formData.senderEmail} onChange={handleInputChange} readOnly={hasEmailInDB} className={`${inputClass} ${hasEmailInDB ? 'bg-slate-100 cursor-not-allowed opacity-80' : ''}`} placeholder={hasEmailInDB ? "" : "Enter your email"} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Drop Location */}
          {currentStep === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Drop Details</h2>
                <p className="text-slate-500 mt-2 text-lg">Where is the package going?</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] border border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] space-y-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#E29578]/10 text-[#E29578] flex items-center justify-center shadow-inner"><MapPin size={26} /></div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Destination</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Pincode</label>
                    <input type="text" name="dropPincode" value={formData.dropPincode} onChange={handleInputChange} className={inputClass} placeholder="e.g. 500081" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Full Address</label>
                    <textarea rows="3" name="dropAddress" value={formData.dropAddress} onChange={handleInputChange} className={`${inputClass} resize-none`} placeholder="Receiver's house no, street name..."></textarea>
                  </div>
                </div>

                <div className="border-t-2 border-slate-50 pt-8 mt-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-inner"><User size={26} /></div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Receiver Contact</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Full Name</label>
                      <input type="text" name="receiverName" value={formData.receiverName} onChange={handleInputChange} className={inputClass} placeholder="Jane Smith" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Phone Number</label>
                      <input type="tel" name="receiverPhone" value={formData.receiverPhone} onChange={handleInputChange} className={inputClass} placeholder="+91 9876543210" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Email (For OTP)</label>
                      <input type="email" name="receiverEmail" value={formData.receiverEmail} onChange={handleInputChange} className={inputClass} placeholder="jane@example.com" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Parcel Details */}
          {currentStep === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Parcel Details</h2>
                <p className="text-slate-500 mt-2 text-lg">What exactly are you sending today?</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] border border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] space-y-10">
                
                {/* Purpose Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Purpose of Shipment</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`cursor-pointer rounded-[2rem] border-2 ${formData.purpose === 'Personal' ? 'bg-gradient-to-br from-[#fb5c00]/5 to-transparent border-[#fb5c00] shadow-[0_8px_30px_rgba(251,92,0,0.15)] ring-4 ring-[#fb5c00]/10 scale-[1.02]' : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'} p-6 sm:p-8 text-center transition-all duration-300 relative overflow-hidden group`}>
                      <input type="radio" name="purpose" value="Personal" checked={formData.purpose === 'Personal'} onChange={handleInputChange} className="hidden" />
                      <User size={32} className={`mx-auto mb-4 transition-colors ${formData.purpose === 'Personal' ? 'text-[#fb5c00]' : 'text-slate-400'}`} />
                      <span className={`font-black tracking-tight text-2xl block mb-2 ${formData.purpose === 'Personal' ? 'text-[#fb5c00]' : 'text-slate-700'}`}>Personal</span>
                      <span className="text-sm font-medium text-slate-500 block">Gifts, documents, belongings</span>
                    </label>
                    <label className={`cursor-pointer rounded-[2rem] border-2 ${formData.purpose === 'Business' ? 'bg-gradient-to-br from-[#fb5c00]/5 to-transparent border-[#fb5c00] shadow-[0_8px_30px_rgba(251,92,0,0.15)] ring-4 ring-[#fb5c00]/10 scale-[1.02]' : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'} p-6 sm:p-8 text-center transition-all duration-300 relative overflow-hidden group`}>
                      <input type="radio" name="purpose" value="Business" checked={formData.purpose === 'Business'} onChange={handleInputChange} className="hidden" />
                      <Briefcase size={32} className={`mx-auto mb-4 transition-colors ${formData.purpose === 'Business' ? 'text-[#fb5c00]' : 'text-slate-400'}`} />
                      <span className={`font-black tracking-tight text-2xl block mb-2 ${formData.purpose === 'Business' ? 'text-[#fb5c00]' : 'text-slate-700'}`}>Business</span>
                      <span className="text-sm font-medium text-slate-500 block">COD remittance & commercial</span>
                    </label>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Category</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map(cat => (
                      <label key={cat.name} className={`cursor-pointer rounded-3xl border-2 ${formData.category === cat.name ? 'bg-gradient-to-br from-[#fb5c00]/5 to-transparent border-[#fb5c00] shadow-[0_8px_25px_rgba(251,92,0,0.15)] scale-[1.03] ring-2 ring-[#fb5c00]/20' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50 hover:shadow-md hover:scale-[1.02]'} p-5 flex flex-col items-center justify-center gap-4 text-center transition-all duration-300 group`}>
                        <input type="radio" name="category" value={cat.name} checked={formData.category === cat.name} onChange={handleInputChange} className="hidden" />
                        <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 ${formData.category === cat.name ? 'bg-gradient-to-br from-[#fb5c00] to-orange-500 text-white shadow-[0_8px_20px_rgba(251,92,0,0.4)]' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                          <cat.icon size={28} strokeWidth={2} className={`transition-transform duration-300 ${formData.category === cat.name ? 'scale-110' : ''}`} />
                        </div>
                        <span className={`text-[11px] sm:text-xs uppercase tracking-widest font-black transition-colors ${formData.category === cat.name ? 'text-[#fb5c00]' : 'text-slate-600'}`}>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Weight & Declared Value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t-2 border-slate-50">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Est. Weight (kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className={inputClass} placeholder="e.g. 2.5" />
                  </div>
                  
                  {/* ONLY SHOW IF BUSINESS */}
                  {formData.purpose === 'Business' && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">Declared Value (₹) <span className="text-emerald-500 ml-1 font-black">*COD Amount</span></label>
                      <input type="number" name="value" value={formData.value} onChange={handleInputChange} required placeholder="Amount to collect from receiver" className={`${inputClass} border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/10`} />
                    </div>
                  )}
                </div>

                {/* Dimensions (Conditional) */}
                {needsDimensions && (
                  <div className="bg-slate-50/80 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Dimensions in CM (L x W x H)</label>
                    <div className="grid grid-cols-3 gap-4 mb-5">
                      <input type="number" name="length" value={formData.length} onChange={handleInputChange} placeholder="L" className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#fb5c00] outline-none text-center font-bold text-slate-800 shadow-sm" />
                      <input type="number" name="width" value={formData.width} onChange={handleInputChange} placeholder="W" className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#fb5c00] outline-none text-center font-bold text-slate-800 shadow-sm" />
                      <input type="number" name="height" value={formData.height} onChange={handleInputChange} placeholder="H" className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:border-[#fb5c00] outline-none text-center font-bold text-slate-800 shadow-sm" />
                    </div>
                    {formData.length && formData.width && formData.height && (
                      <div className="bg-emerald-50 text-emerald-700 px-5 py-3 rounded-2xl text-sm font-black inline-flex items-center gap-2 border border-emerald-100 shadow-sm">
                         <Calculator size={18} /> Volumetric Weight: {((parseFloat(formData.length) * parseFloat(formData.width) * parseFloat(formData.height)) / 5000).toFixed(2)} kg
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* STEP 4: Options */}
          {currentStep === 4 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Delivery Options</h2>
                <p className="text-slate-500 mt-2 text-lg">Choose speed, scheduling, and upload photos.</p>
              </div>

              {/* Speed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <label className={`cursor-pointer p-8 rounded-[2.5rem] border-2 ${formData.speed === 'Standard' ? 'bg-gradient-to-br from-[#fb5c00]/5 to-transparent border-[#fb5c00] shadow-[0_8px_30px_rgba(251,92,0,0.15)] ring-4 ring-[#fb5c00]/10 scale-[1.02]' : 'bg-white border-slate-100 hover:shadow-lg hover:scale-[1.02]'} transition-all duration-300`}>
                  <input type="radio" name="speed" value="Standard" checked={formData.speed === 'Standard'} onChange={handleInputChange} className="hidden" />
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-3xl tracking-tight text-slate-800">Standard</h3>
                    <div className={`p-3 rounded-[1.25rem] ${formData.speed === 'Standard' ? 'bg-[#fb5c00] text-white shadow-lg shadow-[#fb5c00]/40' : 'bg-slate-100 text-slate-400'}`}>
                      <Truck size={32} />
                    </div>
                  </div>
                  <p className="text-base font-medium text-slate-500 leading-relaxed">Normal delivery route. Usually takes 24-48 hours depending on distance.</p>
                </label>
                
                <label className={`cursor-pointer p-8 rounded-[2.5rem] border-2 ${formData.speed === 'Express' ? 'bg-gradient-to-br from-[#FFB703]/5 to-transparent border-[#FFB703] shadow-[0_8px_30px_rgba(255,183,3,0.15)] ring-4 ring-[#FFB703]/10 scale-[1.02]' : 'bg-white border-slate-100 hover:shadow-lg hover:scale-[1.02]'} transition-all duration-300`}>
                  <input type="radio" name="speed" value="Express" checked={formData.speed === 'Express'} onChange={handleInputChange} className="hidden" />
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-3xl tracking-tight text-slate-800">Express</h3>
                    <div className={`p-3 rounded-[1.25rem] ${formData.speed === 'Express' ? 'bg-[#FFB703] text-white shadow-lg shadow-[#FFB703]/40' : 'bg-slate-100 text-slate-400'}`}>
                      <Zap size={32} />
                    </div>
                  </div>
                  <p className="text-base font-medium text-slate-500 leading-relaxed">Priority routing. Delivered as fast as possible. Surcharge applies.</p>
                </label>
              </div>

              {/* Scheduling */}
              <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] space-y-8">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Scheduling</label>
                <div className="flex gap-8">
                  {['Now', 'Later'].map(type => (
                    <label key={type} className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-8 h-8 rounded-full border-[3px] flex items-center justify-center transition-all ${formData.schedulingType === type ? 'border-[#fb5c00] bg-[#fb5c00] shadow-[0_0_15px_rgba(251,92,0,0.4)]' : 'border-slate-300 bg-white group-hover:border-[#fb5c00]/50'}`}>
                        {formData.schedulingType === type && <div className="w-3 h-3 bg-white rounded-full"></div>}
                      </div>
                      <input type="radio" name="schedulingType" value={type} checked={formData.schedulingType === type} onChange={handleInputChange} className="hidden" />
                      <span className={`text-xl font-black tracking-tight transition-colors ${formData.schedulingType === type ? 'text-[#fb5c00]' : 'text-slate-600'}`}>Pickup {type}</span>
                    </label>
                  ))}
                </div>

                {formData.schedulingType === 'Later' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 pt-6 border-t-2 border-slate-50">
                    <input type="date" name="scheduleDate" value={formData.scheduleDate} onChange={handleInputChange} className={inputClass} />
                    <select name="scheduleTime" value={formData.scheduleTime} onChange={handleInputChange} className={inputClass}>
                      <option value="">Select Time Slot</option>
                      <option value="09:00-12:00">09:00 AM - 12:00 PM</option>
                      <option value="12:00-15:00">12:00 PM - 03:00 PM</option>
                      <option value="15:00-18:00">03:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Photos */}
              <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 ml-1">Mandatory Photos</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div 
                    onClick={() => setFormData({...formData, parcelPhoto: !formData.parcelPhoto})}
                    className={`border-[3px] ${formData.parcelPhoto ? 'border-emerald-500 bg-emerald-50/50 shadow-md scale-[1.02]' : 'border-dashed border-slate-200 bg-slate-50 hover:border-[#fb5c00] hover:bg-white'} cursor-pointer p-6 rounded-[2rem] flex flex-col items-center justify-center transition-all`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all ${formData.parcelPhoto ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'bg-white text-slate-300 shadow-inner'}`}>
                       {formData.parcelPhoto ? <CheckCircle2 size={28}/> : <span className="text-2xl font-black">+</span>}
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Parcel Photo *</span>
                  </div>
                  <div 
                    onClick={() => setFormData({...formData, senderPhoto: !formData.senderPhoto})}
                    className={`border-[3px] ${formData.senderPhoto ? 'border-emerald-500 bg-emerald-50/50 shadow-md scale-[1.02]' : 'border-dashed border-slate-200 bg-slate-50 hover:border-[#fb5c00] hover:bg-white'} cursor-pointer p-6 rounded-[2rem] flex flex-col items-center justify-center transition-all`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all ${formData.senderPhoto ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'bg-white text-slate-300 shadow-inner'}`}>
                       {formData.senderPhoto ? <CheckCircle2 size={28}/> : <span className="text-2xl font-black">+</span>}
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Sender Photo</span>
                  </div>
                  <div 
                    onClick={() => setFormData({...formData, billPhoto: !formData.billPhoto})}
                    className={`border-[3px] ${formData.billPhoto ? 'border-emerald-500 bg-emerald-50/50 shadow-md scale-[1.02]' : 'border-dashed border-slate-200 bg-slate-50 hover:border-[#fb5c00] hover:bg-white'} cursor-pointer p-6 rounded-[2rem] flex flex-col items-center justify-center transition-all`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all ${formData.billPhoto ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'bg-white text-slate-300 shadow-inner'}`}>
                       {formData.billPhoto ? <CheckCircle2 size={28}/> : <span className="text-2xl font-black">+</span>}
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest text-center">Bill Photo<br/><span className="text-[10px] text-slate-500 capitalize font-bold mt-1 block">(High Value)</span></span>
                  </div>
                </div>
              </div>

              {/* Fragile Toggle */}
              <div className="flex items-center gap-6 bg-amber-500/10 border-2 border-amber-500/20 backdrop-blur-xl p-8 rounded-[2.5rem] cursor-pointer hover:bg-amber-500/15 hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => setFormData({...formData, fragile: !formData.fragile})}>
                <div className={`w-10 h-10 shrink-0 rounded-2xl border-[3px] flex items-center justify-center transition-all ${formData.fragile ? 'bg-amber-500 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'border-amber-400/50 bg-white'}`}>
                  {formData.fragile && <CheckCircle2 size={24} />}
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-900 tracking-tight">Fragile Item</p>
                  <p className="text-base font-medium text-amber-700/80 mt-1">Requires extra careful handling during transit.</p>
                </div>
              </div>

            </div>
          )}

          {/* STEP 5: Payment */}
          {currentStep === 5 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Payment Details</h2>
                <p className="text-slate-500 mt-2 text-lg">Review your shipment and select payment method.</p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl border border-white p-6 sm:p-10 rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] space-y-10">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Who pays for delivery?</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <label className={`cursor-pointer rounded-[2rem] border-2 ${formData.payer === 'Sender' ? 'bg-gradient-to-br from-[#fb5c00]/5 to-transparent border-[#fb5c00] shadow-[0_8px_25px_rgba(251,92,0,0.15)] ring-4 ring-[#fb5c00]/10 scale-[1.02]' : 'bg-white border-slate-100 hover:bg-slate-50 hover:shadow-md'} p-6 text-center transition-all duration-300`}>
                        <input type="radio" name="payer" value="Sender" checked={formData.payer === 'Sender'} onChange={handleInputChange} className="hidden" />
                        <span className={`font-black tracking-tight text-xl ${formData.payer === 'Sender' ? 'text-[#fb5c00]' : 'text-slate-700'}`}>Prepaid (Sender Pays)</span>
                      </label>
                      <label className={`cursor-pointer rounded-[2rem] border-2 ${formData.payer === 'Receiver' ? 'bg-gradient-to-br from-[#fb5c00]/5 to-transparent border-[#fb5c00] shadow-[0_8px_25px_rgba(251,92,0,0.15)] ring-4 ring-[#fb5c00]/10 scale-[1.02]' : 'bg-white border-slate-100 hover:bg-slate-50 hover:shadow-md'} p-6 text-center transition-all duration-300`}>
                        <input type="radio" name="payer" value="Receiver" checked={formData.payer === 'Receiver'} onChange={handleInputChange} className="hidden" />
                        <span className={`font-black tracking-tight text-xl ${formData.payer === 'Receiver' ? 'text-[#fb5c00]' : 'text-slate-700'}`}>To-Pay (Receiver Pays)</span>
                      </label>
                   </div>
                 </div>

                 <div className="pt-8 border-t-2 border-slate-50">
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Payment Method</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                     <label className={`cursor-pointer rounded-[2rem] border-2 ${formData.paymentMode === 'UPI' ? 'bg-gradient-to-br from-[#fb5c00]/5 to-transparent border-[#fb5c00] shadow-[0_8px_25px_rgba(251,92,0,0.15)] ring-4 ring-[#fb5c00]/10 scale-[1.02]' : 'bg-white border-slate-100 hover:bg-slate-50 hover:shadow-md'} p-6 flex items-center gap-5 transition-all duration-300`}>
                       <input type="radio" name="paymentMode" value="UPI" checked={formData.paymentMode === 'UPI'} onChange={handleInputChange} className="hidden" />
                       <div className={`w-8 h-8 rounded-full border-[3px] flex items-center justify-center transition-all ${formData.paymentMode === 'UPI' ? 'border-[#fb5c00] shadow-[0_0_15px_rgba(251,92,0,0.4)]' : 'border-slate-300 bg-slate-50'}`}>
                         {formData.paymentMode === 'UPI' && <div className="w-4 h-4 bg-[#fb5c00] rounded-full"></div>}
                       </div>
                       <span className={`font-black tracking-tight text-xl ${formData.paymentMode === 'UPI' ? 'text-[#fb5c00]' : 'text-slate-700'}`}>UPI / Online</span>
                     </label>
                     <label className={`cursor-pointer rounded-[2rem] border-2 ${formData.paymentMode === 'Cash' ? 'bg-gradient-to-br from-[#fb5c00]/5 to-transparent border-[#fb5c00] shadow-[0_8px_25px_rgba(251,92,0,0.15)] ring-4 ring-[#fb5c00]/10 scale-[1.02]' : 'bg-white border-slate-100 hover:bg-slate-50 hover:shadow-md'} p-6 flex items-center gap-5 transition-all duration-300`}>
                       <input type="radio" name="paymentMode" value="Cash" checked={formData.paymentMode === 'Cash'} onChange={handleInputChange} className="hidden" />
                       <div className={`w-8 h-8 rounded-full border-[3px] flex items-center justify-center transition-all ${formData.paymentMode === 'Cash' ? 'border-[#fb5c00] shadow-[0_0_15px_rgba(251,92,0,0.4)]' : 'border-slate-300 bg-slate-50'}`}>
                         {formData.paymentMode === 'Cash' && <div className="w-4 h-4 bg-[#fb5c00] rounded-full"></div>}
                       </div>
                       <span className={`font-black tracking-tight text-xl ${formData.paymentMode === 'Cash' ? 'text-[#fb5c00]' : 'text-slate-700'}`}>Cash on {formData.payer === 'Sender' ? 'Pickup' : 'Delivery'}</span>
                     </label>
                   </div>
                 </div>
              </div>

              <div className="flex items-start gap-5 bg-red-500/5 border-2 border-red-500/20 backdrop-blur-xl p-8 rounded-[2.5rem] cursor-pointer hover:bg-red-500/10 hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => setFormData({...formData, prohibitedDeclared: !formData.prohibitedDeclared})}>
                <div className={`w-8 h-8 shrink-0 rounded-xl border-[3px] flex items-center justify-center transition-all mt-1 ${formData.prohibitedDeclared ? 'bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-red-400/50 bg-white'}`}>
                  {formData.prohibitedDeclared && <CheckCircle2 size={22} />}
                </div>
                <p className="text-base sm:text-lg font-bold text-red-900 leading-relaxed tracking-tight">I declare that this parcel does not contain any illegal, hazardous, flammable, or prohibited items as per ZyperGo's terms.</p>
              </div>
            </div>
          )}

          {/* STEP 6: Success */}
          {currentStep === 6 && bookingResult && (
            <div className="text-center py-20 animate-in zoom-in-95 duration-500">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-[0_15px_40px_rgba(16,185,129,0.4)] transform rotate-3">
                <CheckCircle2 size={72} className="-rotate-3" />
              </div>
              <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Booking Confirmed!</h2>
              <p className="text-slate-500 mb-12 max-w-md mx-auto text-xl leading-relaxed">Your shipment has been registered successfully. A rider will be assigned shortly.</p>
              
              <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] inline-block text-center border-2 border-slate-100 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] mb-12 min-w-[350px]">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Tracking ID</p>
                <p className="text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-[#fb5c00] to-orange-500">{bookingResult.trackingId}</p>
              </div>
              
              <div>
                <button onClick={() => navigate(`/customer/track?id=${bookingResult.trackingId}`)} className="bg-gradient-to-r from-[#fb5c00] to-orange-500 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-[0_10px_25px_rgba(251,92,0,0.4)] hover:shadow-[0_15px_35px_rgba(251,92,0,0.5)] transition-all hover:-translate-y-1">
                  Track Shipment Live
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons for Left Column */}
          {currentStep < 6 && (
            <div className={`mt-16 pt-10 border-t-2 border-slate-100 ${currentStep >= 3 ? 'hidden lg:flex justify-between' : 'flex justify-between'}`}>
              {currentStep > 1 ? (
                <button onClick={prevStep} className="flex items-center gap-3 px-8 sm:px-10 py-5 rounded-2xl font-black text-slate-500 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300 text-base sm:text-lg">
                  <ArrowLeft size={20} /> <span className="hidden sm:inline">Back</span>
                </button>
              ) : <div></div>}
              
              {currentStep < 5 ? (
                <button onClick={nextStep} className="flex items-center gap-4 px-10 sm:px-14 py-5 rounded-2xl font-black text-white bg-gradient-to-r from-[#fb5c00] to-orange-500 hover:from-orange-500 hover:to-orange-400 transition-all shadow-[0_8px_25px_rgba(251,92,0,0.4)] hover:shadow-[0_12px_30px_rgba(251,92,0,0.5)] hover:-translate-y-1 duration-300 text-base sm:text-lg">
                  Next Step <ArrowRight size={20} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-4 px-10 sm:px-14 py-5 rounded-2xl font-black text-white bg-gradient-to-r from-[#fb5c00] to-[#FFB703] hover:from-[#FFB703] hover:to-[#fb5c00] transition-all shadow-[0_8px_25px_rgba(255,183,3,0.4)] hover:shadow-[0_12px_30px_rgba(255,183,3,0.5)] hover:-translate-y-1 duration-300 text-base sm:text-lg disabled:opacity-70 disabled:cursor-not-allowed">
                  {loading ? 'Confirming...' : 'Confirm Booking'} <CheckCircle2 size={20} />
                </button>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: STICKY PRICE BREAKDOWN (Desktop) */}
        {currentStep >= 3 && currentStep < 6 && (
          <div className="hidden lg:block col-span-1 animate-in fade-in slide-in-from-right-8">
            <div className="sticky top-8 bg-slate-900 text-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-700/50">
               <div className="absolute top-0 right-0 w-40 h-40 bg-[#fb5c00]/20 rounded-bl-[5rem] blur-3xl -z-10"></div>
               
               <h3 className="font-black text-3xl tracking-tight mb-10 flex items-center gap-4"><Calculator className="text-[#fb5c00]" size={32} /> Cost Estimate</h3>
               
               <div className="space-y-8">
                 {/* Route Info */}
                 {(formData.pickupPincode || formData.dropPincode) && (
                   <div className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-inner">
                     <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Route</p>
                     <p className="font-mono font-black text-xl flex items-center justify-between">
                        <span>{formData.pickupPincode || '___'}</span> 
                        <ArrowRight size={20} className="text-[#fb5c00]" /> 
                        <span>{formData.dropPincode || '___'}</span>
                     </p>
                   </div>
                 )}

                 {/* Calculations */}
                 <div className="space-y-5">
                   <div className="flex justify-between items-center pb-4 border-b border-white/10">
                     <span className="text-slate-300 font-bold text-base">Shipping Cost</span>
                     <span className="font-black text-xl">₹{estimatedPrice.base}</span>
                   </div>
                   {estimatedPrice.handlingFee > 0 && (
                     <div className="flex justify-between items-center pb-4 border-b border-white/10">
                       <span className="text-slate-300 font-bold text-base">Handling Fee</span>
                       <span className="font-black text-xl">₹{estimatedPrice.handlingFee}</span>
                     </div>
                   )}
                   {estimatedPrice.surcharges > 0 && (
                     <div className="flex justify-between items-center pb-4 border-b border-white/10">
                       <span className="text-slate-300 font-bold text-base">Surcharges ({formData.speed})</span>
                       <span className="font-black text-xl">₹{estimatedPrice.surcharges}</span>
                     </div>
                   )}
                   {estimatedPrice.gst > 0 && (
                     <div className="flex justify-between items-center pb-4 border-b border-white/10">
                       <span className="text-slate-300 font-bold text-base">GST</span>
                       <span className="font-black text-xl">₹{estimatedPrice.gst}</span>
                     </div>
                   )}
                   {formData.purpose === 'Business' && estimatedPrice.codCharge > 0 && (
                     <div className="flex justify-between items-center pb-4 border-b border-white/10 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 -mx-3">
                       <span className="text-emerald-400 font-bold text-base flex items-center gap-2"><ShieldCheck size={18}/> COD Fee (2%)</span>
                       <span className="font-black text-xl text-emerald-400">₹{estimatedPrice.codCharge.toFixed(2)}</span>
                     </div>
                   )}
                   {formData.purpose === 'Business' && formData.value && (
                     <div className="flex justify-between items-center pt-2">
                       <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">COD To Collect</span>
                       <span className="font-black text-2xl text-emerald-500">₹{formData.value}</span>
                     </div>
                   )}
                 </div>

                 {/* Total */}
                 <div className="pt-6 mt-6 border-t-2 border-white/10">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Estimated Total</p>
                   <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">₹{estimatedPrice.total}</p>
                 </div>
                 
                 <div className="mt-10 pt-8 border-t border-white/5 text-sm text-slate-500 font-medium leading-relaxed">
                   * This is an estimated cost based on standard pricing. The final price may vary depending on actual volumetric weight and any applicable handling surcharges.
                 </div>
               </div>
            </div>
          </div>
        )}

      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      {currentStep >= 3 && currentStep < 6 && (
        <div className={`lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-2xl text-white shadow-[0_-20px_50px_rgba(0,0,0,0.3)] z-50 transition-all duration-500 border-t border-slate-700/50 rounded-t-[2.5rem] ${showMobileCost ? 'h-[75vh]' : 'h-auto'}`}>
          <div className="max-w-md mx-auto p-6 flex flex-col h-full relative">
            
            {/* Toggle Header */}
            <div 
              className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-slate-300 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg border border-slate-700 hover:bg-slate-700 transition-colors z-50"
              onClick={() => setShowMobileCost(!showMobileCost)}
            >
              {showMobileCost ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
            </div>

            {/* Collapsed View (Always visible part) */}
            <div className="flex justify-between items-center mt-2">
              <div onClick={() => setShowMobileCost(!showMobileCost)} className="cursor-pointer">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">Est. Total <span className="text-[#fb5c00] underline">(Tap for details)</span></p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-white">₹{estimatedPrice.total}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={prevStep} className="bg-slate-800 text-slate-300 w-12 h-[52px] rounded-2xl flex items-center justify-center shadow-inner hover:bg-slate-700 transition-colors border border-slate-700">
                  <ArrowLeft size={20} />
                </button>
                <button onClick={currentStep === 5 ? handleSubmit : nextStep} disabled={loading} className="bg-gradient-to-r from-[#fb5c00] to-orange-500 text-white px-6 py-4 rounded-2xl font-black text-lg shadow-[0_8px_20px_rgba(251,92,0,0.4)] hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2">
                  {currentStep === 5 ? (loading ? 'Processing' : 'Confirm') : 'Next'} <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Expanded Breakdown */}
            <div className={`mt-8 space-y-6 overflow-y-auto transition-all duration-500 pb-20 ${showMobileCost ? 'opacity-100' : 'opacity-0 hidden'}`}>
                 {(formData.pickupPincode || formData.dropPincode) && (
                   <div className="bg-white/5 rounded-3xl p-5 border border-white/10">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Route</p>
                     <p className="font-mono font-black text-xl flex items-center justify-between">
                        <span>{formData.pickupPincode || '___'}</span> 
                        <ArrowRight size={20} className="text-[#fb5c00]" /> 
                        <span>{formData.dropPincode || '___'}</span>
                     </p>
                   </div>
                 )}

                 <div className="space-y-4">
                   <div className="flex justify-between items-center pb-4 border-b border-white/10">
                     <span className="text-slate-300 font-bold text-base">Shipping Cost</span>
                     <span className="font-black text-xl">₹{estimatedPrice.base}</span>
                   </div>
                   {estimatedPrice.handlingFee > 0 && (
                     <div className="flex justify-between items-center pb-4 border-b border-white/10">
                       <span className="text-slate-300 font-bold text-base">Handling Fee</span>
                       <span className="font-black text-xl">₹{estimatedPrice.handlingFee}</span>
                     </div>
                   )}
                   {estimatedPrice.surcharges > 0 && (
                     <div className="flex justify-between items-center pb-4 border-b border-white/10">
                       <span className="text-slate-300 font-bold text-base">Surcharges ({formData.speed})</span>
                       <span className="font-black text-xl">₹{estimatedPrice.surcharges}</span>
                     </div>
                   )}
                   {estimatedPrice.gst > 0 && (
                     <div className="flex justify-between items-center pb-4 border-b border-white/10">
                       <span className="text-slate-300 font-bold text-base">GST</span>
                       <span className="font-black text-xl">₹{estimatedPrice.gst}</span>
                     </div>
                   )}
                   {formData.purpose === 'Business' && estimatedPrice.codCharge > 0 && (
                     <div className="flex justify-between items-center pb-4 border-b border-white/10 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 -mx-3">
                       <span className="text-emerald-400 font-bold text-base">COD Fee (2%)</span>
                       <span className="font-black text-xl text-emerald-400">₹{estimatedPrice.codCharge.toFixed(2)}</span>
                     </div>
                   )}
                   {formData.purpose === 'Business' && formData.value && (
                     <div className="flex justify-between items-center pt-2">
                       <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">COD To Collect</span>
                       <span className="font-black text-3xl text-emerald-500">₹{formData.value}</span>
                     </div>
                   )}
                 </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
