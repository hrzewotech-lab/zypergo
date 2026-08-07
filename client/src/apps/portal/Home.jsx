import React from 'react';
import { Search, Truck, Zap, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-[#f8f9fa] font-sans overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-48 w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/hero_bg.png')" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl space-y-6"
          >
            <motion.div variants={fadeUp} className="inline-block px-3 py-1 bg-[#e0f2f1] text-[#006D77] text-xs font-bold uppercase tracking-widest rounded-sm mb-2 shadow-sm">
              Enterprise Logistics
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-4xl lg:text-5xl font-bold text-[#0f172a] leading-tight tracking-tight">
              Logistics Reimagined: <br/><span className="text-[#006D77]">Local & Intercity</span> <br/>Delivery Made Simple.
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-md leading-relaxed mt-6 font-medium">
              High-performance tracking, unyielding reliability, and transparent pricing. Built for businesses that move fast.
            </motion.p>
            
            <motion.div variants={fadeUp} className="mt-10 flex bg-white rounded-lg shadow-xl overflow-hidden max-w-lg border border-slate-100 focus-within:ring-4 focus-within:ring-[#006D77]/10 focus-within:border-[#006D77] transition-all">
              <div className="flex items-center pl-5 pr-3 text-slate-400">
                <Search size={20} strokeWidth={2.5} />
              </div>
              <input 
                type="text" 
                placeholder="Enter Tracking ID (e.g. ZYP-84920)" 
                className="flex-1 py-4 px-2 outline-none text-slate-700 placeholder-slate-400 text-sm font-bold"
              />
              <button className="bg-[#006D77] hover:bg-[#00585f] text-white px-8 font-extrabold text-sm transition-colors">
                Track Shipment
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Precision Routing Solutions */}
      <section className="py-24 bg-[#f8f9fa] relative z-20 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-[#0f172a] mb-4 tracking-tight">Precision Routing Solutions</h2>
            <p className="text-slate-500 text-lg font-medium">Tailored delivery networks designed for operational efficiency across all distances.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Card 1 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              whileHover={{ y: -8, rotateX: 2, rotateY: -2 }}
              className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden relative group flex shadow-xl hover:shadow-2xl transition-all duration-300"
              style={{ perspective: 1000 }}
            >
              <div className="p-12 relative z-10 max-w-lg flex-1">
                <div className="w-14 h-14 bg-[#006D77] text-white rounded-xl flex items-center justify-center mb-8 shadow-md">
                  <Truck size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3">Intracity Micro-Hubs</h3>
                <p className="text-slate-500 text-base leading-relaxed font-normal">
                  Same-day delivery optimized through our proprietary urban routing algorithm. Perfect for last-mile retail and urgent documents.
                </p>
              </div>
              <div className="hidden sm:block absolute right-0 bottom-0 w-1/2 h-full opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHBhdGggZD0iTTEwIDEwIEwxOTAgMTkwIE0xOTAgMTAgTDEwIDE5MCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] bg-cover bg-right-bottom bg-no-repeat"></div>
            </motion.div>
            
            {/* Card 2 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              whileHover={{ y: -8, rotateX: 2, rotateY: 2 }}
              className="bg-gradient-to-br from-[#fffbeb] to-amber-50 rounded-2xl border border-amber-100 p-12 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
              style={{ perspective: 1000 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-bl-full pointer-events-none"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-[#FFB703] text-[#0f172a] rounded-xl flex items-center justify-center mb-8 shadow-md">
                  <Zap size={24} fill="currentColor" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3">Priority Express</h3>
                <p className="text-slate-600 text-base leading-relaxed mb-8 font-normal">
                  When time is critical. Guaranteed sub-4 hour delivery windows with real-time GPS tracking.
                </p>
              </div>
              <a href="#" className="text-[#006D77] font-black text-[11px] uppercase tracking-widest inline-flex items-center gap-2 hover:gap-3 transition-all relative z-10">
                View SLAs <ArrowRight size={16} strokeWidth={3} />
              </a>
            </motion.div>
          </div>
          
          {/* Card 3 */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            whileHover={{ y: -8, scale: 1.01 }}
            className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col md:flex-row shadow-2xl transition-all duration-300"
          >
            <div className="p-12 md:w-[45%] flex flex-col justify-center bg-slate-900/90 relative z-10">
              <div className="w-14 h-14 bg-white/10 text-white rounded-xl flex items-center justify-center mb-8 backdrop-blur-md">
                <Truck size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Intercity Freight & Linehaul</h3>
              <p className="text-slate-400 text-base leading-relaxed font-normal">
                Scheduled overnight linehauls connecting major metropolitan areas. Featuring climate-controlled assets and bulk LTL capabilities.
              </p>
            </div>
            <div className="md:w-[55%] h-72 md:h-auto bg-cover bg-center transform transition-transform duration-1000 hover:scale-105" style={{ backgroundImage: "url('/images/truck.png')" }}>
            </div>
          </motion.div>
          
        </div>
      </section>

      {/* Streamlined Logistics Pipeline */}
      <section className="py-32 bg-white relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#f8f9fa] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-24"
          >
            <h2 className="text-3xl font-bold text-[#0f172a] mb-4 tracking-tight">Streamlined Logistics Pipeline</h2>
            <p className="text-slate-500 text-lg font-medium">From booking to fulfillment in three precise steps.</p>
          </motion.div>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Connecting Line - precisely positioned */}
            <div className="hidden md:block absolute top-8 left-[16.66%] right-[16.66%] h-[2px] bg-slate-100 z-0">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                viewport={{ once: true }}
                className="h-full bg-[#006D77]/20"
              />
            </div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10"
            >
              {/* Step 1 */}
              <motion.div variants={fadeUp} className="text-center group">
                <div className="w-16 h-16 bg-white border-2 border-[#006D77] text-[#006D77] rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-xl group-hover:bg-[#006D77] group-hover:text-white transition-colors duration-300">
                  <Check size={24} strokeWidth={3} />
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3">1. Instant Booking</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[220px] mx-auto font-normal">
                  Input dimensions and destination for an immediate algorithmic quote.
                </p>
              </motion.div>
              
              {/* Step 2 */}
              <motion.div variants={fadeUp} className="text-center group">
                <div className="w-16 h-16 bg-[#006D77] text-white rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="font-black text-2xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3">2. Dispatched Pickup</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[220px] mx-auto font-normal">
                  A verified courier is assigned within minutes based on proximity.
                </p>
              </motion.div>
              
              {/* Step 3 */}
              <motion.div variants={fadeUp} className="text-center group">
                <div className="w-16 h-16 bg-[#f8f9fa] border-2 border-slate-200 text-slate-400 rounded-2xl mx-auto flex items-center justify-center mb-8 shadow-sm group-hover:border-[#006D77] group-hover:text-[#006D77] transition-colors duration-300">
                  <span className="font-black text-2xl">3</span>
                </div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-3">3. Transparent Delivery</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[220px] mx-auto font-normal">
                  Live telemetry and digital proof of delivery instantly available.
                </p>
              </motion.div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-28 text-center"
          >
            <Link to="/login" className="bg-[#FFB703] hover:bg-[#e5a400] text-[#0f172a] px-10 py-4 rounded-lg text-sm font-black uppercase tracking-widest transition-all inline-block shadow-xl hover:shadow-2xl hover:-translate-y-1">
              Create Your First Shipment
            </Link>
          </motion.div>
          
        </div>
      </section>
      
    </div>
  );
}
