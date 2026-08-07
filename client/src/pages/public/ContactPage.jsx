import React from 'react';
import { MapPin, Mail, Phone, Map, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const slideRight = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const slideLeft = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut", delay: 0.2 } }
};

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

export default function ContactPage() {
  return (
    <div className="w-full bg-[#f8f9fa] font-sans pb-32 overflow-hidden">
      {/* Header Area */}
      <motion.div 
        initial="hidden" animate="visible" variants={fadeUp}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-[#0f172a] mb-6 tracking-tight">Get in <span className="text-[#006D77]">Touch</span></h1>
        <p className="text-lg text-slate-500 max-w-xl font-medium leading-relaxed">
          We're here to support your logistics operations. Reach out for technical assistance, enterprise inquiries, or general questions.
        </p>
      </motion.div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Form */}
          <motion.div 
            initial="hidden" animate="visible" variants={slideRight}
            className="lg:w-[60%]"
          >
            <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#f1f5f9] rounded-bl-full pointer-events-none opacity-50"></div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-4 relative z-10 tracking-tight">Send a Message</h2>
              <p className="text-slate-500 mb-10 font-medium relative z-10">
                Fill out the form below and our support team will get back to you within 24 hours.
              </p>
              
              <form className="space-y-8 relative z-10">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane Doe"
                      className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-[#006D77] focus:ring-4 focus:ring-[#006D77]/10 outline-none text-base font-bold text-slate-800 transition-all placeholder-slate-400" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-wider">Work Email</label>
                    <input 
                      type="email" 
                      placeholder="jane@company.com"
                      className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-[#006D77] focus:ring-4 focus:ring-[#006D77]/10 outline-none text-base font-bold text-slate-800 transition-all placeholder-slate-400" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-wider">Subject / Inquiry Type</label>
                  <div className="relative">
                    <select className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-[#006D77] focus:ring-4 focus:ring-[#006D77]/10 outline-none text-base font-bold text-slate-800 transition-all appearance-none cursor-pointer">
                      <option>Technical Support</option>
                      <option>Enterprise Sales</option>
                      <option>Billing Question</option>
                    </select>
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-[#006D77]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-wider">Message</label>
                  <textarea 
                    rows="5" 
                    placeholder="Describe your inquiry..."
                    className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-xl focus:border-[#006D77] focus:ring-4 focus:ring-[#006D77]/10 outline-none text-base font-bold text-slate-800 transition-all resize-y placeholder-slate-400"
                  ></textarea>
                </div>
                
                <div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button" 
                    className="bg-[#006D77] hover:bg-[#00585f] text-white w-full md:w-auto px-10 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-colors inline-flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <Send size={18} strokeWidth={2.5} />
                    Submit Inquiry
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
          
          {/* Right Column: Info & Map */}
          <motion.div 
            initial="hidden" animate="visible" variants={slideLeft}
            className="lg:w-[40%] flex flex-col gap-8"
          >
            
            {/* Contact Info Card */}
            <div className="bg-gradient-to-br from-[#f1f5f9] to-[#f8fafc] p-10 rounded-2xl border border-slate-200 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">Contact Information</h2>
              
              <div className="space-y-8">
                <motion.div whileHover={{ x: 5 }} className="flex gap-5 items-start transition-transform">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#006D77] shrink-0 shadow-sm border border-slate-100">
                    <MapPin size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 mb-1 uppercase tracking-wider">Global Hub</h3>
                    <p className="text-base font-medium text-slate-600 leading-relaxed">1200 Logistics Way, Suite 400<br/>Seattle, WA 98104</p>
                  </div>
                </motion.div>
                
                <motion.div whileHover={{ x: 5 }} className="flex gap-5 items-start transition-transform">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#006D77] shrink-0 shadow-sm border border-slate-100">
                    <Mail size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 mb-1 uppercase tracking-wider">Support Email</h3>
                    <p className="text-base font-medium text-slate-600">support@zypergo.com</p>
                  </div>
                </motion.div>
                
                <motion.div whileHover={{ x: 5 }} className="flex gap-5 items-start transition-transform">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#006D77] shrink-0 shadow-sm border border-slate-100">
                    <Phone size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 mb-1 uppercase tracking-wider">Phone</h3>
                    <p className="text-base font-medium text-slate-600">+1 (800) 555-0199</p>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Map Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col flex-1 min-h-[250px] transition-transform"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#f8fafc]">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Location Map</h3>
                <Map size={20} className="text-[#006D77]" strokeWidth={2.5} />
              </div>
              <div className="flex-1 bg-slate-200 relative">
                <img 
                  src="/images/contact_map.png" 
                  alt="Map of Seattle" 
                  className="absolute inset-0 w-full h-full object-cover filter brightness-95"
                />
              </div>
            </motion.div>
            
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}

