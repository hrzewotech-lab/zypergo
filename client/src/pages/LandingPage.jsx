import React from 'react';
import { Truck, Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';
import HomeBanner from '../components/public/HomeBanner';
import useSEO from '../hooks/useSEO';

export default function LandingPage() {
  useSEO({
    title: 'Enterprise Logistics & Delivery',
    description: 'Fast, secure, and affordable logistics for your business and personal needs. Book intracity and intercity deliveries instantly.',
    keywords: 'logistics, delivery, courier, intercity, intracity, b2b delivery'
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 overflow-x-hidden">
      <Navbar />

      <div className="flex-grow flex flex-col">
        <HomeBanner />

        {/* Feature Section Below Hero */}
        <div className="bg-white py-24 relative z-10 w-full overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          
          <div className="max-w-5xl mx-auto px-8 relative">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">Delivery Solutions Tailored for You</h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                Whether it's across town or across states, ZYPERGO provides a reliable network to get
                your goods there safely.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 perspective-1000">
              
              {/* Local Delivery Card */}
              <motion.div 
                initial={{ opacity: 0, x: -50, rotateY: 10 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, type: "spring" }}
                whileHover={{ scale: 1.03, y: -5, rotateX: 2, rotateY: -2 }}
                className="border border-slate-100 rounded-3xl p-10 hover:shadow-2xl hover:shadow-blue-900/5 transition-all bg-white flex flex-col relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-600/30">
                  <Truck size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">Local Delivery</h3>
                <p className="text-slate-600 text-base leading-relaxed mb-6 flex-grow">
                  Hyper-local logistics operating within a 65km radius. Ideal for urgent
                  documents, perishables, and local retail distribution with same-day
                  guarantees.
                </p>
              </motion.div>

              {/* Intercity Delivery Card */}
              <motion.div 
                initial={{ opacity: 0, x: 50, rotateY: -10 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, type: "spring", delay: 0.1 }}
                whileHover={{ scale: 1.03, y: -5, rotateX: 2, rotateY: 2 }}
                className="border border-slate-100 rounded-3xl p-10 hover:shadow-2xl hover:shadow-teal-900/5 transition-all bg-white flex flex-col relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110"></div>
                <div className="w-14 h-14 bg-teal-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-teal-500/30">
                  <Plane size={28} className="rotate-45"/>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-teal-600 transition-colors">Intercity Delivery</h3>
                <p className="text-slate-600 text-base leading-relaxed mb-6 flex-grow">
                  Robust Hub-and-Spoke architecture leveraging trusted regional carriers to
                  deliver packages securely across long distances.
                </p>
              </motion.div>
              
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
