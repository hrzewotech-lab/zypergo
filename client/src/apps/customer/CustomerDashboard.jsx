import React, { useState, useEffect } from 'react';
import { Truck, Calendar, CheckCircle2, Plus, Target, MapPin, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    inTransit: 0,
    pending: 0,
    delivered: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/bookings/my-shipments');
        if (res.data && res.data.success) {
          const fetchedShipments = res.data.data;
          setShipments(fetchedShipments.slice(0, 5)); // Keep recent 5 for table
          
          // Compute stats
          let inTransitCount = 0;
          let pendingCount = 0;
          let deliveredCount = 0;
          
          fetchedShipments.forEach(shipment => {
            const status = shipment.status || '';
            if (status.includes('Transit') || status.includes('Way') || status.includes('Picked Up')) {
              inTransitCount++;
            } else if (status === 'Pending' || status.includes('Confirmed') || status.includes('Assigned')) {
              pendingCount++;
            } else if (status === 'Delivered') {
              deliveredCount++;
            }
          });
          
          setStats({ inTransit: inTransitCount, pending: pendingCount, delivered: deliveredCount });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-6 px-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tight">Welcome back, Logistics Team</h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium">Overview of your current shipping pipeline.</p>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* In Transit */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-5px_rgba(251,92,0,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-[#fb5c00]/5 to-[#fb5c00]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">In Transit</h3>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fb5c00]/10 to-[#fb5c00]/20 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-300">
              <Truck className="text-[#fb5c00]" size={20} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{stats.inTransit}</div>
            <div className="text-xs font-bold text-[#fb5c00] flex items-center gap-1 bg-[#fb5c00]/10 w-fit px-2 py-1 rounded-md">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              +5% this week
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-5px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Pending</h3>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/20 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-300">
              <Calendar className="text-amber-600" size={20} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{stats.pending}</div>
            <div className="text-xs font-bold text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-md">
              Requires action
            </div>
          </div>
        </div>

        {/* Delivered */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-5px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Delivered</h3>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-300">
              <CheckCircle2 className="text-emerald-500" size={20} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{stats.delivered}</div>
            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
              Last 30 days
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#fb5c00]/5 to-[#fb5c00]/10 border border-[#fb5c00]/20 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-black text-[#fb5c00] mb-4 uppercase tracking-widest flex items-center gap-2">
            <Target size={14} /> Quick Actions
          </h3>
          <div className="space-y-3 relative z-10">
            <button onClick={() => navigate('/booking')} className="w-full bg-[#fb5c00] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#fb5c00]/30 hover:bg-[#e05200] active:scale-95 transition-all duration-300">
              <Plus size={18} /> New Booking
            </button>
            <button onClick={() => navigate('/track')} className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white hover:text-[#fb5c00] hover:border-[#fb5c00]/30 active:scale-95 transition-all duration-300 shadow-sm">
              <MapPin size={18} /> Track Parcel
            </button>
          </div>
        </div>
      </div>

      {/* Recent Shipments Table */}
      <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-slate-100/50 bg-white/50">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Recent Shipments</h2>
          <Link to="/shipments" className="text-sm font-bold text-[#fb5c00] hover:text-[#e05200] flex items-center gap-1 bg-[#fb5c00]/10 px-3 py-1.5 rounded-full hover:bg-[#fb5c00]/20 transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto pb-2 sm:pb-0">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-5 sm:px-6 py-4">Shipment ID</th>
                <th className="px-5 sm:px-6 py-4">Destination</th>
                <th className="px-5 sm:px-6 py-4">Status</th>
                <th className="px-5 sm:px-6 py-4">ETA</th>
                <th className="px-5 sm:px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading shipments...</td></tr>
              ) : shipments.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No recent shipments found. Create a new booking!</td></tr>
              ) : (
                shipments.map((shipment) => {
                  let statusColor = 'bg-slate-100 text-slate-700';
                  if (shipment.status?.includes('Transit') || shipment.status?.includes('Way')) statusColor = 'bg-teal-100 text-teal-700';
                  else if (shipment.status?.includes('Pending') || shipment.status?.includes('Assigned')) statusColor = 'bg-amber-100 text-amber-700';
                  else if (shipment.status === 'Delivered') statusColor = 'bg-green-100 text-green-700';
                  else if (shipment.status === 'Cancelled') statusColor = 'bg-red-100 text-red-700';

                  return (
                    <tr key={shipment._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 sm:px-6 py-4 font-bold">
                        <Link to={`/track/${shipment.trackingId}`} className="text-slate-800 hover:text-[#fb5c00] transition-colors flex items-center gap-2">
                          {shipment.trackingId}
                        </Link>
                      </td>
                      <td className="px-5 sm:px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <MapPin size={14} className="text-slate-400" />
                          {shipment.dropLocation?.city || shipment.dropLocation?.pincode || 'N/A'}
                        </div>
                      </td>
                      <td className="px-5 sm:px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                          {shipment.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-5 sm:px-6 py-4 text-slate-500 font-medium">{shipment.eta || 'N/A'}</td>
                      <td className="px-5 sm:px-6 py-4">
                        <Link to={`/track/${shipment.trackingId}`} className="p-2 bg-slate-50 hover:bg-[#fb5c00]/10 text-slate-400 hover:text-[#fb5c00] rounded-xl flex items-center justify-center transition-colors w-fit">
                          <ArrowRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
