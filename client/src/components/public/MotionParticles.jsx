import React from 'react';
import { motion } from 'framer-motion';

export default function MotionParticles({ count = 15 }) {
  const particles = Array.from({ length: count });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => {
        const size = Math.random() * 8 + 4; // 4px to 12px
        const initialX = Math.random() * 100; // 0% to 100%
        const initialY = Math.random() * 100;
        const duration = Math.random() * 20 + 10; // 10s to 30s
        const delay = Math.random() * -20; // Start at different times
        const color = i % 3 === 0 ? 'bg-[#006D77]' : (i % 3 === 1 ? 'bg-blue-500' : 'bg-[#FFB703]');
        
        return (
          <motion.div
            key={i}
            className={`absolute rounded-full opacity-20 blur-[2px] ${color}`}
            style={{
              width: size,
              height: size,
              left: `${initialX}%`,
              top: `${initialY}%`,
            }}
            animate={{
              y: [0, -500],
              x: [0, Math.random() * 100 - 50],
              opacity: [0, 0.6, 0],
              scale: [1, 1.5, 0.5],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        );
      })}
    </div>
  );
}
