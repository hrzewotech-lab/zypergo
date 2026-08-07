import React from 'react';
import { ArrowRight, History, TrendingUp, MonitorSmartphone, Eye, Network } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function AboutPage() {
  return (
    <div className="w-full bg-[#f8f9fa] font-sans pb-32 overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="flex flex-col lg:flex-row gap-16 items-center"
        >
          
          <div className="lg:w-1/2">
            <motion.h1 variants={fadeUp} className="text-4xl lg:text-5xl font-bold text-[#0f172a] leading-tight mb-8 tracking-tight">
              Building the <span className="text-[#006D77]">Logistics Backbone</span> of Tomorrow
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg font-medium">
              Our mission is to provide a seamless, tech-enabled logistics backbone for businesses and individuals. We combine industrial reliability with cutting-edge technology to move what matters most.
            </motion.p>
            <motion.button variants={fadeUp} className="bg-[#006D77] hover:bg-[#00585f] text-white px-8 py-4 rounded-lg text-sm font-black transition-all hover:scale-105 inline-flex items-center gap-3 shadow-xl hover:shadow-2xl">
              Explore Our Services <ArrowRight size={16} strokeWidth={3} />
            </motion.button>
          </div>
          
          <motion.div variants={fadeUp} className="lg:w-1/2 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 group">
              <img src="/images/about_hero.png" alt="Logistics Hub" className="w-full h-auto object-cover aspect-[4/3] transform transition-transform duration-1000 group-hover:scale-105" />
            </div>
            
            {/* Floating Stats Card */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
              className="absolute -bottom-8 -left-8 bg-white p-5 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-4 pr-10"
            >
              <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                <Network size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-tight mb-1">Global Network</p>
                <p className="text-xs font-normal text-slate-500 leading-none">Active nodes: 1,492</p>
              </div>
            </motion.div>
          </motion.div>
          
        </motion.div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Our Story</h2>
          <p className="text-lg font-medium text-slate-500 mb-12">From a localized dispatch center to a global tech-logistics network.</p>
        </motion.div>
        
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Card 1: The Foundation */}
          <motion.div variants={fadeUp} whileHover={{ y: -5, scale: 1.01 }} className="md:col-span-2 bg-[#f8fafc] p-10 rounded-2xl border border-slate-200 relative shadow-lg hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-16">
              <div className="text-[#003B46] bg-white p-3 rounded-xl shadow-sm"><History size={24} strokeWidth={2.5} /></div>
              <div className="px-3 py-1.5 bg-white border border-slate-200 text-[10px] font-semibold rounded-lg text-slate-600 uppercase tracking-widest shadow-sm">Est. 2018</div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">The Foundation</h3>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
              ZYPERGO began with a simple premise: logistics was broken, opaque, and disconnected. We started by building a central control tower software for our own local fleet, focusing entirely on data transparency and operational efficiency.
            </p>
          </motion.div>
          
          {/* Card 2: Rapid Scaling */}
          <motion.div variants={fadeUp} whileHover={{ y: -5, scale: 1.02 }} className="bg-white p-10 rounded-2xl border border-slate-200 flex flex-col shadow-lg hover:shadow-xl transition-all">
            <div className="text-white bg-[#006D77] p-3 rounded-xl shadow-sm w-fit mb-auto"><TrendingUp size={24} strokeWidth={2.5} /></div>
            <div className="mt-16">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Rapid Scaling</h3>
              <p className="text-base text-slate-500 leading-relaxed font-normal">
                By 2021, our proprietary routing algorithms reduced delivery times by 34%, prompting a nationwide expansion.
              </p>
            </div>
          </motion.div>
          
          {/* Card 3: Tech Integration */}
          <motion.div variants={fadeUp} whileHover={{ y: -5, scale: 1.02 }} className="bg-white p-10 rounded-2xl border border-slate-200 flex flex-col shadow-lg hover:shadow-xl transition-all">
            <div className="text-white bg-[#FFB703] p-3 rounded-xl shadow-sm w-fit mb-auto"><MonitorSmartphone size={24} strokeWidth={2.5} /></div>
            <div className="mt-16">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tech Integration</h3>
              <p className="text-base text-slate-500 leading-relaxed font-normal">
                We don't just use software; we build it. Automation is at the core of every hub.
              </p>
            </div>
          </motion.div>
          
          {/* Card 4: Image */}
          <motion.div variants={fadeUp} className="md:col-span-2 rounded-2xl border border-slate-200 overflow-hidden relative shadow-lg h-64 group">
            <img src="/images/about_server.png" alt="Server Room" className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
            <p className="absolute bottom-8 left-8 text-white text-sm font-black tracking-widest uppercase">Data-Driven Operations</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Our Vision Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#f1f5f9] opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-[#e0f2fe] rounded-2xl flex items-center justify-center text-[#0284c7] mb-8 shadow-sm">
              <Eye size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Our Vision</h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto mb-16 font-medium">
              To eliminate supply chain friction globally through predictive technology and uncompromising execution. We envision a world where logistics operates like a utility—invisible, reliable, and always on.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-12 border-t border-slate-200">
              <motion.div whileHover={{ scale: 1.1 }} className="transition-transform">
                <p className="text-5xl font-black text-[#006D77] mb-2 tracking-tighter">99.9%</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Uptime</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} className="transition-transform">
                <p className="text-5xl font-black text-[#006D77] mb-2 tracking-tighter">&lt;2h</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hub Processing</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} className="transition-transform">
                <p className="text-5xl font-black text-[#006D77] mb-2 tracking-tighter">0</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Carbon Goal</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} className="transition-transform">
                <p className="text-5xl font-black text-[#006D77] mb-2 tracking-tighter">24/7</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Leadership Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Leadership Team</h2>
            <p className="text-lg font-medium text-slate-500">The minds engineering our logistics network.</p>
          </div>
          <a href="#" className="text-sm font-bold text-[#006D77] hover:bg-[#e0f2f1] px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            View All <ArrowRight size={16} strokeWidth={3} />
          </a>
        </motion.div>
        
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { name: 'Sarah Jenkins', title: 'CHIEF EXECUTIVE OFFICER' },
            { name: 'David Chen', title: 'CHIEF TECHNOLOGY OFFICER' },
            { name: 'Elena Rodriguez', title: 'CHIEF OPERATIONS OFFICER' },
            { name: 'Marcus Thorne', title: 'VP OF FLEET OPERATIONS' }
          ].map((leader, i) => (
            <motion.div key={i} variants={fadeUp} whileHover={{ y: -10 }} className="group">
              <div className="aspect-[3/4] bg-slate-200 rounded-2xl border border-slate-200 overflow-hidden mb-5 shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <img src="/images/team_portrait.png" alt={leader.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transform transition-all duration-700 group-hover:scale-105" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{leader.name}</h3>
              <p className="text-[10px] font-bold text-[#006D77] uppercase tracking-widest">{leader.title}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
