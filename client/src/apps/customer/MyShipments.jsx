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
    <div className="max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Shipments</h1>
        <p className="text-slate-600">Manage and track your full booking history.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select className="border border-slate-300 rounded-md text-sm px-3 py-2 text-slate-700 bg-white outline-none focus:border-[#00767C]">
              <option>All Statuses</option>
              <option>In Transit</option>
              <option>Completed</option>
              <option>Cancelled</option>
              <option>Processing</option>
            </select>
            <input type="date" className="border border-slate-300 rounded-md text-sm px-3 py-2 text-slate-700 outline-none focus:border-[#00767C]" />
            <span className="text-slate-400">-</span>
            <input type="date" className="border border-slate-300 rounded-md text-sm px-3 py-2 text-slate-700 outline-none focus:border-[#00767C]" />
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Tracking ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-full outline-none focus:border-[#00767C]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tracking ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="animate-spin mx-auto mb-2 text-[#00767C]" size={24} />
                    Loading shipments...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
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
                    <tr key={shipment._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 font-medium text-slate-900">
                          <StatusIcon size={18} className="text-[#00767C]" />
                          {shipment.trackingId}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <span>{originStr}</span>
                          <ChevronRight size={14} className="text-slate-300" />
                          <span className="font-medium text-slate-900">{destStr}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                          {shipment.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => navigate(`/track/${shipment.trackingId}`)} className="border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 px-4 py-1.5 rounded text-xs font-bold transition-colors">
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
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div>Showing 1 to {filteredShipments.length} of {shipments.length} entries</div>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-medium">Prev</button>
            <button className="px-3 py-1 border border-slate-300 rounded bg-slate-50 text-slate-700 font-medium">1</button>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 text-slate-700 font-medium">2</button>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 text-slate-700 font-medium">3</button>
            <button className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 text-slate-700 font-medium">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
