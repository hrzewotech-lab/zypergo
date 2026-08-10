import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Package, CheckCircle2, Truck, Box, Navigation, ArrowRight, Share2, Scale, Tag, User, MapPin, CreditCard, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function TrackShipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(id || '');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-search if ID is in URL
  useEffect(() => {
    if (id) {
      handleSearch(null, id);
    }
  }, [id]);

  const handleSearch = async (e, forceId = null) => {
    if (e) e.preventDefault();
    const searchId = forceId || trackingId;
    if (!searchId) return;

    setLoading(true);
    setError('');
    
    try {
      // Re-use partner scan API which fetches public shipment data by trackingId
      // In production, you'd want a separate public unauthenticated endpoint.
      const res = await fetch('/api/partner/shipments/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId: searchId })
      });
      const data = await res.json();
      if (res.ok) {
        setShipment(data.data);
        if (!forceId) navigate(`/track/${searchId}`);
      } else {
        setError('Tracking ID not found. Please check and try again.');
        setShipment(null);
      }
    } catch (err) {
      setError('Network error. Could not connect to tracking server.');
    } finally {
      setLoading(false);
    }
  };

  const statusMilestones = [
    { name: 'Booking Confirmed', icon: <Package size={20}/> },
    { name: 'Rider Assigned', icon: <User size={20}/> },
    { name: 'Picked Up', icon: <Box size={20}/> },
    { name: 'In Transit', icon: <Truck size={20}/> },
    { name: 'Out for Delivery', icon: <Navigation size={20}/> },
    { name: 'Delivered', icon: <CheckCircle2 size={20}/> }
  ];

  return (
    <div className="flex-1 bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Track Your Shipment</h1>
          <p className="text-slate-600">Enter your ZyperGo tracking ID or AWB number to see live updates.</p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md border border-slate-200 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                placeholder="e.g. ZYP12345678"
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-mono font-bold text-lg uppercase transition-colors"
              />
            </div>
            <button type="submit" disabled={loading || !trackingId} className="bg-[#0F172A] text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition shadow-lg">
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
          {error && <p className="text-red-500 font-bold mt-4 text-center text-sm">{error}</p>}
        </div>

        {/* Empty State / Informative Section */}
        {!shipment && !loading && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={itemVariants} whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner transform -rotate-3">
                <Search size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-3 tracking-tight">Find Your ID</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Your 11-digit tracking ID (e.g. ZYP12345678) is located on your physical receipt or in your confirmation email.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner transform rotate-3">
                <Truck size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-3 tracking-tight">Real-Time Updates</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Watch your shipment move through our network with precise hub-level tracking and live rider telemetry.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner transform -rotate-3">
                <User size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-3 tracking-tight">24/7 Support</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Questions about your delivery? Our logistics experts are available around the clock to assist you.</p>
            </motion.div>
          </motion.div>
        )}

        {/* Tracking Results */}
        {shipment && (
          <div className="bg-white rounded-2xl shadow-md border border-[#006D77]/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="bg-[#0F172A] p-6 text-white flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tracking Number</p>
                <h2 className="text-2xl font-black font-mono tracking-wide">{shipment.trackingId}</h2>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFB703] text-[#0F172A]`}>
                  {shipment.status}
                </span>
                <p className="text-sm mt-2 text-slate-300">Expected: {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Route Summary */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="text-center w-[40%]">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Origin</p>
                <p className="text-xl font-black text-[#0F172A]">{shipment.pickupLocation?.pincode}</p>
                <p className="text-xs text-slate-500 mt-1 truncate px-2">{shipment.pickupLocation?.address || 'ZyperGo Hub'}</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                <div className="flex items-center w-full">
                  <div className="h-[2px] w-full bg-[#006D77]/20 rounded-l-full"></div>
                  <Truck size={24} className="text-[#006D77] mx-2 shrink-0 animate-pulse"/>
                  <div className="h-[2px] w-full bg-slate-200 rounded-r-full"></div>
                </div>
                <span className="text-[10px] font-bold text-[#006D77] mt-2 tracking-widest uppercase bg-[#006D77]/10 px-2 py-0.5 rounded-full">{shipment.metadata?.deliveryType || 'Standard Delivery'}</span>
              </div>
              <div className="text-center w-[40%]">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Destination</p>
                <p className="text-xl font-black text-[#0F172A]">{shipment.dropLocation?.pincode}</p>
                <p className="text-xs text-slate-500 mt-1 truncate px-2">{shipment.dropLocation?.address || 'Destination'}</p>
              </div>
            </div>

            {/* Comprehensive Details Grid */}
            <div className="p-6 border-b border-slate-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Package Details */}
              <div className="border border-slate-100 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Box size={16} className="text-[#006D77]" /> Package Info
                </h3>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-0.5">Category</p>
                    <p className="font-bold text-slate-700">{shipment.packageDetails?.category || 'General Parcel'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-0.5">Weight</p>
                    <p className="font-bold text-slate-700 flex items-center gap-1"><Scale size={14} className="text-slate-400"/> {shipment.packageDetails?.weight || '--'} kg</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-0.5">Declared Value</p>
                    <p className="font-bold text-slate-700 flex items-center gap-1"><Tag size={14} className="text-slate-400"/> ₹{shipment.packageDetails?.value || '0'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-0.5">Payment</p>
                    <p className="font-bold text-emerald-600 flex items-center gap-1"><CreditCard size={14}/> {shipment.payment?.mode || 'UPI'} - {shipment.payment?.status || 'Pending'}</p>
                  </div>
                </div>
              </div>

              {/* People Details */}
              <div className="border border-slate-100 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <User size={16} className="text-[#FFB703]" /> Contact Info
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-slate-500">S</span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase mb-0.5">Sender</p>
                      <p className="font-bold text-slate-700">{shipment.sender?.name || 'Sender Info Hidden'}</p>
                      {shipment.sender?.phone && <p className="text-slate-500 text-xs mt-0.5">{shipment.sender.phone.replace(/.(?=.{4})/g, '*')}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#FFB703]/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#FFB703]">R</span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase mb-0.5">Receiver</p>
                      <p className="font-bold text-slate-700">{shipment.receiver?.name || 'Receiver Info Hidden'}</p>
                      {shipment.receiver?.phone && <p className="text-slate-500 text-xs mt-0.5">{shipment.receiver.phone.replace(/.(?=.{4})/g, '*')}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-8 pb-12">
              <h3 className="font-bold text-slate-900 mb-6">Tracking Timeline</h3>
              <div className="space-y-0 relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-4 bottom-4 w-1 bg-slate-100 z-0"></div>
                
                {shipment.trackingHistory?.map((history, idx) => {
                  const isLatest = idx === shipment.trackingHistory.length - 1;
                  return (
                    <div key={idx} className="relative z-10 flex gap-6 items-start">
                      <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center shrink-0 ${isLatest ? 'bg-[#006D77] text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                        {isLatest ? <CheckCircle2 size={20}/> : <div className="w-2 h-2 rounded-full bg-slate-400"></div>}
                      </div>
                      <div className={`pt-2 pb-8 ${!isLatest && 'opacity-60'}`}>
                        <h4 className={`font-bold ${isLatest ? 'text-[#006D77] text-lg' : 'text-slate-700'}`}>{history.status}</h4>
                        <p className="text-sm text-slate-500 mt-1">{history.description}</p>
                        <p className="text-xs text-slate-400 mt-1 font-mono">{new Date(history.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support CTA */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="font-bold text-slate-800">Need help with this shipment?</p>
                <p className="text-xs text-slate-500">Our support team is available 24/7 to assist you.</p>
              </div>
              <button onClick={() => navigate('/contact', { state: { trackingId: shipment.trackingId } })} className="text-white font-bold text-sm bg-[#006D77] px-6 py-3 rounded-xl shadow-lg hover:bg-[#00585f] hover:shadow-xl transition-all flex items-center gap-2">
                Contact Support <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


