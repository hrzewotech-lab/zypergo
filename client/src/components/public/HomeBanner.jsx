import React, { useState } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HomeBanner() {
  const [activeTab, setActiveTab] = useState('book');
  const { scrollY } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="relative bg-slate-50 flex flex-col pt-20 pb-32 overflow-hidden perspective-1000">
      {/* Background Split & Decorative Shapes */}
      <div className="absolute inset-0 flex z-0 pointer-events-none overflow-hidden">
        <div className="w-1/2 bg-slate-50 relative">
           <motion.div style={{ y: y1 }} className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-blue-400/10 rounded-full blur-[120px]"></motion.div>
        </div>
        <div className="w-1/2 bg-slate-100 relative">
           <motion.div style={{ y: y2 }} className="absolute top-[10%] -right-[20%] w-[70%] h-[70%] bg-teal-400/10 rounded-full blur-[100px]"></motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-8 flex flex-col lg:flex-row items-center relative z-10">
        
        {/* Left Text Content */}
        <motion.div 
          style={{ opacity }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full lg:w-1/2 pr-0 lg:pr-12 mb-16 lg:mb-0"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase border border-blue-200"
          >
            Fast & Reliable
          </motion.span>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 leading-[1.05] tracking-tighter">
            Goods Delivery,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Simplified.</span><br/>
            Local & Intercity.
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-slate-600 mb-10 leading-relaxed max-w-md font-medium"
          >
            Experience seamless logistics tailored for your personal
            and business needs. Real-time tracking, transparent
            pricing, and trusted regional carriers.
          </motion.p>
        </motion.div>

        {/* Right Widget with 3D Effect */}
        <motion.div 
          initial={{ opacity: 0, y: 50, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          whileHover={{ scale: 1.02, rotateY: -2, rotateX: 2 }}
          className="w-full lg:w-1/2 flex justify-center lg:justify-end perspective-1000"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 border border-white w-full max-w-md overflow-hidden relative" style={{ transform: 'translateZ(20px)' }}>
            
            {/* Glossy reflection line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <button 
                onClick={() => setActiveTab('book')}
                className={`flex-1 py-5 text-sm font-bold text-center border-b-2 transition-all duration-300 ${activeTab === 'book' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Book Parcel
              </button>
              <button 
                onClick={() => setActiveTab('track')}
                className={`flex-1 py-5 text-sm font-bold text-center border-b-2 transition-all duration-300 ${activeTab === 'track' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Track Shipment
              </button>
            </div>

            {/* Widget Content */}
            <div className="p-8">
              {activeTab === 'book' && (
                <motion.div 
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  className="space-y-6"
                >
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Pickup Pincode</label>
                      <div className="relative group">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input type="text" placeholder="e.g. 500081" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none text-sm font-medium transition-all" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Drop Pincode</label>
                      <div className="relative group">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <input type="text" placeholder="e.g. 560001" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-transparent outline-none text-sm font-medium transition-all" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Approximate Weight (kg)</label>
                    <input type="text" placeholder="0.5" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none text-sm font-medium transition-all" />
                  </div>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0">
                    <ArrowRight size={18} /> Get Instant Quote
                  </button>
                </motion.div>
              )}
              {activeTab === 'track' && (
                <motion.div 
                  initial={{ opacity: 0, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  className="space-y-6"
                >
                   <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Tracking ID / AWB</label>
                    <input type="text" placeholder="e.g. ZYP12345678" className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none text-lg font-mono font-bold uppercase transition-all" />
                  </div>
                  <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0">
                    Track Parcel <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
