import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, MapPin, Truck, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/public/Navbar';
import useSEO from '../../hooks/useSEO';

export default function BookParcelPage() {
  useSEO({
    title: 'Book a Parcel',
    description: 'Book your package delivery in under 2 minutes. Get instant quotes and real-time tracking for local and intercity shipments.',
    keywords: 'book parcel, send package, delivery quote, courier booking'
  });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setIsSuccess(true);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      <Navbar />
      
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] -left-[10%] w-[30%] h-[30%] bg-teal-400/20 rounded-full blur-[100px]"></div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-6xl flex flex-col lg:flex-row gap-12 items-start">
        
        {/* Left Side: Value Prop & Stepper */}
        <div className="w-full lg:w-1/3 flex flex-col pt-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6"
          >
            Send Parcels <br/><span className="text-blue-600">Instantly.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-lg mb-12"
          >
            Fast, secure, and affordable logistics for your business and personal needs. Book in less than 2 minutes.
          </motion.p>

          {/* Stepper */}
          <div className="space-y-8 hidden md:block">
            {[
              { num: 1, title: 'Route Details', desc: 'Where is it going?' },
              { num: 2, title: 'Package Info', desc: 'Size and weight' },
              { num: 3, title: 'Confirmation', desc: 'Review and pay' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors duration-500 ${step >= s.num ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white text-slate-400 border border-slate-200'}`}>
                  {step > s.num ? <CheckCircle2 size={18} /> : s.num}
                </div>
                <div className={step >= s.num ? 'opacity-100' : 'opacity-40'}>
                  <h3 className="font-bold text-slate-900">{s.title}</h3>
                  <p className="text-sm text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form / Success Card */}
        <div className="w-full lg:w-2/3">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, type: 'spring' }}
                className="glass-dark text-white rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden"
              >
                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none"></div>
                
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                  {step === 1 && <><MapPin className="text-teal-400"/> Enter Route</>}
                  {step === 2 && <><Package className="text-teal-400"/> Package Details</>}
                  {step === 3 && <><ShieldCheck className="text-teal-400"/> Review Booking</>}
                </h2>

                <form onSubmit={handleNext} className="space-y-6 relative z-10">
                  
                  {step === 1 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Pickup Pincode</label>
                          <input type="text" required placeholder="e.g. 500081" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Drop Pincode</label>
                          <input type="text" required placeholder="e.g. 560001" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Pickup Address (Optional for estimate)</label>
                        <input type="text" placeholder="Full address" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Category</label>
                        <select className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-white appearance-none">
                          <option>Documents</option>
                          <option>Electronics</option>
                          <option>Clothing</option>
                          <option>Heavy Machinery</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Weight (kg)</label>
                          <input type="number" required placeholder="0.5" step="0.1" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Value (₹)</label>
                          <input type="number" required placeholder="1000" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-5"
                    >
                      <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-slate-400">Estimated Cost</span>
                          <span className="text-2xl font-bold text-white">₹450</span>
                        </div>
                        <div className="space-y-2 text-sm text-slate-300 border-t border-slate-700 pt-4">
                          <div className="flex justify-between"><span>Base Fare</span><span>₹300</span></div>
                          <div className="flex justify-between"><span>Weight Surcharge</span><span>₹100</span></div>
                          <div className="flex justify-between"><span>Taxes</span><span>₹50</span></div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 text-center">By clicking Confirm, you agree to our terms of service.</p>
                    </motion.div>
                  )}

                  <div className="pt-6 flex gap-4">
                    {step > 1 && (
                      <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition">
                        Back
                      </button>
                    )}
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>{step === 3 ? 'Confirm & Pay' : 'Continue'} <ArrowRight size={18}/></>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center relative overflow-hidden"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.2 }}
                  className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Booking Confirmed!</h2>
                <p className="text-slate-500 mb-8">Your tracking ID is <span className="font-mono font-bold text-slate-800">ZYP98765432</span></p>
                <div className="flex gap-4 justify-center">
                  <button className="bg-slate-100 text-slate-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-200 transition">Track Parcel</button>
                  <button onClick={() => {setIsSuccess(false); setStep(1);}} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition">Book Another</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
      </main>
    </div>
  );
}
