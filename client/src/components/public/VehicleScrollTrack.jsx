import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Truck } from 'lucide-react';

export default function VehicleScrollTrack() {
  const containerRef = useRef(null);
  
  // Track scroll progress within this specific container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress (0 to 1) into an X position for the truck
  // It will move from -10% of the screen to 110% of the screen
  const truckX = useTransform(scrollYProgress, [0, 1], ["-10vw", "110vw"]);
  
  // Opacity fade in and out at the edges
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="relative bg-white py-32 overflow-hidden w-full border-t border-slate-100">
      
      <div className="max-w-4xl mx-auto text-center relative z-10 px-8 mb-20">
        <h2 className="text-3xl md:text-5xl font-black text-[#0f172a] mb-6 tracking-tight">
          Always In Motion
        </h2>
        <p className="text-slate-500 text-lg font-medium">
          Our logistics network is constantly moving. We leverage advanced routing to ensure your packages never stop until they reach their destination.
        </p>
      </div>

      {/* The Track Line */}
      <div className="relative h-px w-full bg-slate-200">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#006D77] to-transparent opacity-30 blur-sm"></div>
        
        {/* The Moving Vehicle */}
        <motion.div 
          style={{ x: truckX, opacity }}
          className="absolute top-1/2 -translate-y-1/2 flex items-center"
        >
          {/* Motion trail / speed lines */}
          <div className="w-32 h-1 bg-gradient-to-l from-[#006D77] to-transparent mr-2 opacity-30 blur-[2px]"></div>
          
          <div className="w-16 h-16 bg-gradient-to-br from-[#006D77] to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#006D77]/20 z-20">
            <Truck size={32} />
          </div>
        </motion.div>
      </div>

    </div>
  );
}
