import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Truck, Plane, Package, ShieldCheck } from 'lucide-react';

const features = [
  {
    id: 1,
    title: 'Intracity Fleet',
    description: 'Hyper-local logistics within 65km radius. Same-day guarantees for retail distribution.',
    icon: <Truck size={32} />,
    color: 'from-blue-500 to-cyan-400',
    shadow: 'shadow-blue-500/20'
  },
  {
    id: 2,
    title: 'National Hubs',
    description: 'Robust Hub-and-Spoke architecture leveraging regional carriers for long distances.',
    icon: <Plane size={32} className="rotate-45" />,
    color: 'from-teal-500 to-emerald-400',
    shadow: 'shadow-teal-500/20'
  },
  {
    id: 3,
    title: 'Smart Sorting',
    description: 'Automated package sorting at fulfillment centers to ensure zero misplacements.',
    icon: <Package size={32} />,
    color: 'from-indigo-500 to-purple-400',
    shadow: 'shadow-indigo-500/20'
  },
  {
    id: 4,
    title: 'Secure Transit',
    description: 'End-to-end encryption of tracking data and physical security for high-value goods.',
    icon: <ShieldCheck size={32} />,
    color: 'from-orange-500 to-amber-400',
    shadow: 'shadow-orange-500/20'
  }
];

function FeatureCard({ feature }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative h-[320px] rounded-3xl bg-white border border-slate-100 p-8 flex flex-col justify-between transition-shadow hover:shadow-2xl ${feature.shadow}`}
    >
      {/* Decorative Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-bl-full -z-10`} style={{ transform: 'translateZ(-10px)' }}></div>
      
      <div 
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center shadow-lg ${feature.shadow}`}
        style={{ transform: 'translateZ(40px)' }}
      >
        {feature.icon}
      </div>

      <div style={{ transform: 'translateZ(30px)' }}>
        <h3 className="text-2xl font-black text-slate-900 mb-3">{feature.title}</h3>
        <p className="text-slate-600 font-medium leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function Features3D() {
  return (
    <div className="bg-slate-50 py-32 relative z-10 w-full overflow-hidden perspective-1000">
      <div className="max-w-7xl mx-auto px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Logistics</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium">
            Interactive, robust, and highly scalable. Explore how we power the modern supply chain.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: idx * 0.15, type: 'spring', bounce: 0.4 }}
              style={{ perspective: 1000 }}
            >
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
