import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { id: 1, label: 'Deliveries Completed', value: '1M+' },
  { id: 2, label: 'Active Business Partners', value: '500+' },
  { id: 3, label: 'Cities Covered', value: '50+' },
  { id: 4, label: 'Platform Uptime', value: '99.9%' }
];

export default function StatsSection() {
  return (
    <div className="bg-[#f8f9fa] py-20 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#006D77]/10 rounded-[100%] blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#006D77] to-blue-600 mb-2">
                {stat.value}
              </div>
              <div className="text-slate-500 text-sm md:text-base font-bold tracking-wide uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
