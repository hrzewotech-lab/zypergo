import React, { useState } from 'react';
import { Truck, Map, Filter, CheckCircle2, AlertCircle, Clock, Navigation } from 'lucide-react';

export default function DispatchRouting() {
  const [activeTab, setActiveTab] = useState('pending'); // pending, enroute, partners

  const pendingPickups = [
    { id: 'PU-9821', address: '124 Tech Ave, Seattle', timeSlot: '14:00 - 16:00', load: 'Medium Box', priority: 'High', status: 'Unassigned' },
    { id: 'PU-9822', address: '892 Pine St, Bellevue', timeSlot: '15:30 - 17:30', load: 'Large Crate', priority: 'Normal', status: 'Unassigned' },
    { id: 'PU-9823', address: '450 Industrial Pkwy, Kent', timeSlot: '16:00 - 18:00', load: '2x Small Box', priority: 'Normal', status: 'Unassigned' },
  ];

  const availableRiders = [
    { name: 'John Doe', vehicle: 'Mini Truck', capacity: '75%', eta: '10 mins away', loadLimit: '100kg' },
    { name: 'Sarah Lee', vehicle: 'Bike', capacity: '10%', eta: '2 mins away', loadLimit: '15kg' },
    { name: 'Mike Ross', vehicle: 'Van', capacity: '40%', eta: '15 mins away', loadLimit: '500kg' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Dispatch & Routing</h1>
          <p className="text-slate-500 text-sm mt-1">Assign riders, optimize routes, and manage partners.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Pending Pickups
          </button>
          <button 
            onClick={() => setActiveTab('enroute')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'enroute' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Live Routes
          </button>
          <button 
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'partners' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            3PL Partners
          </button>
        </div>
      </div>

      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unassigned List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
              <h2 className="font-bold text-slate-900 flex items-center gap-2"><Clock size={18} className="text-[#FFB703]" /> Needs Assignment (3)</h2>
              <button className="text-sm font-bold text-[#006D77] flex items-center gap-1 hover:underline"><Filter size={16} /> Filter Region</button>
            </div>
            
            {pendingPickups.map(pickup => (
              <div key={pickup.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${pickup.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{pickup.id}</h3>
                      {pickup.priority === 'High' && <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">High Priority</span>}
                    </div>
                    <p className="text-sm font-medium text-slate-600 flex items-center gap-1"><MapPin size={14} /> {pickup.address}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={12} /> {pickup.timeSlot} • {pickup.load}</p>
                  </div>
                </div>
                <button className="w-full md:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap">
                  Assign Manually
                </button>
              </div>
            ))}
          </div>

          {/* Rider Allocation Panel */}
          <div className="bg-gradient-to-b from-[#006D77] to-[#004a51] rounded-xl shadow-lg border border-slate-200 overflow-hidden text-white flex flex-col h-[calc(100vh-200px)] sticky top-24">
            <div className="p-5 border-b border-white/10">
              <h2 className="font-bold text-lg flex items-center gap-2"><Navigation size={18} /> Active Riders in Zone</h2>
              <p className="text-xs text-white/70 mt-1">Drag and drop to assign routes, or auto-assign.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {availableRiders.map((rider, i) => (
                <div key={i} className="bg-white/10 hover:bg-white/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm transition cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{rider.name}</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-green-500/20 text-green-300 rounded">{rider.eta}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/70 mb-3">
                    <span className="flex items-center gap-1"><Truck size={12} /> {rider.vehicle}</span>
                    <span>Max {rider.loadLimit}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                      <span>Vehicle Capacity</span>
                      <span>{rider.capacity} Full</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFB703] rounded-full" style={{ width: rider.capacity }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-white/10 bg-black/20">
              <button className="w-full bg-[#FFB703] hover:bg-[#e5a400] text-slate-900 py-3 rounded-lg font-black text-sm uppercase tracking-widest shadow-xl transition">
                Auto-Optimize & Assign All
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'pending' && (
        <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <Map size={48} className="text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Live Routing View</h2>
          <p className="text-slate-500 max-w-md">Connect to the Google Maps API in the next phase to render live rider locations and partner handoff statuses.</p>
        </div>
      )}
    </div>
  );
}
