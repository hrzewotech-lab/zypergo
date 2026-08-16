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
    if (!status) return 'bg-slate-100 text-slate-700';
    if (status.includes('Cancelled')) return 'bg-red-100 text-red-700';
    if (status.includes('Delivered')) return 'bg-green-100 text-green-700';
    if (status.includes('Pending') || status.includes('Confirmed')) return 'bg-amber-100 text-amber-700';
    return 'bg-teal-100 text-teal-700';
  };

  // Filter shipments based on search term
  const filteredShipments = shipments.filter(s => 
    s.trackingId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-6 relative overflow-hidden bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-[#fb5c00]/10 to-[#fb5c00]/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black mb-1 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#fb5c00] to-orange-400 drop-shadow-sm">My Shipments</h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Manage and track your full booking history.</p>
          </div>
          <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-md items-center justify-center shadow-sm border border-white/60 group hover:rotate-12 hover:scale-110 transition-all duration-300">
            <Package size={28} className="text-[#fb5c00] group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-100/50 bg-white/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <select className="w-full sm:w-auto border border-white/60 rounded-2xl text-sm px-4 py-2.5 text-slate-700 bg-white/60 backdrop-blur-md outline-none focus:bg-white focus:border-[#fb5c00] focus:ring-4 focus:ring-[#fb5c00]/10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300">
              <option>All Statuses</option>
              <option>In Transit</option>
              <option>Completed</option>
              <option>Cancelled</option>
              <option>Processing</option>
            </select>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input type="date" className="w-full sm:w-auto border border-white/60 rounded-2xl text-sm px-3 py-2.5 text-slate-700 bg-white/60 backdrop-blur-md outline-none focus:bg-white focus:border-[#fb5c00] focus:ring-4 focus:ring-[#fb5c00]/10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300" />
              <span className="text-slate-400 font-black">-</span>
              <input type="date" className="w-full sm:w-auto border border-white/60 rounded-2xl text-sm px-3 py-2.5 text-slate-700 bg-white/60 backdrop-blur-md outline-none focus:bg-white focus:border-[#fb5c00] focus:ring-4 focus:ring-[#fb5c00]/10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300" />
            </div>
          </div>
          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#fb5c00] transition-colors duration-300" size={18} />
            <input 
              type="text" 
              placeholder="Search Tracking ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 border border-white/60 rounded-2xl text-sm w-full bg-white/60 backdrop-blur-md outline-none focus:bg-white focus:border-[#fb5c00] focus:ring-4 focus:ring-[#fb5c00]/10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 font-medium"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto pb-2 sm:pb-0">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50/50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-5 sm:px-6 py-4">Tracking ID</th>
                <th className="px-5 sm:px-6 py-4">Date</th>
                <th className="px-5 sm:px-6 py-4">Route</th>
                <th className="px-5 sm:px-6 py-4">Status</th>
                <th className="px-5 sm:px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-500">
                    <Loader2 className="animate-spin mx-auto mb-3 text-[#fb5c00]" size={28} />
                    <span className="font-medium tracking-wide">Loading shipments...</span>
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-500 font-medium">
                    No shipments found.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => {
                  const StatusIcon = getStatusIcon(shipment.status);
                  const statusColor = getStatusColor(shipment.status);
                  const date = new Date(shipment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const originStr = shipment.pickupLocation?.city || shipment.pickupLocation?.pincode || 'Origin';
                  const destStr = shipment.dropLocation?.city || shipment.dropLocation?.pincode || 'Destination';

                  return (
                    <tr key={shipment._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 sm:px-6 py-4">
                        <div className="flex items-center gap-3 font-bold text-slate-800">
                          <StatusIcon size={18} className="text-[#fb5c00]" />
                          {shipment.trackingId}
                        </div>
                      </td>
                      <td className="px-5 sm:px-6 py-4 text-slate-500 font-medium">{date}</td>
                      <td className="px-5 sm:px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <span>{originStr}</span>
                          <ChevronRight size={14} className="text-slate-300" />
                          <span className="font-bold text-slate-800">{destStr}</span>
                        </div>
                      </td>
                      <td className="px-5 sm:px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                          {shipment.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-5 sm:px-6 py-4 text-right">
                        <button onClick={() => navigate(`/track/${shipment.trackingId}`)} className="bg-slate-100 text-slate-600 hover:bg-[#fb5c00] hover:text-white hover:shadow-md hover:shadow-[#fb5c00]/20 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300">
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-5 border-t border-slate-100/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 bg-white/50">
          <div className="font-medium">Showing 1 to {filteredShipments.length} of {shipments.length} entries</div>
          <div className="flex items-center gap-2">
            <button className="px-3 sm:px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold transition-colors shadow-sm">Prev</button>
            <button className="hidden sm:block w-10 h-10 border border-[#fb5c00] rounded-xl bg-[#fb5c00] text-white font-bold shadow-md shadow-[#fb5c00]/20">1</button>
            <button className="hidden sm:block w-10 h-10 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-bold transition-colors shadow-sm bg-white/80">2</button>
            <button className="hidden sm:block w-10 h-10 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-bold transition-colors shadow-sm bg-white/80">3</button>
            <button className="px-3 sm:px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition-colors shadow-sm bg-white/80">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
