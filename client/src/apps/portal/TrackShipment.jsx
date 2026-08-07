import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Package, CheckCircle2, Truck, Box, Navigation, ArrowRight, Share2 } from 'lucide-react';

export default function TrackShipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(id || '');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-search if ID is in URL
  useEffect(() => {
    if (id) {
      handleSearch(null, id);
    }
  }, [id]);

  const handleSearch = async (e, forceId = null) => {
    if (e) e.preventDefault();
    const searchId = forceId || trackingId;
    if (!searchId) return;

    setLoading(true);
    setError('');
    
    try {
      // Re-use partner scan API which fetches public shipment data by trackingId
      // In production, you'd want a separate public unauthenticated endpoint.
      const res = await fetch('/api/partner/shipments/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId: searchId })
      });
      const data = await res.json();
      if (res.ok) {
        setShipment(data.data);
        if (!forceId) navigate(`/track/${searchId}`);
      } else {
        setError('Tracking ID not found. Please check and try again.');
        setShipment(null);
      }
    } catch (err) {
      setError('Network error. Could not connect to tracking server.');
    } finally {
      setLoading(false);
    }
  };

  const statusMilestones = [
    { name: 'Booking Confirmed', icon: <Package size={20}/> },
    { name: 'Rider Assigned', icon: <User size={20}/> },
    { name: 'Picked Up', icon: <Box size={20}/> },
    { name: 'In Transit', icon: <Truck size={20}/> },
    { name: 'Out for Delivery', icon: <Navigation size={20}/> },
    { name: 'Delivered', icon: <CheckCircle2 size={20}/> }
  ];

  return (
    <div className="flex-1 bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Track Your Shipment</h1>
          <p className="text-slate-600">Enter your ZyperGo tracking ID or AWB number to see live updates.</p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md border border-slate-200 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                placeholder="e.g. ZYP12345678"
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-[#006D77] outline-none font-mono font-bold text-lg uppercase transition-colors"
              />
            </div>
            <button type="submit" disabled={loading || !trackingId} className="bg-[#0F172A] text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition shadow-lg">
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
          {error && <p className="text-red-500 font-bold mt-4 text-center text-sm">{error}</p>}
        </div>

        {/* Tracking Results */}
        {shipment && (
          <div className="bg-white rounded-2xl shadow-md border border-[#006D77]/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="bg-[#0F172A] p-6 text-white flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tracking Number</p>
                <h2 className="text-2xl font-black font-mono tracking-wide">{shipment.trackingId}</h2>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FFB703] text-[#0F172A]`}>
                  {shipment.status}
                </span>
                <p className="text-sm mt-2 text-slate-300">Expected: {new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Route Summary */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="text-center w-1/3">
                <p className="text-xs font-bold text-slate-400 uppercase">Origin</p>
                <p className="text-lg font-black text-slate-800">{shipment.pickupLocation?.pincode}</p>
              </div>
              <div className="flex-1 flex items-center justify-center text-slate-300">
                <div className="h-0.5 w-full bg-slate-200"></div>
                <Truck size={24} className="text-[#006D77] mx-2 shrink-0"/>
                <div className="h-0.5 w-full bg-slate-200"></div>
              </div>
              <div className="text-center w-1/3">
                <p className="text-xs font-bold text-slate-400 uppercase">Destination</p>
                <p className="text-lg font-black text-slate-800">{shipment.dropLocation?.pincode}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-8 pb-12">
              <h3 className="font-bold text-slate-900 mb-6">Tracking Timeline</h3>
              <div className="space-y-0 relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-4 bottom-4 w-1 bg-slate-100 z-0"></div>
                
                {shipment.trackingHistory?.map((history, idx) => {
                  const isLatest = idx === shipment.trackingHistory.length - 1;
                  return (
                    <div key={idx} className="relative z-10 flex gap-6 items-start">
                      <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center shrink-0 ${isLatest ? 'bg-[#006D77] text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                        {isLatest ? <CheckCircle2 size={20}/> : <div className="w-2 h-2 rounded-full bg-slate-400"></div>}
                      </div>
                      <div className={`pt-2 pb-8 ${!isLatest && 'opacity-60'}`}>
                        <h4 className={`font-bold ${isLatest ? 'text-[#006D77] text-lg' : 'text-slate-700'}`}>{history.status}</h4>
                        <p className="text-sm text-slate-500 mt-1">{history.description}</p>
                        <p className="text-xs text-slate-400 mt-1 font-mono">{new Date(history.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support CTA */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800">Need help with this shipment?</p>
                <p className="text-xs text-slate-500">Our support team is available 24/7.</p>
              </div>
              <button className="text-[#006D77] font-bold text-sm bg-white border border-slate-200 px-4 py-2 rounded shadow-sm hover:bg-slate-50 flex items-center gap-2">
                Contact Support <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Mock User Icon missing from lucide-react import
function User(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
