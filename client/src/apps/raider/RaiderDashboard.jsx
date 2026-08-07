import React, { useState, useEffect } from 'react';
import { Truck, Navigation, Power, CheckCircle2, Clock, MapPin, Package, Banknote, Coffee, Building2, AlertTriangle, Bell, Settings, Phone, Camera, ArrowRight } from 'lucide-react';

export default function RaiderDashboard() {
  const [isOnShift, setIsOnShift] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  
  const [activeTab, setActiveTab] = useState('Deliveries');
  
  // Mock Stats
  const stats = {
    earnings: 142.50,
    punctuality: 98.2,
    deliveriesCount: 12,
    pickupsCount: 4
  };

  // Mock initial job data for UI demonstration matching reference
  useEffect(() => {
    setMyJobs([
      { id: 'ZYP-8835-DEL', name: 'TechCorp Supplies', address: '890 Innovation Blvd, Suite 200', time: '15:15', status: 'Next', type: 'Delivery' },
      { id: 'ZYP-8836-DEL', name: 'Global Retailers', address: 'Westside Mall, Loading Zone C', time: '16:30', status: 'Pending', type: 'Delivery' },
      { id: 'ZYP-8830-DEL', name: 'City Hospital', address: 'Main Entrance, Receiving', time: '11:00', status: 'Done', type: 'Delivery' }
    ]);
    
    // Set active job matching the image
    setActiveJob({
      id: 'ZYP-8834-DEL',
      type: 'Delivery',
      name: 'Acme Corp HQ',
      address: '442 Industrial Parkway, Building B, Loading Dock 4.',
      contactName: 'Sarah Jenkins',
      contactPhone: '555-0192',
      eta: '14:30',
      delay: true
    });
  }, []);

  const toggleOnline = () => setIsOnline(!isOnline);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#F8FAFC] border-b border-slate-200 px-6 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-8">
          <h1 className="text-[#006D77] text-2xl font-black tracking-widest">ZYPERGO</h1>
          <div className="h-6 w-px bg-slate-300"></div>
          <nav className="flex gap-6">
            <button className="text-slate-800 font-bold text-sm">Dashboard</button>
            <button className="text-slate-500 font-bold text-sm hover:text-slate-800">Shipments</button>
            <button className="text-slate-500 font-bold text-sm hover:text-slate-800">Invoices</button>
            <button className="text-slate-500 font-bold text-sm hover:text-slate-800">Support</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-slate-800"><Bell size={20} /></button>
          <button className="text-slate-500 hover:text-slate-800"><Settings size={20} /></button>
          <button className="bg-[#006D77] hover:bg-[#00585f] text-white px-4 py-2 rounded-md font-bold text-sm ml-2 transition">
            New Booking
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm ml-2 overflow-hidden">
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        
        {/* Header Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Raider Control Dashboard</h2>
            <p className="text-slate-500 text-sm font-medium">Hub: Central District Alpha • Shift Started: 06:00 AM</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 rounded-full p-1 flex">
              <button 
                onClick={() => setIsOnline(true)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${isOnline ? 'bg-[#006D77] text-white' : 'text-slate-500'}`}
              >
                Online
              </button>
              <button 
                onClick={() => setIsOnline(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition ${!isOnline ? 'bg-slate-300 text-slate-800' : 'text-slate-500'}`}
              >
                Offline
              </button>
            </div>
            <div className="flex items-center gap-2 bg-[#A7F3D0]/40 text-[#059669] px-4 py-2 rounded-full font-bold text-sm border border-[#34D399]/30">
               <CheckCircle2 size={16} />
               Hub Checked-in
            </div>
          </div>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full pb-8">
          
          {/* LEFT PANE - Active Delivery */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]">
            {/* Top Bar */}
            <div className="bg-[#F8FAFC] border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[#006D77] font-bold text-sm tracking-wide">
                <Truck size={18} /> ACTIVE DELIVERY
              </div>
              <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-mono border border-slate-200 font-bold">
                ID: {activeJob?.id}
              </div>
            </div>

            {activeJob ? (
              <div className="flex flex-col flex-1 relative">
                {/* Job Details Header */}
                <div className="p-6 flex justify-between items-start z-10 bg-white/90 backdrop-blur-sm">
                  <div className="max-w-md">
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">{activeJob.name}</h2>
                    <div className="flex gap-3 text-slate-600 text-sm mb-4">
                      <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p>{activeJob.address}</p>
                        <p className="mt-1 text-slate-500">Contact: {activeJob.contactName} ({activeJob.contactPhone})</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button className="flex-1 border border-slate-200 py-2 rounded-lg font-bold text-[#006D77] text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition">
                        <Phone size={16} /> Call Contact
                      </button>
                      <button className="flex-1 border border-[#006D77] text-[#006D77] py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#006D77]/5 transition">
                        <Navigation size={16} /> Navigate
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">ETA</p>
                    <p className="text-3xl font-black text-[#006D77] mb-1">{activeJob.eta}</p>
                    {activeJob.delay && (
                      <p className="text-red-500 text-xs font-bold flex items-center gap-1 justify-end">
                        <AlertTriangle size={12}/> Slight Delay
                      </p>
                    )}
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="flex-1 bg-slate-100 relative min-h-[250px] overflow-hidden flex items-center justify-center">
                   {/* In a real app, this would be a Google Map component */}
                   <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                   <div className="relative z-10 w-full h-full p-8 flex flex-col items-center justify-center opacity-50">
                      <MapPin size={48} className="text-slate-400 mb-4" />
                      <p className="font-bold text-slate-500">Interactive Map View</p>
                   </div>
                </div>

                {/* Bottom Verification Actions */}
                <div className="p-6 bg-white border-t border-slate-200 z-10">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Verification Actions</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button className="border border-dashed border-slate-300 rounded-xl py-6 flex flex-col items-center justify-center text-slate-600 hover:border-[#006D77] hover:bg-slate-50 transition">
                      <Camera size={24} className="mb-2" />
                      <span className="text-sm font-bold">Capture Photo</span>
                    </button>
                    <div className="border border-slate-200 rounded-xl py-4 flex flex-col items-center justify-center bg-slate-50">
                      <span className="text-xs font-bold text-slate-500 mb-2">Enter OTP</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="w-10 h-10 bg-white border border-slate-300 rounded-md flex items-center justify-center font-bold text-slate-400 text-lg">
                            -
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-[#FFB703] hover:bg-[#e5a400] text-slate-900 font-bold text-xl py-5 rounded-xl shadow-md transition flex justify-center items-center gap-2">
                    Mark Arrived <ArrowRight size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Package size={48} className="mb-4 opacity-50" />
                <p className="font-bold text-lg text-slate-500">No Active Job</p>
                <p className="text-sm">Select a job from the queue to start.</p>
              </div>
            )}
          </div>

          {/* RIGHT PANE - Queue & Stats */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 h-full">
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-600 mb-2">Today's Earnings</p>
                <p className="text-3xl font-black text-slate-900 mb-1">${stats.earnings.toFixed(2)}</p>
                <p className="text-xs font-bold text-[#059669]">↗ +12% vs avg</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-600 mb-2">Punctuality</p>
                  <p className="text-3xl font-black text-slate-900 mb-2">{stats.punctuality}%</p>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#006D77] h-full" style={{ width: `${stats.punctuality}%` }}></div>
                </div>
              </div>
            </div>

            {/* Job Queue Tabs */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="flex border-b border-slate-200">
                <button 
                  onClick={() => setActiveTab('Deliveries')}
                  className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition ${activeTab === 'Deliveries' ? 'border-[#006D77] text-[#006D77]' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                >
                  Deliveries ({stats.deliveriesCount})
                </button>
                <button 
                  onClick={() => setActiveTab('Pickups')}
                  className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition ${activeTab === 'Pickups' ? 'border-[#006D77] text-[#006D77]' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
                >
                  Pickups ({stats.pickupsCount})
                </button>
              </div>

              {/* Job List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {myJobs.map((job) => {
                  const isDone = job.status === 'Done';
                  const isNext = job.status === 'Next';
                  return (
                    <div key={job.id} className={`border rounded-lg p-4 transition ${isDone ? 'border-slate-200 bg-slate-50 opacity-70' : isNext ? 'border-[#006D77]/30 bg-white shadow-sm ring-1 ring-[#006D77]/10' : 'border-slate-200 bg-white'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-bold ${isDone ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{job.name}</h4>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold font-mono">{job.time}</span>
                      </div>
                      <p className={`text-sm mb-4 ${isDone ? 'text-slate-400' : 'text-slate-500'}`}>{job.address}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs font-mono text-slate-400">{job.id}</p>
                        {isNext ? (
                           <span className="bg-[#E0F2F1] text-[#006D77] text-xs font-bold px-3 py-1 rounded-full">Next</span>
                        ) : isDone ? (
                           <span className="bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Done</span>
                        ) : (
                           <span className="text-slate-400 text-xs font-bold">Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
