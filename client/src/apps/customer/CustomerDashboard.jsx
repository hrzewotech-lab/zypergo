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
    <div className="max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, Logistics Team</h1>
        <p className="text-slate-600">Overview of your current shipping pipeline.</p>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* In Transit */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-slate-700">In Transit</h3>
            <Truck className="text-[#00767C]" size={20} />
          </div>
          <div>
            <div className="text-4xl font-black text-slate-900 mb-2">{stats.inTransit}</div>
            <div className="text-xs font-medium text-[#00767C] flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              +5% this week
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Pending</h3>
            <Calendar className="text-amber-600" size={20} />
          </div>
          <div>
            <div className="text-4xl font-black text-slate-900 mb-2">{stats.pending}</div>
            <div className="text-xs font-medium text-slate-500">
              Requires action
            </div>
          </div>
        </div>

        {/* Delivered */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Delivered</h3>
            <CheckCircle2 className="text-[#4AD6A1]" size={20} />
          </div>
          <div>
            <div className="text-4xl font-black text-slate-900 mb-2">{stats.delivered}</div>
            <div className="text-xs font-medium text-slate-500">
              Last 30 days
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider text-[11px]">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => navigate('/booking')} className="w-full bg-[#00767C] text-white py-2.5 rounded font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#005a5e] transition-colors">
              <Plus size={16} /> New Booking
            </button>
            <button onClick={() => navigate('/track')} className="w-full bg-white border border-slate-300 text-[#00767C] py-2.5 rounded font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
              <Target size={16} /> Track Parcel
            </button>
          </div>
        </div>
      </div>

      {/* Recent Shipments Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Recent Shipments</h2>
          <Link to="/shipments" className="text-sm font-medium text-[#00767C] hover:text-[#005a5e] flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Shipment ID</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">ETA</th>
                <th className="px-6 py-4">Action</th>
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
                      <td className="px-6 py-4 font-medium">
                        <Link to={`/track/${shipment.trackingId}`} className="text-[#00767C] hover:underline">
                          {shipment.trackingId}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <MapPin size={14} className="text-slate-400" />
                          {shipment.dropLocation?.city || shipment.dropLocation?.pincode || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                          {shipment.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{shipment.eta || 'N/A'}</td>
                      <td className="px-6 py-4"></td>
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
