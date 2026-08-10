import React, { useState, useRef } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MotionParticles from './MotionParticles';

export default function HomeBanner() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('book');
  
  // Form states
  const [bookingForm, setBookingForm] = useState({ pickupPin: '', dropPin: '', weight: '' });
  const [trackingId, setTrackingId] = useState('');
  const containerRef = useRef(null);
  
  const { scrollY } = useScroll();
  
  // Parallax background blobs
  const y1 = useTransform(scrollY, [0, 800], [0, 250]);
  const y2 = useTransform(scrollY, [0, 800], [0, -150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  // 3D Tilt for the widget
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleGetQuote = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (bookingForm.pickupPin) params.append('pickup', bookingForm.pickupPin);
    if (bookingForm.dropPin) params.append('drop', bookingForm.dropPin);
    if (bookingForm.weight) params.append('weight', bookingForm.weight);
    navigate(`/calculate?${params.toString()}`);
  };

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingId) {
      navigate(`/track/${trackingId}`);
    } else {
      navigate('/track');
    }
  };

  return (
    <div 
      className="relative min-h-[100vh] bg-cover bg-center bg-no-repeat flex flex-col pt-24 pb-16 overflow-hidden perspective-1000"
      style={{ backgroundImage: "url('/images/hero_bg.png')" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent z-0"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-transparent to-transparent z-0"></div>

      <MotionParticles count={25} />

      {/* Deep Space Background Mesh */}
      <div className="absolute inset-0 flex z-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-50">
        <div className="w-1/2 relative">
           <motion.div style={{ y: y1 }} className="absolute -top-[10%] -left-[20%] w-[100%] h-[100%] bg-blue-100/50 rounded-full blur-[150px]"></motion.div>
        </div>
        <div className="w-1/2 relative">
           <motion.div style={{ y: y2 }} className="absolute top-[20%] -right-[20%] w-[100%] h-[100%] bg-teal-100/50 rounded-full blur-[150px]"></motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-8 flex flex-col lg:flex-row items-center justify-center flex-grow relative z-10">
        
        {/* Left Text Content */}
        <motion.div 
          style={{ opacity }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full lg:w-1/2 pr-0 lg:pr-12 mb-16 lg:mb-0 pt-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#e0f2f1] text-[#006D77] text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-widest uppercase border border-teal-100 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006D77] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006D77]"></span>
            </span>
            Premium Logistics Redefined
          </motion.div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-[#0f172a] mb-6 leading-[1.1] tracking-tighter">
            Moving The World,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006D77] to-blue-600">One Package</span><br/>
            At A Time.
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-slate-600 mb-10 leading-relaxed max-w-md font-medium"
          >
            Experience seamless 3D tracking, intelligent routing, and premium B2B carrier networks. Welcome to the future of supply chain.
          </motion.p>
        </motion.div>

        {/* Right Widget with Interactive 3D Tilt */}
        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.2 }}
          className="w-full lg:w-1/2 flex justify-center lg:justify-end"
          style={{ perspective: 1500 }}
        >
          <motion.div 
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 w-full max-w-md overflow-hidden relative"
          >
            {/* Glossy reflection line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"></div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <button 
                onClick={() => setActiveTab('book')}
                className={`flex-1 py-5 text-sm font-bold text-center border-b-2 transition-all duration-300 ${activeTab === 'book' ? 'border-[#006D77] text-[#006D77] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                Book Parcel
              </button>
              <button 
                onClick={() => setActiveTab('track')}
                className={`flex-1 py-5 text-sm font-bold text-center border-b-2 transition-all duration-300 ${activeTab === 'track' ? 'border-[#006D77] text-[#006D77] bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                Track Shipment
              </button>
            </div>

            {/* Widget Content */}
            <div className="p-8" style={{ transform: 'translateZ(40px)' }}>
              {activeTab === 'book' && (
                <motion.form 
                  onSubmit={handleGetQuote}
                  initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.95 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                  className="space-y-6"
                >
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Pickup Pincode</label>
                      <div className="relative group">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006D77] transition-colors" />
                        <input type="text" value={bookingForm.pickupPin} onChange={e => setBookingForm({...bookingForm, pickupPin: e.target.value})} placeholder="e.g. 500081" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006D77] focus:bg-white text-slate-800 placeholder-slate-400 outline-none text-sm font-medium transition-all" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Drop Pincode</label>
                      <div className="relative group">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006D77] transition-colors" />
                        <input type="text" value={bookingForm.dropPin} onChange={e => setBookingForm({...bookingForm, dropPin: e.target.value})} placeholder="e.g. 560001" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006D77] focus:bg-white text-slate-800 placeholder-slate-400 outline-none text-sm font-medium transition-all" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Approximate Weight (kg)</label>
                    <input type="number" min="0.1" step="0.1" value={bookingForm.weight} onChange={e => setBookingForm({...bookingForm, weight: e.target.value})} placeholder="0.5" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006D77] focus:bg-white text-slate-800 placeholder-slate-400 outline-none text-sm font-medium transition-all" />
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-[#006D77] to-blue-600 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(0,109,119,0.3)] hover:shadow-[0_10px_40px_rgba(0,109,119,0.5)] transition-all hover:-translate-y-1">
                    <ArrowRight size={18} /> Get Instant Quote
                  </button>
                </motion.form>
              )}
              {activeTab === 'track' && (
                <motion.form 
                  onSubmit={handleTrack}
                  initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.95 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                  className="space-y-6"
                >
                   <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Tracking ID / AWB</label>
                    <input type="text" value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="e.g. ZYP12345678" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#006D77] focus:bg-white text-slate-800 placeholder-slate-400 outline-none text-lg font-mono font-bold uppercase transition-all" />
                  </div>
                  <button type="submit" className="w-full bg-[#0f172a] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    Track Parcel <ArrowRight size={18} />
                  </button>
                </motion.form>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
