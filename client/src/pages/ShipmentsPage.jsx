import React from 'react';
import { Clock, ArrowRight, Activity, MapPin, Navigation, Shield, Check, GitCommit } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ShipmentsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight">ZYPERGO</Link>
          <nav className="hidden lg:flex gap-6 text-sm font-medium text-slate-600">
            <Link to="/admin" className="hover:text-slate-900 transition-colors">Dashboard</Link>
            <Link to="/shipments" className="text-primary border-b-2 border-primary pb-1">Shipments</Link>
            <a href="#" className="hover:text-slate-900 transition-colors">Riders</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Hubs</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Partners</a>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-primary outline-none w-64"
            />
             {/* Using a simple search icon placeholder since Search from lucide isn't imported here if we want to save space, but let's just use a div for now */}
             <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-slate-400 rounded-full"></div>
             <div className="absolute left-5 top-[18px] w-1.5 h-0.5 bg-slate-400 rotate-45"></div>
          </div>
          <button className="text-slate-500 hover:text-slate-900">
            <div className="w-5 h-5 border-2 border-current rounded-full relative">
                <div className="w-1 h-1 bg-current rounded-full absolute top-0 right-0"></div>
            </div>
          </button>
          <button className="text-slate-500 hover:text-slate-900">
            <div className="w-5 h-5 border-2 border-current rounded relative"></div>
          </button>
          <button className="bg-primary text-white px-4 py-1.5 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors shadow-sm">
            New Booking
          </button>
          <div className="w-8 h-8 bg-slate-300 rounded-full overflow-hidden border border-slate-200">
             <div className="w-full h-full bg-primary text-white flex items-center justify-center text-xs font-bold">JD</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-16 border border-slate-200 rounded-2xl overflow-hidden p-8 lg:p-12 shadow-sm bg-white">
          <div className="w-full lg:w-1/2">
            <span className="inline-flex items-center gap-2 bg-accent/20 text-[#d99700] text-xs font-bold px-3 py-1.5 rounded mb-6 tracking-wider uppercase">
              <Clock size={14} /> Same Day Guaranteed
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
              Local Delivery Solutions
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Rapid, precise within-city logistics engineered for modern commerce. We bridge the
              final mile with dependable direct dispatch, ensuring your vital shipments reach their
              destination seamlessly across the urban grid.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-primary text-white px-6 py-3 rounded text-sm font-bold flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-sm">
                Start Booking Flow <ArrowRight size={16} />
              </button>
              <button className="bg-white text-slate-700 border border-slate-300 px-6 py-3 rounded text-sm font-bold hover:bg-slate-50 transition-colors">
                View Rate Card
              </button>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2">
             <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-[4/3] flex items-end justify-center">
                {/* Fake Image Background */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #cbd5e1 0, #cbd5e1 1px, transparent 1px, transparent 10px)' }}></div>
                <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-400">
                    <span className="font-bold text-2xl uppercase tracking-widest opacity-30">ZYPERGO Rider Illustration</span>
                </div>
                
                {/* Stats Overlay */}
                <div className="relative z-10 w-11/12 bg-white/90 backdrop-blur border border-slate-200 rounded-lg p-6 mb-6 shadow-lg flex divide-x divide-slate-200">
                   <div className="flex-1 pr-6">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Average Dispatch</p>
                     <p className="text-2xl font-bold text-primary">Under 12 Mins</p>
                   </div>
                   <div className="flex-1 pl-6 text-right">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Success Rate</p>
                     <p className="text-2xl font-bold text-slate-900">99.8%</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Four Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
             <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary mb-4">
               <Activity size={20} />
             </div>
             <h3 className="font-bold text-slate-900 mb-2">Direct Rider Dispatch</h3>
             <p className="text-sm text-slate-600 leading-relaxed">
               Point-to-point assignment without intermediary hubs, drastically reducing handling time and potential points of failure.
             </p>
          </div>
          
          <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
             <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary mb-4">
               <MapPin size={20} />
             </div>
             <h3 className="font-bold text-slate-900 mb-2">65km Operational Radius</h3>
             <p className="text-sm text-slate-600 leading-relaxed">
               Extensive city-wide coverage encompassing key commercial zones and peripheral industrial parks within a single zone.
             </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
             <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary mb-4">
               <Navigation size={20} />
             </div>
             <h3 className="font-bold text-slate-900 mb-2">Real-time GPS Tracking</h3>
             <p className="text-sm text-slate-600 leading-relaxed">
               Second-by-second telemetry data available via the dashboard, ensuring total visibility for you and your clients.
             </p>
          </div>

          <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
             <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary mb-4">
               <Shield size={20} />
             </div>
             <h3 className="font-bold text-slate-900 mb-2">Secure Handling</h3>
             <p className="text-sm text-slate-600 leading-relaxed">
               Chain of custody protocols enforced via mandatory digital signatures and photographic proof of delivery at destination.
             </p>
          </div>
        </div>

        {/* Architecture Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 lg:p-12 flex flex-col lg:flex-row gap-12 items-center">
           <div className="w-full lg:w-1/2">
             <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Intra-city vs. Local Logistics</h2>
             <p className="text-slate-600 mb-8 leading-relaxed">
               Understanding our routing architecture ensures you select the most efficient service tier. 'Local Delivery' is optimized for speed over a constrained geography.
             </p>
             
             <div className="space-y-6">
                <div className="flex gap-4">
                   <div className="w-8 h-8 bg-accent/20 text-[#d99700] rounded flex items-center justify-center shrink-0 mt-1">
                      <Check size={16} />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900 mb-1">The 65km Local Radius</h4>
                     <p className="text-sm text-slate-600 leading-relaxed">
                       Shipments remaining within a 65km radius of the origin point are classified as Local. These bypass central sorting hubs, assigned directly to active riders in the sector.
                     </p>
                   </div>
                </div>
                
                <div className="flex gap-4">
                   <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded flex items-center justify-center shrink-0 mt-1">
                      <GitCommit size={16} />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900 mb-1">Intra-city Hub Routing</h4>
                     <p className="text-sm text-slate-600 leading-relaxed">
                       Shipments exceeding 65km or requiring scheduled batching are routed through our Intra-city Hub network for optimized multi-leg transit.
                     </p>
                   </div>
                </div>
             </div>
           </div>

           <div className="w-full lg:w-1/2">
              <div className="bg-slate-200 rounded-xl overflow-hidden aspect-video border border-slate-300 relative flex items-center justify-center">
                 <div className="absolute inset-0 bg-[#e2e8f0]" style={{ backgroundImage: 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1), linear-gradient(45deg, #cbd5e1 25%, transparent 25%, transparent 75%, #cbd5e1 75%, #cbd5e1)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
                 
                 {/* Fake Graphic overlay */}
                 <div className="relative w-64 h-64 bg-slate-100/80 rounded-3xl border border-slate-300 flex items-center justify-center backdrop-blur-sm shadow-xl">
                    <div className="w-4 h-4 bg-primary rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_8px_rgba(0,109,119,0.2)]"></div>
                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded shadow-sm border border-slate-200 text-[10px] font-bold text-primary">Origin Point</div>
                    
                    <div className="absolute w-2 h-2 bg-slate-800 rounded-full top-[30%] left-[20%]"></div>
                    <div className="absolute w-2 h-2 bg-slate-800 rounded-full bottom-[40%] right-[15%]"></div>
                    <div className="absolute w-2 h-2 bg-slate-800 rounded-full bottom-[15%] right-[20%]"></div>
                 </div>
              </div>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-8 py-6 mt-12 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
        <div className="text-xl font-bold text-primary tracking-tight">ZYPERGO
          <span className="block text-[10px] font-normal text-slate-500 mt-1">&copy; 2024 ZYPERGO Logistics. All rights reserved.</span>
        </div>
        <div className="flex gap-6 text-sm font-semibold text-slate-500">
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
