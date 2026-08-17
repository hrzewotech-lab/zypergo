import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, XCircle, Package, Search, ChevronRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

export default function MyShipments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/bookings/my-shipments');
        if (res.data && res.data.success) {
          setShipments(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch shipments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  const getStatusIcon = (status) => {
    if (!status) return Truck;
    if (status.includes('Cancelled')) return XCircle;
    if (status.includes('Delivered')) return CheckCircle2;
    if (status.includes('Pending') || status.includes('Confirmed')) return Package;
    return Truck;
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (status.includes('Cancelled')) return 'bg-red-100 text-red-700 border-red-200';
    if (status.includes('Delivered')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (status.includes('Pending') || status.includes('Confirmed')) return 'bg-[#FFB703]/20 text-[#b58200] border-[#FFB703]/30';
    return 'bg-[#006D77]/10 text-[#006D77] border-[#006D77]/20';
  };

  // Filter shipments based on search term
  const filteredShipments = shipments.filter(s => 
    s.trackingId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-full flex flex-col font-sans pb-24 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="bg-[#006D77] px-6 py-8 rounded-b-[2.5rem] shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute right-0 top-0 opacity-10">
          <Package size={120} className="text-white transform rotate-12 translate-x-4 -translate-y-4" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white mb-2">My Shipments</h1>
            <p className="text-teal-100 text-sm font-medium">Track and manage your orders</p>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="px-4 -mt-6 relative z-20 mb-2">
        <div className="bg-white rounded-2xl shadow-md p-2 flex items-center border border-slate-100">
          <Search className="text-slate-400 ml-2" size={20} />
          <input 
            type="text" 
            placeholder="Search Tracking ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none px-3 py-2 text-sm font-bold text-slate-800"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 overflow-y-auto space-y-4 pt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="font-bold text-sm">Loading shipments...</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Package className="mb-4 opacity-50" size={48} />
            <p className="font-bold text-sm">No shipments found</p>
          </div>
        ) : (
          filteredShipments.map(shipment => {
            const StatusIcon = getStatusIcon(shipment.status);
            const statusColor = getStatusColor(shipment.status);
            const originStr = shipment.pickupLocation?.city || shipment.pickupLocation?.address?.split(',')[0] || 'Origin';
            const destStr = shipment.dropLocation?.city || shipment.dropLocation?.address?.split(',')[0] || 'Destination';
            const date = new Date(shipment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <div 
                key={shipment._id} 
                onClick={() => navigate(`/order/${shipment.trackingId}`)} 
                className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${statusColor}`}>
                      <StatusIcon size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">{date}</p>
                      <h3 className="font-black text-slate-900 text-sm">{shipment.trackingId}</h3>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusColor}`}>
                    {shipment.status || 'Unknown'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">From</p>
                    <p className="font-bold text-slate-800 text-xs truncate">{originStr}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 shrink-0" />
                  <div className="flex-1 text-right min-w-0">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">To</p>
                    <p className="font-bold text-slate-800 text-xs truncate">{destStr}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
