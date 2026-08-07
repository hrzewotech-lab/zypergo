import React from 'react';
import { Route as RouteIcon, TrendingUp, Code, Network, Camera, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function FeaturesPage() {
  return (
    <div className="w-full bg-[#f8f9fa] font-sans pb-32 overflow-hidden">
      {/* Header Area */}
      <motion.div 
        initial="hidden" animate="visible" variants={fadeUp}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-6 tracking-tight">Precision Logistics <span className="text-[#006D77]">Engineered.</span></h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Discover how ZYPERGO's technical infrastructure streamlines high-volume shipments with unparalleled clarity and efficiency. Explore our core capabilities below.
        </p>
      </motion.div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          
          {/* Multi-Step Booking */}
          <motion.div 
            variants={fadeUp}
            whileHover={{ y: -8, rotateX: 1, rotateY: -1, scale: 1.01 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl hover:shadow-2xl transition-shadow flex flex-col group"
            style={{ perspective: 1000 }}
          >
            <div className="w-12 h-12 bg-[#e0f2f1] text-[#006D77] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#006D77] group-hover:text-white transition-colors duration-300">
              <RouteIcon size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-4">
              Multi-Step Booking
            </h3>
            <p className="text-base text-slate-500 mb-8 flex-1 font-normal">
              Our three-step booking wizard minimizes errors and ensures all necessary data is captured precisely before dispatch.
            </p>
            
            {/* UI Mock */}
            <div className="bg-[#f8fafc] p-6 rounded-xl flex items-center justify-between border border-slate-200 mt-auto group-hover:border-[#006D77]/30 transition-colors">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#006D77] text-white flex items-center justify-center shadow-md"><CheckCircle2 size={16} strokeWidth={3} /></div>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Details</span>
              </div>
              <div className="h-[2px] bg-[#006D77] flex-1 mx-3 opacity-50"></div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#006D77] text-white flex items-center justify-center text-sm font-black shadow-md">2</div>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Routing</span>
              </div>
              <div className="h-[2px] bg-slate-300 flex-1 mx-3"></div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center text-sm font-black">3</div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm</span>
              </div>
            </div>
          </motion.div>
          
          {/* Milestone Tracking */}
          <motion.div 
            variants={fadeUp}
            whileHover={{ y: -8, rotateX: 1, rotateY: 1, scale: 1.01 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl hover:shadow-2xl transition-shadow flex flex-col group"
            style={{ perspective: 1000 }}
          >
            <div className="w-12 h-12 bg-[#fffbeb] text-[#FFB703] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#FFB703] group-hover:text-white transition-colors duration-300">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-[#0f172a] mb-4">
              Milestone Tracking
            </h3>
            <p className="text-base text-slate-500 mb-8 flex-1 font-normal">
              Granular visibility into every stage of the shipment lifecycle. Automated status updates trigger micro-interactions across the dashboard.
            </p>
            
            {/* UI Mock */}
            <div className="space-y-4 mt-auto bg-[#f8fafc] p-6 rounded-xl border border-slate-200 group-hover:border-[#FFB703]/30 transition-colors">
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-xs font-black text-slate-700 font-mono">ID: ZYP-8492</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider rounded-md">Delivered</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <span className="text-xs font-black text-slate-700 font-mono">ID: ZYP-8493</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-md">In Transit</span>
              </div>
            </div>
          </motion.div>
          
          {/* API Integration (Tall) */}
          <motion.div 
            variants={fadeUp}
            whileHover={{ y: -8, scale: 1.01 }}
            className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl flex flex-col md:row-span-2 group"
          >
            <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
              <Code size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              API Integration
            </h3>
            <p className="text-base text-slate-400 mb-8 font-normal">
              Seamlessly connect ZYPERGO's backend with your existing ERP or WMS systems. Partner integrations are fully documented and supported.
            </p>
            
            {/* Code Mock */}
            <div className="bg-[#1e1e1e] rounded-xl p-6 text-xs font-mono text-[#d4d4d4] overflow-x-auto border border-slate-700/50 mt-auto shadow-inner group-hover:border-slate-600 transition-colors">
<pre className="leading-loose">{`{
  "endpoint": "/v1/shipments",
  "method": "POST",
  "payload": {
    "origin": "HUB-NYC-01",
    "dest": "HUB-LAX-04",
    "priority": "high",
    "items": [
      {"id": "itm_9k", "qty": 4}
    ]
  }
}`}</pre>
            </div>
          </motion.div>
          
          {/* Hub-and-Spoke Efficiency */}
          <motion.div 
            variants={fadeUp}
            whileHover={{ y: -8, scale: 1.01 }}
            className="bg-gradient-to-br from-white to-[#f0f9ff] p-8 rounded-2xl border border-sky-100 shadow-xl hover:shadow-2xl transition-all duration-300 md:col-span-2 flex flex-col md:flex-row gap-10 items-center overflow-hidden relative group"
          >
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-sky-200/40 rounded-full blur-3xl group-hover:bg-sky-300/40 transition-colors duration-700 pointer-events-none"></div>
            
            <div className="flex-1 relative z-10">
              <div className="w-12 h-12 bg-[#e0f2fe] text-[#0284c7] rounded-xl flex items-center justify-center mb-6">
                <Network size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-[#0f172a] mb-4 tracking-tight">
                Hub-and-Spoke Efficiency
              </h3>
              <p className="text-base text-slate-600 font-medium leading-relaxed">
                Our network topology optimizes routing by consolidating shipments at regional Hubs before dispatching via our specialized 'Rider' fleet to final destinations, reducing transit times by up to 30%.
              </p>
            </div>
            <div className="w-full md:w-[45%] shrink-0 relative z-10">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-700">
                <img src="/images/features_ecosystem.png" alt="Digital Ecosystem" className="w-full h-auto object-cover" />
              </div>
            </div>
          </motion.div>
          
          {/* Proof of Delivery */}
          <motion.div 
            variants={fadeUp}
            whileHover={{ y: -8, scale: 1.01 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl hover:shadow-2xl transition-shadow md:col-span-2 flex flex-col group"
          >
            <div className="w-12 h-12 bg-[#f3e8ff] text-[#9333ea] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#9333ea] group-hover:text-white transition-colors duration-300">
              <Camera size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-[#0f172a] mb-4 tracking-tight">
              Proof of Delivery (POD)
            </h3>
            <p className="text-base text-slate-500 mb-8 max-w-xl font-medium leading-relaxed">
              Immediate visual confirmation. Riders upload geo-tagged, timestamped photos directly to the milestone timeline upon successful delivery.
            </p>
            <div className="flex gap-6 mt-auto">
              <div className="w-32 h-32 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-md group-hover:-rotate-3 group-hover:scale-105 transition-all duration-300">
                <img src="/images/features_pod1.png" alt="POD 1" className="w-full h-full object-cover" />
              </div>
              <div className="w-32 h-32 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-md group-hover:rotate-3 group-hover:scale-105 transition-all duration-300 delay-75">
                <img src="/images/features_pod2.png" alt="POD 2" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>
          
        </motion.div>
      </div>
    </div>
  );
}
